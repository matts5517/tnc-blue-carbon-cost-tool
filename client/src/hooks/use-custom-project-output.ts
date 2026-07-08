import { useMemo } from "react";

import {
  ConservationProjectOutput,
  RestorationProjectOutput,
  sortCustomProjectSummary,
} from "@shared/dtos/custom-projects/custom-project-output.dto";
import { CUSTOM_PROJECT_PRICE_TYPE } from "@shared/dtos/custom-projects/custom-projects.enums";
import { ACTIVITY } from "@shared/entities/activity.enum";
import {
  CARBON_REVENUES_TO_COVER,
  CustomProject,
} from "@shared/entities/custom-project.entity";

import { toPercentageValue } from "@/lib/format";

import { CUSTOM_PROJECT_OUTPUTS } from "@/constants/tooltip";

import {
  getBreakdownYears,
  parseYearlyBreakdownForChart,
  parseYearlyBreakdownForTable,
} from "@/containers/projects/custom-project/annual-project-cash-flow/utils";
import { parseCostDetailsForTable } from "@/containers/projects/custom-project/cost-details/table/utils";
import { useCustomProjectFilters } from "@/containers/projects/url-store";

const getInitialCarbonPriceLabel = (
  priceType: CUSTOM_PROJECT_PRICE_TYPE,
  carbonRevenuesToCover?: CARBON_REVENUES_TO_COVER,
): string => {
  if (priceType === CUSTOM_PROJECT_PRICE_TYPE.INITIAL_CARBON_PRICE_ASSUMPTION)
    return "Initial carbon price";

  if (carbonRevenuesToCover === CARBON_REVENUES_TO_COVER.CAPEX_AND_OPEX)
    return "OpEx + CapEx breakeven price";

  return "OpEx breakeven price";
};
const isConservationProjectOutput = (
  output: ConservationProjectOutput | RestorationProjectOutput | null,
  activity: ACTIVITY,
): output is ConservationProjectOutput => {
  return activity === ACTIVITY.CONSERVATION;
};

export const useCustomProjectOutput = (
  data: InstanceType<typeof CustomProject>,
) => {
  const [{ costRangeSelector, priceType }] = useCustomProjectFilters();
  const key =
    priceType === CUSTOM_PROJECT_PRICE_TYPE.INITIAL_CARBON_PRICE_ASSUMPTION
      ? "initialCarbonPriceComputationOutput"
      : "breakevenPriceComputationOutput";
  const output = data.output[key];
  const carbonRevenuesToCover = output?.carbonRevenuesToCover;

  const projectDetailsProps = useMemo(() => {
    return {
      data: {
        country: data.country,
        projectSize: data.projectSize,
        projectLength: data.projectLength,
        ecosystem: data.ecosystem,
        activity: data.activity,
        carbonRevenuesToCover,
        initialCarbonPrice: {
          label: getInitialCarbonPriceLabel(priceType, carbonRevenuesToCover),
          value: output?.initialCarbonPrice,
        },
        lossRate: isConservationProjectOutput(output, data.activity)
          ? parseFloat(toPercentageValue(output?.lossRate ?? 0))
          : null,
        emissionFactors: isConservationProjectOutput(output, data.activity)
          ? output.emissionFactors
          : null,
        sequestrationRate: isConservationProjectOutput(output, data.activity)
          ? null
          : output?.sequestrationRate,
        restorationActivity: data.input?.parameters?.restorationActivity,
        totalCreditsIssued: output?.summary?.["Credits issued"],
      },
    };
  }, [data, output, priceType, carbonRevenuesToCover]);

  const costDetailsProps = useMemo(() => {
    const costDetails = {
      total: parseCostDetailsForTable(
        projectDetailsProps.data.activity,
        output?.costDetails.total,
      ),
      npv: parseCostDetailsForTable(
        projectDetailsProps.data.activity,
        output?.costDetails.npv,
      ),
    };

    return costDetails[costRangeSelector].map((cost) => ({
      ...cost,
      sensitivityAnalysis:
        output?.sensitivityAnalysis[
          cost.costName as keyof typeof output.sensitivityAnalysis
        ],
    }));
  }, [costRangeSelector, output, projectDetailsProps.data.activity]);

  const chartData = useMemo(
    () =>
      parseYearlyBreakdownForChart(
        output?.yearlyBreakdown || [],
        getBreakdownYears(output?.yearlyBreakdown || []),
      ),
    [output?.yearlyBreakdown],
  );

  const tableData = useMemo(
    () => parseYearlyBreakdownForTable(output?.yearlyBreakdown || []),
    [output?.yearlyBreakdown],
  );

  const summaryData = useMemo(() => {
    if (!output?.summary) return null;

    const sortedSummary = sortCustomProjectSummary(output.summary);
    return {
      ...sortedSummary,
      "IRR when priced to cover OpEx": parseFloat(
        toPercentageValue(output.summary["IRR when priced to cover OpEx"]),
      ),
    };
  }, [output?.summary]);
  const leftOverProps = useMemo(() => {
    let title = "";
    let tooltipContent;
    if (data.input.carbonRevenuesToCover === CARBON_REVENUES_TO_COVER.OPEX) {
      title = "Net revenue after OPEX";
      tooltipContent = CUSTOM_PROJECT_OUTPUTS.NET_REVENUE_AFTER_OPEX_TOTAL_COST;
    } else {
      title = "Net revenue after Total cost";
      tooltipContent =
        CUSTOM_PROJECT_OUTPUTS.NET_REVENUE_AFTER_CAPEX_OPEX_TOTAL_COST;
    }
    return {
      title,
      tooltip: {
        title,
        content: tooltipContent,
      },
      data: output?.leftover[costRangeSelector],
    };
  }, [output?.leftover, costRangeSelector, data.input.carbonRevenuesToCover]);
  const annualProjectCashFlowProps = useMemo(
    () => ({
      tableData,
      chartData,
      carbonRevenuesToCover: output?.carbonRevenuesToCover,
      breakevenPoint:
        chartData.find((item) => item.cumulativeNetIncomePlan > 0)?.year ||
        null,
    }),
    [tableData, chartData, output?.carbonRevenuesToCover],
  );

  return {
    projectCostProps: output?.totalProjectCost[costRangeSelector],
    leftOverProps,
    projectDetailsProps,
    costDetailsProps,
    annualProjectCashFlowProps,
    summaryData,
    output,
  };
};
