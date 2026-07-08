import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config({ path: `../shared/config/.env` });
import { DataSource } from 'typeorm';
import { User } from '@shared/entities/users/user.entity.js';
import { ApiEventsEntity } from '@api/modules/api-events/api-events.entity.js';
import { Country } from '@shared/entities/country.entity.js';
import { Project } from '@shared/entities/projects.entity.js';
import { EcosystemExtent } from '@shared/entities/carbon-inputs/ecosystem-extent.entity.js';
import { EcosystemLoss } from '@shared/entities/carbon-inputs/ecosystem-loss.entity.js';
import { EmissionFactors } from '@shared/entities/carbon-inputs/emission-factors.entity.js';
import { RestorableLand } from '@shared/entities/carbon-inputs/restorable-land.entity.js';
import { SequestrationRate } from '@shared/entities/carbon-inputs/sequestration-rate.entity.js';
import { BaselineReassessment } from '@shared/entities/cost-inputs/baseline-reassessment.entity.js';
import { BlueCarbonProjectPlanning } from '@shared/entities/cost-inputs/blue-carbon-project-planning.entity.js';
import { CarbonStandardFees } from '@shared/entities/cost-inputs/carbon-standard-fees.entity.js';
import { CommunityBenefitSharingFund } from '@shared/entities/cost-inputs/community-benefit-sharing-fund.entity.js';
import { CommunityCashFlow } from '@shared/entities/cost-inputs/community-cash-flow.entity.js';
import { CommunityRepresentation } from '@shared/entities/cost-inputs/community-representation.entity.js';
import { ConservationPlanningAndAdmin } from '@shared/entities/cost-inputs/conservation-and-planning-admin.entity.js';
import { DataCollectionAndFieldCosts } from '@shared/entities/cost-inputs/data-collection-and-field-costs.entity.js';
import { CarbonRights } from '@shared/entities/cost-inputs/establishing-carbon-rights.entity.js';
import { FeasibilityAnalysis } from '@shared/entities/cost-inputs/feasability-analysis.entity.js';
import { FinancingCost } from '@shared/entities/cost-inputs/financing-cost.entity.js';
import { LongTermProjectOperating } from '@shared/entities/cost-inputs/long-term-project-operating.entity.js';
import { Maintenance } from '@shared/entities/cost-inputs/maintenance.entity.js';
import { MonitoringCost } from '@shared/entities/cost-inputs/monitoring.entity.js';
import { MRV } from '@shared/entities/cost-inputs/mrv.entity.js';
import { ProjectSize } from '@shared/entities/cost-inputs/project-size.entity.js';
import { ValidationCost } from '@shared/entities/cost-inputs/validation.entity.js';
import { ImplementationLaborCost } from '@shared/entities/cost-inputs/implementation-labor-cost.entity.js';
import { BaseSize } from '@shared/entities/base-size.entity.js';
import { BaseIncrease } from '@shared/entities/base-increase.entity.js';
import { ModelAssumptions } from '@shared/entities/model-assumptions.entity.js';
import { BackOfficeSession } from '@shared/entities/users/backoffice-session.js';
import { CustomProject } from '@shared/entities/custom-project.entity.js';
import { ModelComponentSource } from '@shared/entities/methodology/model-component-source.entity.js';
import { ModelComponentSourceM2M } from '@shared/entities/methodology/model-source-m2m.entity.js';
import { UserUpload } from '@shared/entities/users/user-upload.js';
import { ModelComponentsVersionEntity } from '@shared/entities/model-versioning/model-components-version.entity.js';

// TODO: If we import the COMMON_DATABASE_ENTITIES from shared, we get an error where DataSouce is not set for a given entity
export const ADMINJS_ENTITIES = [
  ModelComponentSource,
  User,
  CustomProject,
  UserUpload,
  ApiEventsEntity,
  Country,
  ProjectSize,
  FeasibilityAnalysis,
  ConservationPlanningAndAdmin,
  DataCollectionAndFieldCosts,
  CarbonStandardFees,
  CommunityBenefitSharingFund,
  CommunityCashFlow,
  CommunityRepresentation,
  EcosystemLoss,
  CarbonRights,
  FinancingCost,
  Maintenance,
  MonitoringCost,
  RestorableLand,
  ValidationCost,
  BaselineReassessment,
  BlueCarbonProjectPlanning,
  EmissionFactors,
  LongTermProjectOperating,
  MRV,
  SequestrationRate,
  EcosystemExtent,
  Project,
  ImplementationLaborCost,
  BaseSize,
  BaseIncrease,
  ModelAssumptions,
  CustomProject,
  BackOfficeSession,
  ModelComponentSourceM2M,
  ModelComponentsVersionEntity,
];

export const dataSource: DataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5433,
  username: process.env.DB_USERNAME || 'blue-carbon-cost',
  password: process.env.DB_PASSWORD || 'blue-carbon-cost',
  database: process.env.DB_NAME || 'blc-dev',
  // TODO: Use common db entities from shared
  entities: ADMINJS_ENTITIES,
  synchronize: false,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  logging: false,
});
