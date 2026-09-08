import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { utils, WorkBook, write } from 'xlsx';
import { Country } from '@shared/entities/country.entity';
import { ProjectSize } from '@shared/entities/cost-inputs/project-size.entity';
import { FeasibilityAnalysis } from '@shared/entities/cost-inputs/feasability-analysis.entity';
import { ConservationPlanningAndAdmin } from '@shared/entities/cost-inputs/conservation-and-planning-admin.entity';
import { DataCollectionAndFieldCosts } from '@shared/entities/cost-inputs/data-collection-and-field-costs.entity';
import { CommunityRepresentation } from '@shared/entities/cost-inputs/community-representation.entity';
import { BlueCarbonProjectPlanning } from '@shared/entities/cost-inputs/blue-carbon-project-planning.entity';
import { CarbonRights } from '@shared/entities/cost-inputs/establishing-carbon-rights.entity';
import { FinancingCost } from '@shared/entities/cost-inputs/financing-cost.entity';
import { ValidationCost } from '@shared/entities/cost-inputs/validation.entity';
import { MonitoringCost } from '@shared/entities/cost-inputs/monitoring.entity';
import { Maintenance } from '@shared/entities/cost-inputs/maintenance.entity';
import { CommunityBenefitSharingFund } from '@shared/entities/cost-inputs/community-benefit-sharing-fund.entity';
import { BaselineReassessment } from '@shared/entities/cost-inputs/baseline-reassessment.entity';
import { MRV } from '@shared/entities/cost-inputs/mrv.entity';
import { LongTermProjectOperating } from '@shared/entities/cost-inputs/long-term-project-operating.entity';
import { CarbonStandardFees } from '@shared/entities/cost-inputs/carbon-standard-fees.entity';
import { CommunityCashFlow } from '@shared/entities/cost-inputs/community-cash-flow.entity';
import { EcosystemExtent } from '@shared/entities/carbon-inputs/ecosystem-extent.entity';
import { EcosystemLoss } from '@shared/entities/carbon-inputs/ecosystem-loss.entity';
import { RestorableLand } from '@shared/entities/carbon-inputs/restorable-land.entity';
import { SequestrationRate } from '@shared/entities/carbon-inputs/sequestration-rate.entity';
import { EmissionFactors } from '@shared/entities/carbon-inputs/emission-factors.entity';
import { ImplementationLaborCost } from '@shared/entities/cost-inputs/implementation-labor-cost.entity';
import { BaseSize } from '@shared/entities/base-size.entity';
import { BaseIncrease } from '@shared/entities/base-increase.entity';
import { ModelAssumptions } from '@shared/entities/model-assumptions.entity';

type ExportEntity =
  | Country
  | ProjectSize
  | FeasibilityAnalysis
  | ConservationPlanningAndAdmin
  | DataCollectionAndFieldCosts
  | CommunityRepresentation
  | BlueCarbonProjectPlanning
  | CarbonRights
  | FinancingCost
  | ValidationCost
  | MonitoringCost
  | Maintenance
  | CommunityBenefitSharingFund
  | BaselineReassessment
  | MRV
  | LongTermProjectOperating
  | CarbonStandardFees
  | CommunityCashFlow
  | EcosystemExtent
  | EcosystemLoss
  | RestorableLand
  | SequestrationRate
  | EmissionFactors
  | ImplementationLaborCost
  | BaseSize
  | BaseIncrease
  | ModelAssumptions;

interface RepositoryMapping {
  sheetName: string;
  repository: Repository<any>;
}

@Injectable()
export class ExportService {
  logger: Logger = new Logger(ExportService.name);

  private repositoryMappings: RepositoryMapping[];

  constructor(
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
    @InjectRepository(ProjectSize)
    private readonly projectSizeRepo: Repository<ProjectSize>,
    @InjectRepository(FeasibilityAnalysis)
    private readonly feasibilityAnalysisRepo: Repository<FeasibilityAnalysis>,
    @InjectRepository(ConservationPlanningAndAdmin)
    private readonly conservationPlanningAndAdminRepo: Repository<ConservationPlanningAndAdmin>,
    @InjectRepository(DataCollectionAndFieldCosts)
    private readonly dataCollectionAndFieldCostsRepo: Repository<DataCollectionAndFieldCosts>,
    @InjectRepository(CommunityRepresentation)
    private readonly communityRepresentationRepo: Repository<CommunityRepresentation>,
    @InjectRepository(BlueCarbonProjectPlanning)
    private readonly blueCarbonProjectPlanningRepo: Repository<BlueCarbonProjectPlanning>,
    @InjectRepository(CarbonRights)
    private readonly carbonRightsRepo: Repository<CarbonRights>,
    @InjectRepository(FinancingCost)
    private readonly financingCostRepo: Repository<FinancingCost>,
    @InjectRepository(ValidationCost)
    private readonly validationCostRepo: Repository<ValidationCost>,
    @InjectRepository(MonitoringCost)
    private readonly monitoringCostRepo: Repository<MonitoringCost>,
    @InjectRepository(Maintenance)
    private readonly maintenanceRepo: Repository<Maintenance>,
    @InjectRepository(CommunityBenefitSharingFund)
    private readonly communityBenefitSharingFundRepo: Repository<CommunityBenefitSharingFund>,
    @InjectRepository(BaselineReassessment)
    private readonly baselineReassessmentRepo: Repository<BaselineReassessment>,
    @InjectRepository(MRV)
    private readonly mrvRepo: Repository<MRV>,
    @InjectRepository(LongTermProjectOperating)
    private readonly longTermProjectOperatingRepo: Repository<LongTermProjectOperating>,
    @InjectRepository(CarbonStandardFees)
    private readonly carbonStandardFeesRepo: Repository<CarbonStandardFees>,
    @InjectRepository(CommunityCashFlow)
    private readonly communityCashFlowRepo: Repository<CommunityCashFlow>,
    @InjectRepository(EcosystemExtent)
    private readonly ecosystemExtentRepo: Repository<EcosystemExtent>,
    @InjectRepository(EcosystemLoss)
    private readonly ecosystemLossRepo: Repository<EcosystemLoss>,
    @InjectRepository(RestorableLand)
    private readonly restorableLandRepo: Repository<RestorableLand>,
    @InjectRepository(SequestrationRate)
    private readonly sequestrationRateRepo: Repository<SequestrationRate>,
    @InjectRepository(EmissionFactors)
    private readonly emissionFactorsRepo: Repository<EmissionFactors>,
    @InjectRepository(ImplementationLaborCost)
    private readonly implementationLaborCostRepo: Repository<ImplementationLaborCost>,
    @InjectRepository(BaseSize)
    private readonly baseSizeRepo: Repository<BaseSize>,
    @InjectRepository(BaseIncrease)
    private readonly baseIncreaseRepo: Repository<BaseIncrease>,
    @InjectRepository(ModelAssumptions)
    private readonly modelAssumptionsRepo: Repository<ModelAssumptions>,
  ) {
    this.initializeRepositoryMappings();
  }

  private initializeRepositoryMappings(): void {
    this.repositoryMappings = [
      { sheetName: 'Countries', repository: this.countryRepo },
      { sheetName: 'Project size', repository: this.projectSizeRepo },
      {
        sheetName: 'Feasibility analysis',
        repository: this.feasibilityAnalysisRepo,
      },
      {
        sheetName: 'Conservation planning and admin',
        repository: this.conservationPlanningAndAdminRepo,
      },
      {
        sheetName: 'Data collection and field costs',
        repository: this.dataCollectionAndFieldCostsRepo,
      },
      {
        sheetName: 'Community representation',
        repository: this.communityRepresentationRepo,
      },
      {
        sheetName: 'Blue carbon project planning',
        repository: this.blueCarbonProjectPlanningRepo,
      },
      {
        sheetName: 'Establishing carbon rights',
        repository: this.carbonRightsRepo,
      },
      { sheetName: 'Financing cost', repository: this.financingCostRepo },
      { sheetName: 'Validation', repository: this.validationCostRepo },
      { sheetName: 'Monitoring', repository: this.monitoringCostRepo },
      { sheetName: 'Maintenance', repository: this.maintenanceRepo },
      {
        sheetName: 'Community benefit sharing fund',
        repository: this.communityBenefitSharingFundRepo,
      },
      {
        sheetName: 'Baseline reassessment',
        repository: this.baselineReassessmentRepo,
      },
      { sheetName: 'MRV', repository: this.mrvRepo },
      {
        sheetName: 'Long-term project operating',
        repository: this.longTermProjectOperatingRepo,
      },
      {
        sheetName: 'Carbon standard fees',
        repository: this.carbonStandardFeesRepo,
      },
      {
        sheetName: 'Community cash flow',
        repository: this.communityCashFlowRepo,
      },
      { sheetName: 'Ecosystem extent', repository: this.ecosystemExtentRepo },
      { sheetName: 'Ecosystem loss', repository: this.ecosystemLossRepo },
      { sheetName: 'Restorable land', repository: this.restorableLandRepo },
      {
        sheetName: 'Sequestration rate',
        repository: this.sequestrationRateRepo,
      },
      { sheetName: 'Emission factors', repository: this.emissionFactorsRepo },
      {
        sheetName: 'Implementation labor',
        repository: this.implementationLaborCostRepo,
      },
      { sheetName: 'base_size_table', repository: this.baseSizeRepo },
      { sheetName: 'base_increase', repository: this.baseIncreaseRepo },
      { sheetName: 'Model assumptions', repository: this.modelAssumptionsRepo },
    ];
  }

  async exportToExcel(): Promise<Buffer> {
    this.logger.log('Starting Excel export...');
    const workbook: WorkBook = { SheetNames: [], Sheets: {} };

    try {
      for (const mapping of this.repositoryMappings) {
        this.logger.log(`Exporting sheet: ${mapping.sheetName}`);

        const data = await mapping.repository.find();

        if (data.length > 0) {
          const worksheet = utils.json_to_sheet(data);
          workbook.SheetNames.push(mapping.sheetName);
          workbook.Sheets[mapping.sheetName] = worksheet;
        } else {
          this.logger.warn(`No data found for sheet: ${mapping.sheetName}`);
          // Still add empty sheet for consistency
          const worksheet = utils.json_to_sheet([]);
          workbook.SheetNames.push(mapping.sheetName);
          workbook.Sheets[mapping.sheetName] = worksheet;
        }
      }

      const buffer = write(workbook, { type: 'buffer', bookType: 'xlsx' });
      this.logger.log(
        `Excel export completed. File size: ${buffer.length} bytes`,
      );

      return buffer;
    } catch (error) {
      this.logger.error('Error during Excel export', error);
      throw error;
    }
  }
}
