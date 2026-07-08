import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Project } from '@shared/entities/projects.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  OtherProjectFilters,
  ProjectMap,
  ProjectFilters,
} from '@shared/dtos/projects/projects-map.dto';

@Injectable()
export class ProjectsMapRepository extends Repository<Project> {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {
    super(projectRepo.target, projectRepo.manager, projectRepo.queryRunner);
  }

  async getProjectsMap(
    filters?: ProjectFilters,
    otherFilters?: OtherProjectFilters,
  ): Promise<ProjectMap> {
    const geoQueryBuilder = this.manager.createQueryBuilder();
    geoQueryBuilder
      .select(
        `
    json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(
            json_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(country.geometry)::jsonb, 
                'properties', json_build_object(
                    'country', country.name,
                    'abatementPotential', filtered_projects.total_abatement_potential,
                    'cost', filtered_projects.total_cost
                )
            )
        )
    ) as geojson
    `,
      )
      .from('countries', 'country')
      .innerJoin(
        (subQuery) => {
          subQuery
            .select('p.country_code')
            .from(Project, 'p')
            .addSelect(
              'SUM(p.abatement_potential)',
              'total_abatement_potential',
            )
            .groupBy('p.country_code');

          return this.applyFilters(subQuery, filters, otherFilters);
        },
        'filtered_projects',
        'filtered_projects.country_code = country.code',
      );

    const { geojson } = await geoQueryBuilder.getRawOne<{
      geojson: ProjectMap;
    }>();
    return geojson;
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Project>,
    filters: ProjectFilters = {},
    otherFilters: OtherProjectFilters = {},
  ) {
    const {
      countryCode,
      totalCost,
      abatementPotential,
      activity,
      restorationActivity,
      ecosystem,
      projectSizeFilter,
      priceType,
    } = filters;
    const {
      costRange,
      abatementPotentialRange,
      costRangeSelector,
      partialProjectName,
    } = otherFilters;

    if (partialProjectName) {
      queryBuilder.andWhere('p.project_name ILIKE :partialProjectName', {
        partialProjectName: `%${partialProjectName}%`,
      });
    }

    if (projectSizeFilter) {
      queryBuilder.andWhere(
        'p.project_size_filter IN (:...projectSizeFilter)',
        {
          projectSizeFilter,
        },
      );
    }

    if (priceType) {
      queryBuilder.andWhere('p.price_type IN (:...priceType)', {
        priceType,
      });
    }

    if (costRangeSelector === 'npv') {
      queryBuilder.addSelect('SUM(p.total_cost_npv)', 'total_cost');
    } else {
      queryBuilder.addSelect('SUM(p.total_cost)', 'total_cost');
    }

    if (countryCode?.length) {
      queryBuilder.andWhere('p.countryCode IN (:...countryCodes)', {
        countryCodes: countryCode,
      });
    }
    if (totalCost?.length) {
      const maxTotalCost = Math.max(...totalCost);
      queryBuilder.andWhere('p.totalCost <= :maxTotalCost', {
        maxTotalCost,
      });
    }
    if (abatementPotential?.length) {
      const maxAbatementPotential = Math.max(...abatementPotential);
      queryBuilder.andWhere('p.abatementPotential <= :maxAbatementPotential', {
        maxAbatementPotential,
      });
    }
    if (activity) {
      queryBuilder.andWhere('p.activity IN (:...activity)', {
        activity,
      });
    }
    if (restorationActivity?.length) {
      queryBuilder.andWhere(
        'p.restorationActivity IN (:...restorationActivity)',
        {
          restorationActivity,
        },
      );
    }

    if (ecosystem) {
      queryBuilder.andWhere('p.ecosystem IN (:...ecosystem)', {
        ecosystem,
      });
    }
    if (abatementPotentialRange) {
      queryBuilder.andWhere(
        'p.abatementPotential >= :minAP AND p.abatementPotential <= :maxAP',
        {
          minAP: Math.min(...abatementPotentialRange),
          maxAP: Math.max(...abatementPotentialRange),
        },
      );
    }

    if (costRange && costRangeSelector) {
      let filteredCostColumn: string;
      switch (costRangeSelector) {
        case 'npv':
          filteredCostColumn = 'p.totalCostNPV';
          break;
        case 'total':
        default:
          filteredCostColumn = 'p.totalCost';
          break;
      }

      queryBuilder.andWhere(
        `${filteredCostColumn} >= :minCost AND ${filteredCostColumn} <= :maxCost`,
        {
          minCost: Math.min(...costRange),
          maxCost: Math.max(...costRange),
        },
      );
    }

    return queryBuilder;
  }

  async getProjectsMapV2(
    projectIds: Project['id'][],
    costRangeSelector: 'npv' | 'total' = 'total',
  ): Promise<ProjectMap> {
    // Return empty FeatureCollection if no projects match the filter
    if (!projectIds || projectIds.length === 0) {
      return {
        type: 'FeatureCollection',
        features: [],
      };
    }

    // "Abatement potential" is the wrong term here, the correct one is "country_abatement_potential"
    const geoQueryBuilder = this.manager.createQueryBuilder();
    geoQueryBuilder
      .select(
        `
      json_build_object(
          'type', 'FeatureCollection',
          'features', json_agg(
              json_build_object(
                  'type', 'Feature',
                  'geometry', ST_AsGeoJSON(country.geometry)::jsonb, 
                  'properties', json_build_object(
                      'country', country.name,
                      'abatementPotential', filtered_projects.avg_abatement_potential,
                      'cost', filtered_projects.avg_weighted_cost
                  )
              )
          )
      ) as geojson
      `,
      )
      .from('countries', 'country')
      .innerJoin(
        (qb) => {
          const innerSubquery = this.manager
            .createQueryBuilder()
            .subQuery()
            .select('p.country_code', 'country_code')
            .addSelect(
              'MIN(p.country_abatement_potential)',
              'avg_abatement_potential',
            );
          if (costRangeSelector === 'total') {
            innerSubquery.addSelect(
              'AVG(p.cost_per_tco2e)',
              'avg_weighted_cost',
            );
          } else if (costRangeSelector === 'npv') {
            innerSubquery.addSelect(
              'AVG(p.cost_per_tco2e_npv)',
              'avg_weighted_cost',
            );
          }
          innerSubquery
            .from(Project, 'p')
            .innerJoin('countries', 'c', 'c.code = p.country_code')
            .where('p.id IN (:...projectIds)', { projectIds })
            .groupBy('p.country_code');

          const innerQuery = innerSubquery.getQuery();

          const outerQuery = qb
            .subQuery()
            .select('x.country_code', 'country_code')
            .addSelect(
              'SUM(x.avg_abatement_potential)',
              'avg_abatement_potential',
            )
            .addSelect(`AVG(x.avg_weighted_cost)`, 'avg_weighted_cost')
            .from(`${innerQuery}`, 'x')
            .groupBy('x.country_code');

          return outerQuery;
        },
        'filtered_projects',
        'filtered_projects.country_code = country.code',
      )
      .setParameters({
        projectIds: projectIds,
        costRangeSelector,
      });

    const { geojson } = await geoQueryBuilder.getRawOne<{
      geojson: ProjectMap;
    }>();

    return geojson;
  }
}
