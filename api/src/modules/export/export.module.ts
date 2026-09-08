import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportService } from '@api/modules/export/export.service';
import { ExportController } from '@api/modules/export/export.controller';
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
import { AuthModule } from '@api/modules/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Country,
      ProjectSize,
      FeasibilityAnalysis,
      ConservationPlanningAndAdmin,
      DataCollectionAndFieldCosts,
      CommunityRepresentation,
      BlueCarbonProjectPlanning,
      CarbonRights,
      FinancingCost,
      ValidationCost,
      MonitoringCost,
      Maintenance,
      CommunityBenefitSharingFund,
      BaselineReassessment,
      MRV,
      LongTermProjectOperating,
      CarbonStandardFees,
      CommunityCashFlow,
      EcosystemExtent,
      EcosystemLoss,
      RestorableLand,
      SequestrationRate,
      EmissionFactors,
      ImplementationLaborCost,
      BaseSize,
      BaseIncrease,
      ModelAssumptions,
    ]),
    AuthModule,
  ],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
