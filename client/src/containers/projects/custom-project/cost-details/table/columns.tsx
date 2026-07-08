import { SensitivityAnalysis } from "@shared/dtos/custom-projects/custom-project-output.dto";
import { createColumnHelper } from "@tanstack/react-table";

import { useCustomProjectOutput } from "@/hooks/use-custom-project-output";

import SensitivityAnalysisColumn from "@/containers/projects/custom-project/cost-details/table/sensitivity-analysis";

import InfoButton from "@/components/ui/info-button";

export type ColumnsTypes = ReturnType<
  typeof useCustomProjectOutput
>["costDetailsProps"][number] & {
  sensitivityAnalysis: SensitivityAnalysis[keyof SensitivityAnalysis] & {
    scaledNegative: number;
    scaledPositive: number;
  };
};

const columnHelper = createColumnHelper<ColumnsTypes>();

export const columns = [
  columnHelper.accessor("label", {
    enableSorting: true,
    header: () => <span>Cost estimates</span>,
  }),
  columnHelper.accessor("value", {
    enableSorting: true,
    header: () => <span>Cost (USD)</span>,
  }),
  columnHelper.accessor("sensitivityAnalysis", {
    header: () => (
      <div className="flex items-center gap-1">
        <span>Sensitivity analysis</span>
        <InfoButton title="Sensitivity analysis">
          The sensitivity analysis graph shows how a 25% increase (green) or
          decrease (pink) in each cost component affects the cost per ton
          ($/tCO₂e).
          <br />
          <br />
          Use this to quickly identify which cost elements have the greatest
          influence on overall project costs.
        </InfoButton>
      </div>
    ),
    cell: ({ getValue }) => {
      if (!getValue()) return null;

      return <SensitivityAnalysisColumn datum={getValue()} />;
    },
  }),
];
