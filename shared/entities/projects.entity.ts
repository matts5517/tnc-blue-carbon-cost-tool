import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { Country } from "@shared/entities/country.entity";
import { ECOSYSTEM } from "./ecosystem.enum";
import { ACTIVITY, RESTORATION_ACTIVITY_SUBTYPE } from "./activity.enum";
import { PROJECT_SCORE } from "@shared/entities/project-score.enum";
import {EmptyStringToNull} from "@shared/lib/empty-string-to-null";

export enum PROJECT_SIZE_FILTER {
  SMALL = "Small",
  MEDIUM = "Medium",
  LARGE = "Large",
}

export enum PROJECT_PRICE_TYPE {
  OPEX_BREAKEVEN = "Opex breakeven",
  TOTAL_COST_BREAKEVEN = "Total cost breakeven",
}

export enum COST_TYPE_SELECTOR {
  TOTAL = "total",
  NPV = "npv",
}

@Entity("projects")
export class Project extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "project_name", type: "varchar", length: 255 })
  projectName: string;

  @Column({ name: "country_code", length: 3, nullable: true, type: "char" })
  countryCode: string;

  //Unidirectional relation
  @ManyToOne(() => Country)
  @JoinColumn({ name: "country_code" })
  country: Country;

  @Column({ name: "ecosystem", enum: ECOSYSTEM, type: "enum" })
  ecosystem: ECOSYSTEM;

  @Column({ name: "activity", enum: ACTIVITY, type: "enum" })
  activity: ACTIVITY;

  // TODO: We need to make this a somehow enum, as a subactivity of restoration, that can be null for conservation, and can represent all restoration activities
  @Column({
    name: "restoration_activity",
    type: "enum",
    enum: RESTORATION_ACTIVITY_SUBTYPE,
    nullable: true,
    transformer: EmptyStringToNull
  })
  restorationActivity: RESTORATION_ACTIVITY_SUBTYPE;

  @Column({ name: "project_size", type: "decimal" })
  projectSize: number;

  @Column({
    name: "project_size_filter",
    type: "enum",
    enum: PROJECT_SIZE_FILTER,
  })
  projectSizeFilter: string;

  @Column({
    name: "price_type",
    enum: PROJECT_PRICE_TYPE,
    type: "enum",
    nullable: true,
  })
  priceType: PROJECT_PRICE_TYPE;

  @Column({name: 'country_abatement_potential', type: 'decimal', nullable: true})
  countryAbatementPotential: number;

  @Column({ name: "abatement_potential", type: "decimal", nullable: true })
  abatementPotential: number;

  @Column({ name: "total_cost_npv", type: "decimal", nullable: true })
  totalCostNPV: number;

  @Column({ name: "total_cost", type: "decimal", nullable: true })
  totalCost: number;

  @Column({ name: "capex_npv", type: "decimal", nullable: true, default: 0 })
  capexNPV: number;

  @Column({ name: "capex", type: "decimal", nullable: true, default: 0 })
  capex: number;

  @Column({ name: "opex_npv", type: "decimal", nullable: true, default: 0 })
  opexNPV: number;

  @Column({ name: "opex", type: "decimal", nullable: true, default: 0 })
  opex: number;

  @Column({ name: "cost_per_tco2e_npv", type: "decimal", nullable: true })
  costPerTCO2eNPV: number;

  @Column({ name: "cost_per_tco2e", type: "decimal", nullable: true })
  costPerTCO2e: number;

  @Column({
    name: "feasibility_analysis_npv",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  feasibilityAnalysisNPV: number;

  @Column({
    name: "feasibility_analysis",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  feasibilityAnalysis: number;

  @Column({
    name: "conservation_planning_npv",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  conservationPlanningNPV: number;

  @Column({
    name: "conservation_planning",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  conservationPlanning: number;

  @Column({
    name: "data_collection_npv",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  dataCollectionNPV: number;

  @Column({
    name: "data_collection",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  dataCollection: number;

  @Column({
    name: "community_representation_npv",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  communityRepresentationNPV: number;

  @Column({
    name: "community_representation",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  communityRepresentation: number;

  @Column({
    name: "blue_carbon_project_planning_npv",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  blueCarbonProjectPlanningNPV: number;

  @Column({
    name: "blue_carbon_project_planning",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  blueCarbonProjectPlanning: number;

  @Column({
    name: "establishing_carbon_rights_npv",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  establishingCarbonRightsNPV: number;

  @Column({
    name: "establishing_carbon_rights",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  establishingCarbonRights: number;

  @Column({
    name: "validation_npv",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  validationNPV: number;

  @Column({ name: "validation", type: "decimal", nullable: true, default: 0 })
  validation: number;

  @Column({
    name: "implementation_labor_npv",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  implementationLaborNPV: number;

  @Column({
    name: "implementation_labor",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  implementationLabor: number;

  @Column({
    name: "monitoring_npv",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  monitoringNPV: number;

  @Column({ name: "monitoring", type: "decimal", nullable: true, default: 0 })
  monitoring: number;

  @Column({
    name: "maintenance_npv",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  maintenanceNPV: number;

  @Column({ name: "maintenance", type: "decimal", nullable: true, default: 0 })
  maintenance: number;

  @Column({
    name: "monitoring_maintenance_mpv",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  monitoringMaintenanceNPV: number;

  @Column({
    name: "monitoring_maintenance",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  monitoringMaintenance: number;

  @Column({
    name: "community_benefit_npv",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  communityBenefitNPV: number;

  @Column({
    name: "community_benefit",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  communityBenefit: number;

  @Column({
    name: "carbon_standard_fees_npv",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  carbonStandardFeesNPV: number;

  @Column({
    name: "carbon_standard_fees",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  carbonStandardFees: number;

  @Column({
    name: "baseline_reassessment_npv",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  baselineReassessmentNPV: number;

  @Column({
    name: "baseline_reassessment",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  baselineReassessment: number;

  @Column({ name: "mrv_npv", type: "decimal", nullable: true, default: 0 })
  mrvNPV: number;

  @Column({ name: "mrv", type: "decimal", nullable: true, default: 0 })
  mrv: number;

  @Column({
    name: "long_term_project_operating_npv",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  longTermProjectOperatingNPV: number;

  @Column({
    name: "long_term_project_operating",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  longTermProjectOperating: number;

  @Column({
    name: "initial_price_assumption",
    type: "decimal",
    nullable: true,
  })
  initialPriceAssumption: number;

  @Column({
    name: "leftover_after_opex_npv",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  leftoverAfterOpexNPV: number;

  @Column({
    name: "leftover_after_opex",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  leftoverAfterOpex: number;

  @Column({
    name: "total_revenue_npv",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  totalRevenueNPV: number;

  @Column({
    name: "total_revenue",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  totalRevenue: number;

  @Column({
    name: "credits_issued",
    type: "decimal",
    nullable: true,
    default: 0,
  })
  creditsIssued: number;

  @Column({
    type: "enum",
    enum: PROJECT_SCORE,
    default: PROJECT_SCORE.MEDIUM,
    name: "score_card_rating",
    nullable: true,
  })
  scoreCardRating: PROJECT_SCORE;

}
