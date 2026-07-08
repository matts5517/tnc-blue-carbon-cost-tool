import { FC } from "react";

import { formatNumber } from "@/lib/format";

import { PROJECT_DETAILS } from "@/constants/tooltip";

import { Label } from "@/components/ui/label";

interface AbatementPotentialProps {
  value?: number;
}

const AbatementPotential: FC<AbatementPotentialProps> = ({ value }) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label
            className="text-md font-medium"
            tooltip={{
              title: "Credit potential",
              content: PROJECT_DETAILS.CREDIT_POTENTIAL,
            }}
          >
            <h3 className="text-base font-semibold">Credit potential</h3>
          </Label>
        </div>
        <span className="space-x-1 text-xl font-normal">
          <span
            className={"inline-block align-top text-xs text-muted-foreground"}
          >
            tCO2e&nbsp;
          </span>
          <span>{formatNumber(value || 0)}</span>
        </span>
      </div>
      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
        <p>Estimation of total CO2 expected during the project.</p>
      </div>
    </>
  );
};

export default AbatementPotential;
