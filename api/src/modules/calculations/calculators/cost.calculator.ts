import { BaseSize } from '@shared/entities/base-size.entity';
import { BaseIncrease } from '@shared/entities/base-increase.entity';
import { RevenueProfitCalculator } from '@api/modules/calculations/calculators/revenue-profit.calculator';
import { parseInt, sum } from 'lodash';
import { irr } from 'node-irr';
import {
  CustomProjectCostDetails,
  CustomProjectSummary,
  YearlyBreakdown,
  YearlyBreakdownCostName,
} from '@shared/dtos/custom-projects/custom-project-output.dto';
import { PROJECT_DEVELOPMENT_TYPE } from '@shared/dtos/projects/project-development.type';
import { OverridableCostInputsDto } from '@shared/dtos/custom-projects/create-custom-project.dto';
import { CARBON_REVENUES_TO_COVER } from '@shared/entities/custom-project.entity';
import {
  CalculatorCostPlansOutput,
  CalculatorDependencies,
  COST_KEYS,
  CostPlanMap,
  EngineInput,
  ProjectInput,
} from '@api/modules/calculations/types';
import {
  ACTIVITY,
  RESTORATION_ACTIVITY_SUBTYPE,
} from '@shared/entities/activity.enum';
import { RestorationProjectInput } from '@api/modules/custom-projects/input-factory/restoration-project.input';

export type CostPlans = Record<
  keyof OverridableCostInputsDto | string,
  CostPlanMap
>;

export class CostCalculator {
  projectInput: ProjectInput;
  defaultProjectLength: number;
  startingPointScaling: number;
  baseSize: BaseSize;
  baseIncrease: BaseIncrease;
  capexTotalCostPlan: CostPlanMap;
  opexTotalCostPlan: CostPlanMap;
  costPlans: CostPlans;
  totalOpexNPV: number;
  revenueProfitCalculator: RevenueProfitCalculator;
  estimatedCreditsIssuedPlan: CostPlanMap;
  areaRestoredOrConservedPlan: CostPlanMap;

  engineInput: EngineInput;

  constructor(calculatorDependencies: CalculatorDependencies) {
    this.projectInput = calculatorDependencies.engineInput.projectInput;
    this.defaultProjectLength =
      calculatorDependencies.engineInput.projectInput.assumptions.defaultProjectLength;
    this.startingPointScaling =
      calculatorDependencies.engineInput.projectInput.assumptions.startingPointScaling;
    this.baseIncrease = calculatorDependencies.engineInput.baseIncrease;
    this.baseSize = calculatorDependencies.engineInput.baseSize;
    this.revenueProfitCalculator =
      calculatorDependencies.revenueProfitCalculator;
    this.estimatedCreditsIssuedPlan =
      calculatorDependencies.sequestrationRateOutputs.estimatedCreditIssuedPlan;
    this.areaRestoredOrConservedPlan =
      calculatorDependencies.sequestrationRateOutputs.areaRestoredOrConservedPlan;
    this.engineInput = calculatorDependencies.engineInput;
  }

  initializeCostPlans(): CalculatorCostPlansOutput {
    this.capexTotalCostPlan = this.initializeTotalCostPlan(
      this.defaultProjectLength,
    );
    this.opexTotalCostPlan = this.initializeTotalCostPlan(
      this.defaultProjectLength,
    );
    this.calculateCostPlans();
    this.calculateCapexTotalPlan();
    this.calculateOpexTotalPlan();
    const totalCapex = sum(Object.values(this.capexTotalCostPlan));
    const totalCapexNPV = this.calculateNpv(
      this.capexTotalCostPlan,
      this.projectInput.assumptions.discountRate,
    );
    const totalOpex = sum(Object.values(this.opexTotalCostPlan));
    const totalOpexNPV = this.calculateNpv(
      this.opexTotalCostPlan,
      this.projectInput.assumptions.discountRate,
    );
    const totalNPV = totalCapexNPV + totalOpexNPV;
    const estimatedRevenuePlan =
      this.revenueProfitCalculator.calculateEstimatedRevenuePlan();
    const totalRevenue = sum(Object.values(estimatedRevenuePlan));
    const totalRevenueNPV = this.calculateNpv(
      estimatedRevenuePlan,
      this.projectInput.assumptions.discountRate,
    );
    const creditsIssuedPlan = this.estimatedCreditsIssuedPlan;
    const totalCreditsIssued = sum(Object.values(creditsIssuedPlan));
    const costPerTCO2e =
      totalCreditsIssued != 0 ? totalNPV / totalCreditsIssued : 0;
      console.log('Total Capex:', costPerTCO2e, totalNPV, totalCreditsIssued);
    const costPerHa = this.calculateCostPerHa(totalNPV);
    const npvCoveringCosts =
      this.projectInput.carbonRevenuesToCover === CARBON_REVENUES_TO_COVER.OPEX
        ? totalRevenueNPV - totalOpexNPV
        : totalRevenueNPV - totalNPV;
    const financingCost =
      this.projectInput.costAndCarbonInputs.financingCost * totalCapex;
    const fundingGapNPV = npvCoveringCosts < 0 ? npvCoveringCosts * -1 : 0;
    const fundingGapPerTCO2e =
      totalCreditsIssued != 0 ? fundingGapNPV / totalCreditsIssued : 0;
    const totalCommunityBenefitSharingFundNPV = this.calculateNpv(
      this.costPlans.communityBenefitSharingFund,
      this.projectInput.assumptions.discountRate,
    );
    const totalCommunityBenefitSharingFund =
      totalRevenueNPV === 0
        ? 0
        : totalCommunityBenefitSharingFundNPV / totalRevenueNPV;

    const npvToUse =
      this.projectInput.carbonRevenuesToCover === CARBON_REVENUES_TO_COVER.OPEX
        ? totalOpexNPV
        : totalNPV;
    const fundingGap = this.calculateFundingGap(npvToUse, totalRevenueNPV);

    const annualNetCashFlow =
      this.revenueProfitCalculator.calculateAnnualNetCashFlow(
        this.capexTotalCostPlan,
        this.opexTotalCostPlan,
      );
    const annualNetIncome =
      this.revenueProfitCalculator.calculateAnnualNetIncome(
        this.opexTotalCostPlan,
      );
    const IRROpex = this.calculateIrr(
      annualNetCashFlow,
      annualNetIncome,
      false,
    );
    const IRRTotalCost = this.calculateIrr(
      annualNetCashFlow,
      annualNetIncome,
      true,
    );

    return {
      totalOpex,
      totalCapex,
      totalCapexNPV,
      totalOpexNPV,
      totalNPV,
      costPerTCO2e,
      costPerHa,
      npvCoveringCosts,
      totalCreditsIssued,
      IRROpex,
      IRRTotalCost,
      totalRevenueNPV,
      totalRevenue,
      financingCost,
      fundingGap,
      fundingGapNPV,
      fundingGapPerTCO2e,
      totalCommunityBenefitSharingFund,
      annualNetCashFlow,
      annualNetIncome,
      estimatedRevenuePlan,
      creditsIssuedPlan,
    };
  }

  getSummary(costPlanOutput: CalculatorCostPlansOutput): CustomProjectSummary {
    const {
      costPerTCO2e,
      costPerHa,
      IRROpex,
      IRRTotalCost,
      totalNPV,
      npvCoveringCosts,
      totalCapexNPV,
      totalOpexNPV,
      totalCreditsIssued,
      totalRevenueNPV,
      totalRevenue,
      financingCost,
      fundingGapNPV,
      fundingGapPerTCO2e,
      totalCommunityBenefitSharingFund,
      abatementPotential,
    } = costPlanOutput;
    const summary: Partial<CustomProjectSummary> = {
      '$/tCO2e (total cost, NPV)': costPerTCO2e,
      '$/ha': costPerHa,
      'IRR when priced to cover OpEx': IRROpex,
      'IRR when priced to cover total cost': IRRTotalCost,
      'Total cost (NPV)': totalNPV,
      'Capital expenditure (NPV)': totalCapexNPV,
      'Operating expenditure (NPV)': totalOpexNPV,
      'Credits issued': totalCreditsIssued,
      'Total abatement potential (tCO2e, without buffer)': abatementPotential,
      'Total revenue (NPV)': totalRevenueNPV,
      'Total revenue (non-discounted)': totalRevenue,
      'Financing cost': financingCost,
      'Funding gap (NPV)': fundingGapNPV,
      'Funding gap per tCO2e (NPV)': fundingGapPerTCO2e,
      'Landowner/community benefit share': totalCommunityBenefitSharingFund,
    };

    if (
      this.projectInput.carbonRevenuesToCover === CARBON_REVENUES_TO_COVER.OPEX
    ) {
      summary['Net revenue after OPEX'] = npvCoveringCosts;
    } else {
      summary['Net revenue after Total cost'] = npvCoveringCosts;
    }
    return summary as CustomProjectSummary;
  }

  getCostDetails(costPlanOutput: CalculatorCostPlansOutput): {
    total: CustomProjectCostDetails;
    npv: CustomProjectCostDetails;
  } {
    const discountRate = this.projectInput.assumptions.discountRate;
    const { totalOpex, totalCapex, totalCapexNPV, totalOpexNPV, totalNPV } =
      costPlanOutput;
    return {
      total: {
        capitalExpenditure: totalCapex,
        operationalExpenditure: totalOpex,
        totalCost: totalCapex + totalOpex,
        feasibilityAnalysis: sum(
          Object.values(this.costPlans.feasibilityAnalysis),
        ),
        conservationPlanningAndAdmin: sum(
          Object.values(this.costPlans.conservationPlanningAndAdmin),
        ),
        dataCollectionAndFieldCost: sum(
          Object.values(this.costPlans.dataCollectionAndFieldCost),
        ),
        communityRepresentation: sum(
          Object.values(this.costPlans.communityRepresentation),
        ),
        blueCarbonProjectPlanning: sum(
          Object.values(this.costPlans.blueCarbonProjectPlanning),
        ),
        establishingCarbonRights: sum(
          Object.values(this.costPlans.establishingCarbonRights),
        ),
        validation: sum(Object.values(this.costPlans.validation)),
        implementationLabor: sum(
          Object.values(this.costPlans.implementationLabor),
        ),

        monitoring: sum(Object.values(this.costPlans.monitoring)),
        maintenance: sum(Object.values(this.costPlans.maintenance)),
        communityBenefitSharingFund: sum(
          Object.values(this.costPlans.communityBenefitSharingFund),
        ),
        carbonStandardFees: sum(
          Object.values(this.costPlans.carbonStandardFees),
        ),
        baselineReassessment: sum(
          Object.values(this.costPlans.baselineReassessment),
        ),
        mrv: sum(Object.values(this.costPlans.mrv)),
        longTermProjectOperatingCost: sum(
          Object.values(this.costPlans.longTermProjectOperatingCost),
        ),
      },
      npv: {
        capitalExpenditure: totalCapexNPV,
        operationalExpenditure: totalOpexNPV,
        totalCost: totalNPV,
        feasibilityAnalysis: this.calculateNpv(
          this.costPlans.feasibilityAnalysis,
          discountRate,
        ),
        conservationPlanningAndAdmin: this.calculateNpv(
          this.costPlans.conservationPlanningAndAdmin,
          discountRate,
        ),
        dataCollectionAndFieldCost: this.calculateNpv(
          this.costPlans.dataCollectionAndFieldCost,
          discountRate,
        ),
        communityRepresentation: this.calculateNpv(
          this.costPlans.communityRepresentation,
          discountRate,
        ),
        blueCarbonProjectPlanning: this.calculateNpv(
          this.costPlans.blueCarbonProjectPlanning,
          discountRate,
        ),
        establishingCarbonRights: this.calculateNpv(
          this.costPlans.establishingCarbonRights,
          discountRate,
        ),
        validation: this.calculateNpv(this.costPlans.validation, discountRate),
        implementationLabor: this.calculateNpv(
          this.costPlans.implementationLabor,
          discountRate,
        ),
        monitoring: this.calculateNpv(this.costPlans.monitoring, discountRate),
        maintenance: this.calculateNpv(
          this.costPlans.maintenance,
          discountRate,
        ),
        communityBenefitSharingFund: this.calculateNpv(
          this.costPlans.communityBenefitSharingFund,
          discountRate,
        ),
        carbonStandardFees: this.calculateNpv(
          this.costPlans.carbonStandardFees,
          discountRate,
        ),
        baselineReassessment: this.calculateNpv(
          this.costPlans.baselineReassessment,
          discountRate,
        ),
        mrv: this.calculateNpv(this.costPlans.mrv, discountRate),
        longTermProjectOperatingCost: this.calculateNpv(
          this.costPlans.longTermProjectOperatingCost,
          discountRate,
        ),
      },
    };
  }

  getYearlyBreakdown(
    costPlanOutput: CalculatorCostPlansOutput,
  ): YearlyBreakdown[] {
    const {
      annualNetCashFlow,
      annualNetIncome,
      estimatedRevenuePlan,
      creditsIssuedPlan,
      totalOpexNPV,
      totalNPV,
      totalOpex,
    } = costPlanOutput;
    const costPlans: CostPlans = structuredClone(this.costPlans);
    const discountRate = this.projectInput.assumptions.discountRate;

    // Values to negative for some magical scientific reason that I am too dumb to understand
    for (const value of Object.values(costPlans)) {
      for (const [year, cost] of Object.entries(value)) {
        value[year] = -cost;
      }
    }
    const negativeOpexTotalCostPlan = costPlans.opexTotalCostPlan;
    const negativeCapexTotalCostPlan = costPlans.capexTotalCostPlan;

    const totalCostPlan = Object.keys({
      ...negativeOpexTotalCostPlan,
      ...negativeCapexTotalCostPlan,
    }).reduce((acc, year: string) => {
      const capexValue = negativeCapexTotalCostPlan[year] || 0;
      const opexValue = negativeOpexTotalCostPlan[year] || 0;
      acc[year] = capexValue + opexValue;
      return acc;
    }, {} as CostPlanMap);

    // TODO: Below is probably redundant as this plans are already calculated, but most likely not passed to the breakdown

    const cumulativeNetIncomePlan: CostPlanMap = {};
    const cumulativeNetIncomeCapexOpex: CostPlanMap = {};
    for (
      let year = -4;
      year <= this.projectInput.assumptions.projectLength;
      year++
    ) {
      if (year !== 0) {
        if (year === -4) {
          cumulativeNetIncomePlan[year] = annualNetIncome[year];
          cumulativeNetIncomeCapexOpex[year] = annualNetCashFlow[year];
        } else {
          const costPlanOpex = {};
          const costPlanCapexOpex = {};
          for (const yearKey in annualNetIncome) {
            if (parseInt(yearKey) <= year && parseInt(yearKey) >= -4) {
              costPlanOpex[yearKey] = annualNetIncome[yearKey];
            }
          }
          for (const yearKey in annualNetCashFlow) {
            if (parseInt(yearKey) <= year && parseInt(yearKey) > -4) {
              costPlanCapexOpex[yearKey] = annualNetCashFlow[yearKey];
            }
          }
          cumulativeNetIncomePlan[year] =
            annualNetIncome[-4] + this.calculateNpv(costPlanOpex, discountRate);
          cumulativeNetIncomeCapexOpex[year] =
            annualNetCashFlow[-4] +
            this.calculateNpv(costPlanCapexOpex, discountRate);
        }
      }
    }

    const yearNormalizedCostPlans: CostPlans = this.normalizeCostPlan({
      ...costPlans,
      totalCostPlan,
      estimatedRevenuePlan,
      creditsIssuedPlan,
      cumulativeNetIncomePlan,
      cumulativeNetIncomeCapexOpex,
      annualNetCashFlow,
      annualNetIncome,
    });

    const yearlyBreakdown: YearlyBreakdown[] = [];
    for (const costName in yearNormalizedCostPlans) {
      const costValues = yearNormalizedCostPlans[costName];
      let totalCostToSet = sum(Object.values(costValues));
      let totalNPVtoSet = this.calculateNpv(costValues, discountRate);
      if (costName === 'opexTotalCostPlan') {
        totalCostToSet = -totalOpex;
        totalNPVtoSet = -totalOpexNPV;
      }
      if (costName === 'totalCostPlan') {
        totalNPVtoSet = -totalNPV;
      }
      if (costName === 'creditsIssuedPlan') {
        totalNPVtoSet = 0;
      }
      if (costName === 'cumulativeNetIncomePlan') {
        totalCostToSet = 0;
        totalNPVtoSet = 0;
      }
      if (costName === 'cumulativeNetIncomeCapexOpex') {
        totalCostToSet = 0;
        totalNPVtoSet = 0;
      }

      yearlyBreakdown.push({
        costName: costName as YearlyBreakdownCostName,
        totalCost: totalCostToSet,
        totalNPV: totalNPVtoSet,
        costValues,
      });
    }

    return yearlyBreakdown;
  }
  /**
   * @description: Normalize the cost plans for each cost type to have the same length of years
   */
  private normalizeCostPlan(costPlans: CostPlans) {
    const startYear = -4;
    const endYear = this.projectInput.assumptions.projectLength;
    const normalizedCostPlans: CostPlans = {};
    for (const planName in costPlans) {
      const plan = costPlans[planName];
      normalizedCostPlans[planName] = {};
      for (let year = startYear; year <= endYear; year++) {
        if (year === 0) continue;

        normalizedCostPlans[planName][year] = plan[year] || 0;
      }
    }
    return normalizedCostPlans;
  }

  /**
   * @description: Initialize the cost plan with the default project length, with 0 costs for each year
   * @param defaultProjectLength
   */
  private initializeTotalCostPlan(defaultProjectLength: number): CostPlanMap {
    const costPlan: CostPlanMap = {};
    for (let i = 1; i <= defaultProjectLength; i++) {
      costPlan[i] = 0;
    }
    return costPlan;
  }

  private createSimpleCostPlan(
    totalBaseCost: number,
    years = [-4, -3, -2, -1],
  ) {
    const costPlan: CostPlanMap = {};
    years.forEach((year) => {
      costPlan[year] = totalBaseCost;
    });
    return costPlan;
  }

  private getTotalBaseCost(costType: COST_KEYS): number {
    const baseCost = this.projectInput.costAndCarbonInputs[costType];
    const increasedBy: number = this.baseIncrease[costType];
    const baseSize = this.baseSize[costType];
    const sizeDifference =
      this.projectInput.projectSizeHa - this.startingPointScaling;
    const scalingFactor = Math.max(Math.floor(sizeDifference / baseSize), 0);
    const totalBaseCost = baseCost + increasedBy * scalingFactor * baseCost;
    this.throwIfValueIsNotValid(totalBaseCost, costType);
    return totalBaseCost;
  }

  private feasibilityAnalysisCosts() {
    const totalBaseCost = this.getTotalBaseCost(COST_KEYS.FEASIBILITY_ANALYSIS);
    const feasibilityAnalysisCostPlan = this.createSimpleCostPlan(
      totalBaseCost,

      [-4],
    );
    return feasibilityAnalysisCostPlan;
  }

  private conservationPlanningAndAdminCosts() {
    const totalBaseCost = this.getTotalBaseCost(
      COST_KEYS.CONSERVATION_PLANNING_AND_ADMIN,
    );
    const conservationPlanningAndAdminCostPlan = this.createSimpleCostPlan(
      totalBaseCost,
      [-4, -3, -2, -1],
    );
    return conservationPlanningAndAdminCostPlan;
  }

  private dataCollectionAndFieldCosts() {
    const totalBaseCost = this.getTotalBaseCost(
      COST_KEYS.DATA_COLLECTION_AND_FIELD_COST,
    );
    const dataCollectionAndFieldCostPlan = this.createSimpleCostPlan(
      totalBaseCost,
      [-4, -3, -2],
    );
    return dataCollectionAndFieldCostPlan;
  }

  private blueCarbonProjectPlanningCosts() {
    const totalBaseCost = this.getTotalBaseCost(
      COST_KEYS.BLUE_CARBON_PROJECT_PLANNING,
    );
    const blueCarbonProjectPlanningCostPlan = this.createSimpleCostPlan(
      totalBaseCost,
      [-1],
    );
    return blueCarbonProjectPlanningCostPlan;
  }

  private communityRepresentationCosts() {
    const totalBaseCost = this.getTotalBaseCost(
      COST_KEYS.COMMUNITY_REPRESENTATION,
    );
    const projectDevelopmentType: PROJECT_DEVELOPMENT_TYPE =
      this.projectInput.costAndCarbonInputs.otherCommunityCashFlow;
    const initialCost =
      projectDevelopmentType === PROJECT_DEVELOPMENT_TYPE.DEVELOPMENT
        ? totalBaseCost
        : 0;
    const communityRepresentationCostPlan = this.createSimpleCostPlan(
      totalBaseCost,
      [-4, -3, -2, -1],
    );
    communityRepresentationCostPlan[-4] = initialCost;
    return communityRepresentationCostPlan;
  }

  private establishingCarbonRightsCosts() {
    const totalBaseCost = this.getTotalBaseCost(
      COST_KEYS.ESTABLISHING_CARBON_RIGHTS,
    );
    const establishingCarbonRightsCostPlan = this.createSimpleCostPlan(
      totalBaseCost,
      [-3, -2, -1],
    );
    return establishingCarbonRightsCostPlan;
  }

  private validationCosts() {
    const totalBaseCost = this.getTotalBaseCost(COST_KEYS.VALIDATION);
    const validationCostPlan = this.createSimpleCostPlan(totalBaseCost, [-1]);
    return validationCostPlan;
  }

  private implementationLaborCosts() {
    const baseCost = this.projectInput.costAndCarbonInputs.implementationLabor;
    const areaRestoredOrConservedPlan = this.areaRestoredOrConservedPlan;
    const implementationLaborCostPlan: CostPlanMap = {};
    for (
      let year = -4;
      year <= this.projectInput.assumptions.defaultProjectLength;
      year++
    ) {
      if (year !== 0) {
        implementationLaborCostPlan[year] = 0;
      }
    }

    for (
      let year = -1;
      year <= this.projectInput.assumptions.defaultProjectLength;
      year++
    ) {
      if (year === 0) {
        continue;
      }
      if (year <= this.projectInput.assumptions.projectLength) {
        let laborCost: number;
        if (year - 1 === 0) {
          laborCost =
            baseCost *
            (areaRestoredOrConservedPlan[year] -
              areaRestoredOrConservedPlan[-1]);
        } else {
          laborCost =
            baseCost *
            (areaRestoredOrConservedPlan[year] -
              (areaRestoredOrConservedPlan[year - 1] || 0));
        }
        implementationLaborCostPlan[year] = laborCost;
      }
    }
    return implementationLaborCostPlan;
  }

  private calculateMonitoringCosts() {
    const totalBaseCost = this.getTotalBaseCost(COST_KEYS.MONITORING);
    const monitoringCostPlan: CostPlanMap = {};
    // TODO: How is this plan different from the others?
    for (let year = -4; year <= this.defaultProjectLength; year++) {
      if (year !== 0) {
        monitoringCostPlan[year] =
          year >= 1 && year <= this.projectInput.assumptions.projectLength
            ? totalBaseCost
            : 0;
      }
    }
    return monitoringCostPlan;
  }

  maintenanceCosts(): { [year: number]: number } {
    const baseCost = this.projectInput.costAndCarbonInputs.maintenance;

    // TODO: Figure out how to sneak this in for the response
    let key: string;
    if (baseCost < 1) {
      key = '% of implementation labor';
    } else {
      key = '$/yr';
    }

    const maintenanceDuration: number =
      this.projectInput.costAndCarbonInputs.maintenanceDuration;

    const implementationLaborCostPlan = this.implementationLaborCosts();

    const findFirstZeroValue = (plan: CostPlanMap): number | null => {
      const years = Object.keys(plan)
        .map(Number)
        .sort((a, b) => a - b);
      for (const year of years) {
        if (year >= 1 && plan[year] === 0) {
          return year;
        }
      }
      return null;
    };

    const firstZeroValue = findFirstZeroValue(implementationLaborCostPlan);

    if (firstZeroValue === null) {
      throw new Error(
        'Could not find a first year with 0 value for implementation labor cost',
      );
    }

    const projectSizeHa = this.projectInput.projectSizeHa;
    const restorationRate = this.projectInput.assumptions.restorationRate;
    const defaultProjectLength =
      this.projectInput.assumptions.defaultProjectLength;

    let maintenanceEndYear: number;
    if (projectSizeHa / restorationRate <= 20) {
      maintenanceEndYear = firstZeroValue + maintenanceDuration - 1;
    } else {
      maintenanceEndYear = defaultProjectLength + maintenanceDuration;
    }

    const { activity, parameters } = this.engineInput.dto;
    if (activity === ACTIVITY.RESTORATION) {
      const customRestorationPlan = parameters.customRestorationPlan;
      if (
        Array.isArray(customRestorationPlan) === true &&
        customRestorationPlan.length > 0
      ) {
        const latestYearWithValue = (implementationLaborCostPlan): number => {
          let maxYear = 0;

          const keys = Object.keys(implementationLaborCostPlan)
            .map((v) => +v)
            .sort((a, b) => a - b);
          for (let idx = 0; idx < keys.length; idx++) {
            const key = keys[idx];
            if (implementationLaborCostPlan[key] !== 0) {
              maxYear = +key;
            }
          }

          return maxYear;
        };
        maintenanceEndYear =
          maintenanceDuration +
          latestYearWithValue(implementationLaborCostPlan);
      }
    }

    const maintenanceCostPlan: CostPlanMap = {};

    for (
      let year = -4;
      year <= this.projectInput.assumptions.defaultProjectLength;
      year++
    ) {
      if (year !== 0) {
        maintenanceCostPlan[year] = 0;
      }
    }

    for (const yearStr in maintenanceCostPlan) {
      const year = Number(yearStr);
      if (year < 1) {
        continue;
      }

      if (year > this.projectInput.assumptions.defaultProjectLength) {
        maintenanceCostPlan[year] = 0;
        continue;
      }

      if (year > maintenanceEndYear) {
        maintenanceCostPlan[year] = 0;
        continue;
      }

      if (key === '$/yr') {
        maintenanceCostPlan[year] = baseCost;
      } else {
        let lowerBound: number;
        if (year < maintenanceDuration + 2) {
          lowerBound = year - 2 - maintenanceDuration;
        } else {
          lowerBound = year - 1 - maintenanceDuration;
        }
        const uppperBound: number = year - 1;

        let laborSum: number = 0;
        const implementationLaborCostPlanKeys = Object.keys(
          implementationLaborCostPlan,
        );
        for (let idx = 0; idx < implementationLaborCostPlanKeys.length; idx++) {
          const yr = Number.parseInt(implementationLaborCostPlanKeys[idx]);
          const cost = implementationLaborCostPlan[yr];

          if (lowerBound < yr && yr <= uppperBound) {
            laborSum += cost;
          }
        }

        maintenanceCostPlan[year] = laborSum * baseCost;
      }
    }
    return maintenanceCostPlan;
  }

  communityBenefitAndSharingCosts(): CostPlanMap {
    const baseCost: number =
      this.projectInput.costAndCarbonInputs.communityBenefitSharingFund;

    const communityBenefitSharingFundCostPlan: CostPlanMap = {};

    for (
      let year = -4;
      year <= this.projectInput.assumptions.defaultProjectLength;
      year++
    ) {
      if (year !== 0) {
        communityBenefitSharingFundCostPlan[year] = 0;
      }
    }

    const estimatedRevenue: CostPlanMap =
      this.revenueProfitCalculator.calculateEstimatedRevenuePlan();

    for (const yearStr in communityBenefitSharingFundCostPlan) {
      const year = Number(yearStr);
      if (year <= this.projectInput.assumptions.projectLength) {
        communityBenefitSharingFundCostPlan[year] =
          estimatedRevenue[year] * baseCost;
      } else {
        communityBenefitSharingFundCostPlan[year] = 0;
      }
    }

    return communityBenefitSharingFundCostPlan;
  }

  carbonStandardFeeCosts(): { [year: number]: number } {
    const baseCost: number =
      this.projectInput.costAndCarbonInputs.carbonStandardFees;

    const carbonStandardFeesCostPlan: CostPlanMap = {};

    for (
      let year = -4;
      year <= this.projectInput.assumptions.defaultProjectLength;
      year++
    ) {
      if (year !== 0) {
        carbonStandardFeesCostPlan[year] = 0;
      }
    }

    const estimatedCreditsIssued: CostPlanMap = this.estimatedCreditsIssuedPlan;

    for (const yearStr in carbonStandardFeesCostPlan) {
      const year = Number(yearStr);
      if (year <= -1) {
        carbonStandardFeesCostPlan[year] = 0;
      } else if (year <= this.projectInput.assumptions.projectLength) {
        carbonStandardFeesCostPlan[year] =
          estimatedCreditsIssued[year] * baseCost;
      } else {
        carbonStandardFeesCostPlan[year] = 0;
      }
    }

    return carbonStandardFeesCostPlan;
  }

  baseLineReassessmentCosts(): { [year: number]: number } {
    const baseCost: number =
      this.projectInput.costAndCarbonInputs.baselineReassessment;

    const baselineReassessmentCostPlan: CostPlanMap = {};

    for (
      let year = -4;
      year <= this.projectInput.assumptions.defaultProjectLength;
      year++
    ) {
      if (year !== 0) {
        baselineReassessmentCostPlan[year] = 0;
      }
    }

    for (const yearStr in baselineReassessmentCostPlan) {
      const year = Number(yearStr);

      if (year < -1) {
        baselineReassessmentCostPlan[year] = 0;
      } else if (year === -1) {
        baselineReassessmentCostPlan[year] = baseCost;
      } else if (year <= this.projectInput.assumptions.projectLength) {
        if (
          year / this.projectInput.assumptions.baselineReassessmentFrequency ===
          Math.floor(
            year / this.projectInput.assumptions.baselineReassessmentFrequency,
          )
        ) {
          baselineReassessmentCostPlan[year] =
            baseCost *
            Math.pow(
              1 + this.projectInput.assumptions.annualCostIncrease,
              year,
            );
        } else {
          baselineReassessmentCostPlan[year] = 0;
        }
      } else {
        baselineReassessmentCostPlan[year] = 0;
      }
    }

    return baselineReassessmentCostPlan;
  }

  mrvCosts(): CostPlanMap {
    const baseCost: number = this.projectInput.costAndCarbonInputs.mrv;

    const mrvCostPlan: CostPlanMap = {};

    for (
      let year = -4;
      year <= this.projectInput.assumptions.defaultProjectLength;
      year++
    ) {
      if (year !== 0) {
        mrvCostPlan[year] = 0;
      }
    }

    for (const yearStr in mrvCostPlan) {
      const year = Number(yearStr);

      if (year <= -1) {
        mrvCostPlan[year] = 0;
      } else if (year <= this.projectInput.assumptions.projectLength) {
        if (
          year / this.projectInput.assumptions.verificationFrequency ===
          Math.floor(year / this.projectInput.assumptions.verificationFrequency)
        ) {
          mrvCostPlan[year] =
            baseCost *
            Math.pow(
              1 + this.projectInput.assumptions.annualCostIncrease,
              year,
            );
        } else {
          mrvCostPlan[year] = 0;
        }
      } else {
        mrvCostPlan[year] = 0;
      }
    }

    return mrvCostPlan;
  }

  longTermProjectOperatingCosts(): CostPlanMap {
    const baseSize: number = this.baseSize.longTermProjectOperatingCost;

    if (baseSize === 0) {
      throw new Error('Base size cannot be 0 to avoid division errors');
    }

    const baseCost: number =
      this.projectInput.costAndCarbonInputs.longTermProjectOperatingCost;

    const increasedBy = this.baseIncrease.longTermProjectOperatingCost;
    const startingPointScaling =
      this.projectInput.assumptions.startingPointScaling;

    let totalBaseCostAdd: number;

    if (
      (this.projectInput.projectSizeHa -
        this.projectInput.assumptions.startingPointScaling) /
        baseSize <
      1
    ) {
      totalBaseCostAdd = 0;
    } else {
      totalBaseCostAdd = Math.round(
        (this.projectInput.projectSizeHa - startingPointScaling) / baseSize,
      );
    }

    const totalBaseCost: number =
      baseCost + totalBaseCostAdd * increasedBy * baseCost;

    const longTermProjectOperatingCostPlan: CostPlanMap = {};

    for (
      let year = -4;
      year <= this.projectInput.assumptions.defaultProjectLength;
      year++
    ) {
      if (year !== 0) {
        longTermProjectOperatingCostPlan[year] = 0;
      }
    }

    for (const yearStr in longTermProjectOperatingCostPlan) {
      const year = Number(yearStr);

      if (year <= -1) {
        longTermProjectOperatingCostPlan[year] = 0;
      } else if (year <= this.projectInput.assumptions.projectLength) {
        longTermProjectOperatingCostPlan[year] = totalBaseCost;
      } else {
        longTermProjectOperatingCostPlan[year] = 0;
      }
    }

    return longTermProjectOperatingCostPlan;
  }

  calculateNpv(
    costPlan: CostPlanMap,
    discountRate: number,
    actualYear: number = -4,
  ): number {
    let npv = 0;

    for (const yearStr in costPlan) {
      const year = Number(yearStr);
      const cost = costPlan[year];

      if (year === actualYear) {
        npv += cost;
      } else if (year > 0) {
        npv += cost / Math.pow(1 + discountRate, year + (-actualYear - 1));
      } else {
        npv += cost / Math.pow(1 + discountRate, -actualYear + year);
      }
    }

    return npv;
  }

  private throwIfValueIsNotValid(value: number, costKey: COST_KEYS): void {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
      console.error(
        `Invalid number: ${value} produced for ${costKey}: Setting to 0 for development`,
      );
    }
  }

  calculateCapexTotalPlan() {
    const costs = [
      this.costPlans.feasibilityAnalysis,
      this.costPlans.conservationPlanningAndAdmin,
      this.costPlans.dataCollectionAndFieldCost,
      this.costPlans.blueCarbonProjectPlanning,
      this.costPlans.communityRepresentation,
      this.costPlans.establishingCarbonRights,
      this.costPlans.validation,
      this.costPlans.implementationLabor,
    ];
    for (const cost of costs) {
      this.aggregateCosts(cost, this.capexTotalCostPlan);
    }

    return this;
  }

  calculateOpexTotalPlan() {
    const costs = [
      this.costPlans.monitoring,
      this.costPlans.maintenance,
      this.costPlans.communityBenefitSharingFund,
      this.costPlans.carbonStandardFees,
      this.costPlans.baselineReassessment,
      this.costPlans.mrv,
      this.costPlans.longTermProjectOperatingCost,
    ];
    for (const cost of costs) {
      this.aggregateCosts(cost, this.opexTotalCostPlan);
    }
    return this;
  }

  aggregateCosts(
    costPlan: CostPlanMap,
    totalCostPlan: CostPlanMap,
  ): CostPlanMap {
    for (const year in costPlan) {
      if (totalCostPlan[year] === undefined) {
        totalCostPlan[year] = 0;
      }
      totalCostPlan[year] += costPlan[year];
    }
    return totalCostPlan;
  }
  calculateFundingGap(referenceNpv: number, totalRevenueNpv: number): number {
    const value = totalRevenueNpv - referenceNpv;
    const fundingGap = value > 0 ? 0 : value * -1;
    return fundingGap;
  }

  calculateIrr(
    netCashFlow: CostPlanMap,
    netIncome: CostPlanMap,
    useCapex: boolean = false,
  ): number {
    const cashFlowPlan = useCapex ? netCashFlow : netIncome;

    // Get the sorted list of years (as numbers) from the plan, as it needs to be ordered
    // We are suffering the same issue in several parts, but we agreed that it would be costly to use sorted maps everywhere instead of object literals.
    const sortedYears = Object.keys(cashFlowPlan)
      .map(Number)
      .filter((year) => year !== 0)
      .sort((a, b) => a - b);

    const cashFlowArray = sortedYears.map((year) => cashFlowPlan[year]);

    return irr(cashFlowArray);
  }

  /**
   * @description: Calculate the cost per ha for the project, If its a Planting Restoration project,
   * the calculation of hectares incorporates the planting success rate for a more conservative estimate.
   * otherwise, the value is computed by dividing the total NPV cost by the project size in hectares.
   */
  calculateCostPerHa(totalNPV: number): number {
    const projectSizeHa = this.projectInput.projectSizeHa;
    const plantingSuccessRate =
      this.projectInput.assumptions.plantingSuccessRate;
    if (this.projectInput.activity === ACTIVITY.RESTORATION) {
      // Type cast so that restoration activity can be checked
      const projectInput = this.projectInput as RestorationProjectInput;
      if (
        projectInput.restorationActivity ===
        RESTORATION_ACTIVITY_SUBTYPE.PLANTING
      ) {
        return totalNPV / (projectSizeHa * plantingSuccessRate);
      }
    }
    return totalNPV / projectSizeHa;
  }

  calculateCostPlans(): this {
    this.costPlans = {
      feasibilityAnalysis: this.feasibilityAnalysisCosts(),
      conservationPlanningAndAdmin: this.conservationPlanningAndAdminCosts(),
      dataCollectionAndFieldCost: this.dataCollectionAndFieldCosts(),
      blueCarbonProjectPlanning: this.blueCarbonProjectPlanningCosts(),
      communityRepresentation: this.communityRepresentationCosts(),
      establishingCarbonRights: this.establishingCarbonRightsCosts(),
      validation: this.validationCosts(),
      implementationLabor: this.implementationLaborCosts(),
      monitoring: this.calculateMonitoringCosts(),
      maintenance: this.maintenanceCosts(),
      communityBenefitSharingFund: this.communityBenefitAndSharingCosts(),
      carbonStandardFees: this.carbonStandardFeeCosts(),
      baselineReassessment: this.baseLineReassessmentCosts(),
      mrv: this.mrvCosts(),
      longTermProjectOperatingCost: this.longTermProjectOperatingCosts(),
      opexTotalCostPlan: this.opexTotalCostPlan,
      capexTotalCostPlan: this.capexTotalCostPlan,
    };
    return this;
  }
}
