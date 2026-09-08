import { FC, useState } from "react";

import { ProjectScorecardDto } from "@shared/dtos/projects/project-scorecard.dto";
import { PROJECT_PRICE_TYPE } from "@shared/entities/projects.entity";
import { useAtomValue } from "jotai";

import { projectDetailsFiltersAtom } from "@/app/(overview)/store";

import { PROJECT_DETAILS } from "@/constants/tooltip";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectDetailsOffsetPriceProps {
  data?: ProjectScorecardDto["projectCost"];
  creditsIssued?: number;
  priceType?: PROJECT_PRICE_TYPE;
}

const ProjectDetailsOffsetPrice: FC<ProjectDetailsOffsetPriceProps> = ({
  data,
  creditsIssued = 0,
  priceType = PROJECT_PRICE_TYPE.OPEX_BREAKEVEN,
}) => {
  const { costRangeSelector } = useAtomValue(projectDetailsFiltersAtom);
  const [selectedPriceType, setSelectedPriceType] = useState(priceType);

  const costData = data?.[costRangeSelector];
  
  // Calculate offset price based on selected price type
  const creditsIssuedNum = typeof creditsIssued === "string" 
    ? parseFloat(creditsIssued) 
    : creditsIssued;

  let offsetPrice = 0;
  
  if (creditsIssuedNum && creditsIssuedNum > 0) {
    if (selectedPriceType === PROJECT_PRICE_TYPE.OPEX_BREAKEVEN) {
      const opexNum = typeof costData?.opex === "string" 
        ? parseFloat(costData.opex) 
        : costData?.opex || 0;
      offsetPrice = opexNum / creditsIssuedNum;
    } else if (selectedPriceType === PROJECT_PRICE_TYPE.TOTAL_COST_BREAKEVEN) {
      const totalCostNum = typeof costData?.totalCost === "string" 
        ? parseFloat(costData.totalCost) 
        : costData?.totalCost || 0;
      offsetPrice = totalCostNum / creditsIssuedNum;
    }
  }

  const getPriceTypeLabel = (type: PROJECT_PRICE_TYPE) => {
    return type === PROJECT_PRICE_TYPE.OPEX_BREAKEVEN
      ? "OpEx breakeven"
      : "Total cost breakeven";
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Label
              className="text-md font-medium"
              tooltip={{
                title: "Offset price",
                content: PROJECT_DETAILS.BREAK_EVEN_COST,
              }}
            >
              <h3 className="text-md">Offset price</h3>
            </Label>
          </div>
          <div className="text-sm text-muted-foreground">
            Cost per ton of CO2 equivalent
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              ${offsetPrice.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-sm text-muted-foreground">/tCO₂e</span>
          </div>

          <div className="w-full">
            <Label htmlFor="price-type" className="mb-2 block text-sm">
              Price type
            </Label>
            <Select 
              value={selectedPriceType} 
              onValueChange={(value) => setSelectedPriceType(value as PROJECT_PRICE_TYPE)}
            >
              <SelectTrigger id="price-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PROJECT_PRICE_TYPE.OPEX_BREAKEVEN}>
                  {getPriceTypeLabel(PROJECT_PRICE_TYPE.OPEX_BREAKEVEN)}
                </SelectItem>
                <SelectItem value={PROJECT_PRICE_TYPE.TOTAL_COST_BREAKEVEN}>
                  {getPriceTypeLabel(PROJECT_PRICE_TYPE.TOTAL_COST_BREAKEVEN)}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetailsOffsetPrice;
