import { TestManager } from '../../utils/test-manager';
import { HttpStatus } from '@nestjs/common';
import {
  Project,
  PROJECT_PRICE_TYPE,
  PROJECT_SIZE_FILTER,
} from '@shared/entities/projects.entity';
import { Country } from '@shared/entities/country.entity';
import { projectsContract } from '@shared/contracts/projects.contract';
import { ECOSYSTEM } from '@shared/entities/ecosystem.enum';
import { RESTORATION_ACTIVITY_SUBTYPE } from '@shared/entities/activity.enum';

// Temporarily skip until v2 validated
describe.skip('Project Map', () => {
  let testManager: TestManager;

  beforeAll(async () => {
    testManager = await TestManager.createTestManager();
    await testManager.ingestCountries();
  });

  afterEach(async () => {
    await testManager.clearTablesByEntities([Project]);
  });

  afterAll(async () => {
    await testManager.clearDatabase();
    await testManager.close();
  });

  test('Should return unique country geometries, with project cost aggregated values', async () => {
    const countries = await testManager
      .getDataSource()
      .getRepository(Country)
      .find({ take: 2 });

    for (const [index, country] of Object.entries(countries)) {
      await testManager.mocks().createProject({
        countryCode: country.code,
        totalCost: 1000 + parseInt(index),
        abatementPotential: 2000 + parseInt(index),
      });
      await testManager.mocks().createProject({
        countryCode: country.code,
        totalCost: 1000 + parseInt(index),
        abatementPotential: 2000 + parseInt(index),
      });
    }

    const response = await testManager
      .request()
      .get(projectsContract.getProjectsMap.path);

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.features.length).toBe(2);
    expect(response.body.features[0].properties.cost).toBe(2000);
    expect(response.body.features[0].properties.abatementPotential).toBe(4000);
    expect(response.body.features[1].properties.cost).toBe(2002);
    expect(response.body.features[1].properties.abatementPotential).toBe(4002);
  });

  test('Should return the aggregated values for the filtered projects', async () => {
    const mangroveProjectInSpain1 = await testManager.mocks().createProject({
      countryCode: 'ESP',
      totalCost: 1111,
      abatementPotential: 2222,
      ecosystem: ECOSYSTEM.MANGROVE,
    });
    const mangroveProjectInSpain2 = await testManager.mocks().createProject({
      countryCode: 'ESP',
      totalCost: 3333,
      abatementPotential: 4444,
      ecosystem: ECOSYSTEM.MANGROVE,
    });
    const seagrassProjectInSpain = await testManager.mocks().createProject({
      countryCode: 'ESP',
      totalCost: 5555,
      abatementPotential: 6666,
      ecosystem: ECOSYSTEM.SEAGRASS,
    });
    const mangroveProjectInPortugal = await testManager.mocks().createProject({
      countryCode: 'PRT',
      totalCost: 7777,
      abatementPotential: 8888,
      ecosystem: ECOSYSTEM.MANGROVE,
    });
    const seagrassProjectInPortugal = await testManager.mocks().createProject({
      countryCode: 'PRT',
      totalCost: 9999,
      abatementPotential: 10000,
      ecosystem: ECOSYSTEM.SEAGRASS,
    });

    const response = await testManager
      .request()
      .get(projectsContract.getProjectsMap.path)
      .query({ filter: { ecosystem: [ECOSYSTEM.MANGROVE] } });

    expect(response.body.features).toHaveLength(2);
    expect(response.body.features[0].properties.cost).toBe(
      mangroveProjectInSpain1.totalCost + mangroveProjectInSpain2.totalCost,
    );
    expect(response.body.features[1].properties.abatementPotential).toBe(
      mangroveProjectInPortugal.abatementPotential,
    );
  });

  test('Should return the aggregated values for the filtered abatement potential', async () => {
    const countries = await testManager
      .getDataSource()
      .getRepository(Country)
      .find({ take: 2 });

    /**
     * The country projects created are as follows:
     *              abatement_potential     total_cost
     * C1_P1:             2000                1000
     * C1_P2:             2000                1000
     * C2_P1:             2010                1001
     * C2_P2:             2020                1001
     */
    for (const [index, country] of Object.entries(countries)) {
      await testManager.mocks().createProject({
        countryCode: country.code,
        totalCost: 1000 + parseInt(index),
        abatementPotential: 2000 + parseInt(index) * 10,
      });
      await testManager.mocks().createProject({
        countryCode: country.code,
        totalCost: 1000 + parseInt(index),

        abatementPotential: 2000 + parseInt(index) * 20,
      });
    }

    // Select only the projects with abatement potential
    // between 2000 and 2010 from each country
    const response = await testManager
      .request()
      .get(projectsContract.getProjectsMap.path)
      .query({ abatementPotentialRange: [2000, 2010] });

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.features.length).toBe(2);
    // First country should contain both projects
    expect(response.body.features[0].properties.cost).toBe(2000);
    expect(response.body.features[0].properties.abatementPotential).toBe(4000);
    // Second country should contain only the first project
    expect(response.body.features[1].properties.cost).toBe(1001);
    expect(response.body.features[1].properties.abatementPotential).toBe(2010);
  });

  test('Should return the aggregated values for the filtered total cost', async () => {
    const countries = await testManager
      .getDataSource()
      .getRepository(Country)
      .find({ take: 2 });

    /**
     * The country projects created are as follows:
     *              abatement_potential     total_cost   total_cost_npv
     * C1_P1:             2000                1000          1000
     * C1_P2:             2000                1000          1000
     * C2_P1:             2010                1001          1001
     * C2_P2:             2020                1001          1001
     */
    for (const [index, country] of Object.entries(countries)) {
      await testManager.mocks().createProject({
        countryCode: country.code,
        totalCost: 1000 + parseInt(index),
        totalCostNPV: 1000 + parseInt(index),
        abatementPotential: 2000 + parseInt(index) * 10,
      });
      await testManager.mocks().createProject({
        countryCode: country.code,
        totalCost: 1000 + parseInt(index),
        totalCostNPV: 1000 + parseInt(index),
        abatementPotential: 2000 + parseInt(index) * 20,
      });
    }

    // Select only the projects with nvp cost of 1000
    const response = await testManager
      .request()
      .get(projectsContract.getProjectsMap.path)
      .query({
        costRange: [1000, 1000],
        costRangeSelector: 'npv',
      });

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.features.length).toBe(1);
    // First country should contain both projects
    expect(response.body.features[0].properties.cost).toBe(2000);
    expect(response.body.features[0].properties.abatementPotential).toBe(4000);
  });

  test('Should return the geometries of the countries filtered by country code', async () => {
    const countries = await testManager
      .getDataSource()
      .getRepository(Country)
      .find({ take: 4 });

    const savedProjects: Project[] = [];

    for (const [index, country] of Object.entries(countries)) {
      const project = await testManager.mocks().createProject({
        countryCode: country.code,
        totalCost: 1000 + parseInt(index),
        abatementPotential: 2000 + parseInt(index),
      });
      savedProjects.push(project);
    }

    const response = await testManager
      .request()
      .get(projectsContract.getProjectsMap.path)
      .query({
        filter: { countryCode: [countries[0].code, countries[1].code] },
      });

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.features.length).toBe(2);
    expect(response.body.features[0].properties.country).toBe(
      countries[0].name,
    );
    expect(response.body.features[1].properties.country).toBe(
      countries[1].name,
    );
  });

  test('Should return the geometries of the countries filtered by priceType', async () => {
    const countries = await testManager
      .getDataSource()
      .getRepository(Country)
      .find({ take: 2 });

    await Promise.all([
      testManager.mocks().createProject({
        priceType: PROJECT_PRICE_TYPE.OPEX_BREAKEVEN,
        countryCode: countries[0].code,
      }),
      testManager.mocks().createProject({
        priceType: PROJECT_PRICE_TYPE.TOTAL_COST_BREAKEVEN,
        countryCode: countries[1].code,
      }),
    ]);

    const response = await testManager
      .request()
      .get(projectsContract.getProjectsMap.path)
      .query({
        filter: { priceType: [PROJECT_PRICE_TYPE.TOTAL_COST_BREAKEVEN] },
      });

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.features).toHaveLength(1);
    expect(response.body.features[0].properties.country).toBe(
      countries[1].name,
    );
  });

  test('Should return the geometries of the countries filtered by projectSizeFilter', async () => {
    const countries = await testManager
      .getDataSource()
      .getRepository(Country)
      .find({ take: 2 });

    await Promise.all([
      testManager.mocks().createProject({
        projectSizeFilter: PROJECT_SIZE_FILTER.MEDIUM,
        priceType: PROJECT_PRICE_TYPE.OPEX_BREAKEVEN,
        countryCode: countries[0].code,
      }),
      testManager.mocks().createProject({
        projectSizeFilter: PROJECT_SIZE_FILTER.SMALL,
        priceType: PROJECT_PRICE_TYPE.TOTAL_COST_BREAKEVEN,
        countryCode: countries[1].code,
      }),
    ]);

    const response = await testManager
      .request()
      .get(projectsContract.getProjectsMap.path)
      .query({
        filter: {
          projectSizeFilter: [PROJECT_SIZE_FILTER.SMALL],
        },
      });

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.features).toHaveLength(1);
    expect(response.body.features[0].properties.country).toBe(
      countries[1].name,
    );
  });

  test('Should return the geometries of the countries filtered by partialProjectName', async () => {
    const countries = await testManager
      .getDataSource()
      .getRepository(Country)
      .find({ take: 1 });

    await Promise.all([
      testManager.mocks().createProject({
        projectName: 'MyProjectName',
        projectSizeFilter: PROJECT_SIZE_FILTER.MEDIUM,
        priceType: PROJECT_PRICE_TYPE.OPEX_BREAKEVEN,
        countryCode: countries[0].code,
      }),
      testManager.mocks().createProject({
        projectName: 'ShouldNotBeReturned',
        projectSizeFilter: PROJECT_SIZE_FILTER.MEDIUM,
        priceType: PROJECT_PRICE_TYPE.OPEX_BREAKEVEN,
        countryCode: countries[0].code,
      }),
    ]);

    const response = await testManager
      .request()
      .get(projectsContract.getProjectsMap.path)
      .query({
        partialProjectName: 'myproject',
      });

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.features).toHaveLength(1);
    expect(response.body.features[0].properties.country).toBe(
      countries[0].name,
    );
  });

  test('Should return the geometries of the countries filtered by restoration activity subtype', async () => {
    const countries = await testManager
      .getDataSource()
      .getRepository(Country)
      .find({ take: 3 });

    await Promise.all([
      testManager.mocks().createProject({
        restorationActivity: RESTORATION_ACTIVITY_SUBTYPE.PLANTING,
        countryCode: countries[0].code,
      }),
      testManager.mocks().createProject({
        restorationActivity: RESTORATION_ACTIVITY_SUBTYPE.HYBRID,
        countryCode: countries[1].code,
      }),
      testManager.mocks().createProject({
        restorationActivity: RESTORATION_ACTIVITY_SUBTYPE.HYDROLOGY,
        countryCode: countries[2].code,
      }),
    ]);

    const response = await testManager
      .request()
      .get(projectsContract.getProjectsMap.path)
      .query({
        filter: {
          restorationActivity: [
            RESTORATION_ACTIVITY_SUBTYPE.HYBRID,
            RESTORATION_ACTIVITY_SUBTYPE.HYDROLOGY,
          ],
        },
      });

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.features).toHaveLength(2);
    expect(response.body.features[0].properties.country).toBe(
      countries[1].name,
    );
    expect(response.body.features[1].properties.country).toBe(
      countries[2].name,
    );
  });
});
