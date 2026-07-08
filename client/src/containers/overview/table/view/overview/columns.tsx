import { ProjectType } from "@shared/contracts/projects.contract";
import { PROJECT_SCORE } from "@shared/entities/project-score.enum";
import {
  COST_TYPE_SELECTOR,
  PROJECT_PRICE_TYPE,
} from "@shared/entities/projects.entity";
import { createColumnHelper } from "@tanstack/react-table";
import { z } from "zod";

import { formatCurrency, formatNumber } from "@/lib/format";

import { filtersSchema } from "@/app/(overview)/constants";

import {
  HeaderText,
  CellText,
  getAccessor,
  renderHeader,
} from "@/containers/overview/table/utils";
import { TableStateWithMaximums } from "@/containers/overview/table/view/overview";

import SingleStackedBarChart from "@/components/ui/bar-chart/single-stacked-bar-chart";
import { ScoreIndicator } from "@/components/ui/score-card";

const columnHelper = createColumnHelper<
  Partial<ProjectType> & {
    capex?: number;
    opex?: number;
    capexNPV?: number;
    opexNPV?: number;
    totalCostNPV?: number;
    creditsIssued?: number;
  }
>();

const createSegments = (
  type: COST_TYPE_SELECTOR,
  projectName: string,
  rowData: {
    capexNPV?: number;
    opexNPV?: number;
    capex?: number;
    opex?: number;
  },
) => {
  const values = {
    capex:
      type === COST_TYPE_SELECTOR.NPV
        ? (rowData.capexNPV ?? 0)
        : (rowData.capex ?? 0),
    opex:
      type === COST_TYPE_SELECTOR.NPV
        ? (rowData.opexNPV ?? 0)
        : (rowData.opex ?? 0),
  };

  return [
    {
      id: `segment-${type}-${projectName}-${values.capex}`,
      value: values.capex,
      colorClass: "bg-sky-blue-500",
    },
    {
      id: `segment-${type}-${projectName}-${values.opex}`,
      value: values.opex,
      colorClass: "bg-sky-blue-200",
    },
  ];
};

/**
 * Calculate break-even cost per ton of CO2e based on selected price type
 * OPEX_BREAKEVEN: opex / creditsIssued
 * TOTAL_COST_BREAKEVEN: totalCost / creditsIssued
 */
const calculateBreakevenCostPerTon = (
  rowData: Parameters<typeof columnHelper.accessor>[0],
  filters: z.infer<typeof filtersSchema>,
): number | null => {
  const isNPV = filters.costRangeSelector === COST_TYPE_SELECTOR.NPV;
  const costToUse = isNPV ? rowData.totalCostNPV : rowData.totalCost;
  const opexToUse = isNPV ? rowData.opexNPV : rowData.opex;
  const creditsIssued = rowData.creditsIssued;

  console.log("Breakeven calculation:", {
    projectName: rowData.projectName,
    isNPV,
    costToUse: typeof costToUse === "string" ? parseFloat(costToUse) : costToUse,
    opexToUse: typeof opexToUse === "string" ? parseFloat(opexToUse) : opexToUse,
    creditsIssued: typeof creditsIssued === "string" ? parseFloat(creditsIssued) : creditsIssued,
    priceType: filters.priceType,
  });

  if (!creditsIssued || creditsIssued === 0) {
    return null;
  }

  if (filters.priceType === PROJECT_PRICE_TYPE.OPEX_BREAKEVEN) {
    return opexToUse && opexToUse > 0 ? opexToUse / creditsIssued : null;
  } else if (filters.priceType === PROJECT_PRICE_TYPE.TOTAL_COST_BREAKEVEN) {
    return costToUse && costToUse > 0 ? costToUse / creditsIssued : null;
  }

  return null;
};

export const columns = (filters: z.infer<typeof filtersSchema>) => [
  columnHelper.accessor("projectName", {
    enableSorting: true,
    header: renderHeader("Project Name"),
  }),
  columnHelper.accessor("scoreCardRating", {
    enableSorting: true,
    header: renderHeader("Scorecard rating"),
    cell: (props) => {
      const value = props.getValue();
      if (value === undefined) {
        return "-";
      }
      return <ScoreIndicator value={value as PROJECT_SCORE} />;
    },
  }),
  columnHelper.accessor(
    (row) => calculateBreakevenCostPerTon(row, filters),
    {
      id: "breakEvenCostPerTCO2e",
      enableSorting: true,
      header: renderHeader("Break-even cost $(USD)/tCO2e"),
      cell: (props) => {
        const value = props.getValue();
        if (value === null || value === undefined) {
          return "-";
        }

        if (String(value) === "0") {
          return <CellText className="whitespace-nowrap">NA</CellText>;
        }

        return <CellText>{formatCurrency(value)}</CellText>;
      },
    },
  ),
  columnHelper.accessor("abatementPotential", {
    enableSorting: true,
    header: renderHeader("Credit potential (tCO2e)"),
    cell: (props) => {
      const value = props.getValue();
      if (value === null || value === undefined) {
        return "-";
      }
      if ((value as unknown as string) === "0") {
        return (
          <CellText className="whitespace-nowrap">
            insignificant or minimal
          </CellText>
        );
      }

      const state = props.table.getState() as TableStateWithMaximums;

      return (
        <div className="flex items-center gap-2">
          <SingleStackedBarChart
            total={{
              id: `total-${props.row.original.projectName}-${value}`,
              value: state.maximums?.maxAbatementPotential ?? 0,
              colorClass: "bg-sky-blue-950",
            }}
            segments={[
              {
                id: `segment-${props.row.original.projectName}-${value}`,
                value: props.getValue() ?? 0,
                colorClass: "bg-green",
              },
            ]}
          />
          <CellText>{formatNumber(value)}</CellText>
        </div>
      );
    },
  }),
  columnHelper.accessor(
    getAccessor("totalCost", filters.costRangeSelector === "npv"),
    {
      enableSorting: true,
      header: () => (
        <HeaderText>
          Total Cost (<span className="text-sky-blue-500">CapEx</span>
          &nbsp;+&nbsp;
          <span className="text-sky-blue-200">OpEx</span>)
        </HeaderText>
      ),
      cell: (props) => {
        const value = props.getValue();
        if (value === null || value === undefined) {
          return "-";
        }

        const state = props.table.getState() as TableStateWithMaximums;

        return (
          <div className="flex items-center gap-2">
            <SingleStackedBarChart
              total={{
                id: `total-${props.row.original.projectName}-${value}`,
                value:
                  state.maximums?.maxTotalCost[filters.costRangeSelector] ?? 0,
                colorClass: "bg-sky-blue-950",
              }}
              segments={createSegments(
                filters.costRangeSelector,
                props.row.original.projectName ?? "project",
                props.row.original,
              )}
            />
            <CellText>{formatNumber(value)}</CellText>
          </div>
        );
      },
    },
  ),
];
