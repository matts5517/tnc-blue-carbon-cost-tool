import { FC } from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ACTIVITY,
  RESTORATION_ACTIVITY_SUBTYPE,
} from "@shared/entities/activity.enum";
import { CARBON_REVENUES_TO_COVER } from "@shared/entities/custom-project.entity";
import { ECOSYSTEM } from "@shared/entities/ecosystem.enum";
import { useAtomValue } from "jotai";
import { FileEdit } from "lucide-react";

import { FEATURE_FLAGS } from "@/lib/feature-flags";

import DetailItem from "@/containers/projects/custom-project/details/detail-item";
import { customProjectIdAtom } from "@/containers/projects/custom-project/store";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface ProjectDetailsProps {
  data: {
    country: { code: string; name: string };
    projectSize: number;
    projectLength: number;
    ecosystem: ECOSYSTEM;
    activity: ACTIVITY;
    lossRate?: number | null;
    carbonRevenuesToCover?: CARBON_REVENUES_TO_COVER;
    initialCarbonPrice: {
      label: string;
      value?: number;
    };
    emissionFactors?: {
      emissionFactor: number | null;
      emissionFactorAgb: number;
      emissionFactorSoc: number;
    } | null;
    restorationActivity?: RESTORATION_ACTIVITY_SUBTYPE;
    sequestrationRate?: number | null;
    totalCreditsIssued?: number;
  };
}

const ProjectDetails: FC<ProjectDetailsProps> = ({ data }) => {
  const {
    country,
    projectSize,
    projectLength,
    ecosystem,
    carbonRevenuesToCover,
    activity,
    initialCarbonPrice,
    lossRate,
    emissionFactors,
    restorationActivity,
    sequestrationRate,
    totalCreditsIssued,
  } = data;
  const idAtom = useAtomValue(customProjectIdAtom);
  const { id } = useParams();
  const projectId = id || idAtom;
  const showEditButton = FEATURE_FLAGS["edit-project"] && projectId;
  return (
    <Card className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Project details</h2>
        {showEditButton && (
          <Button type="button" variant="secondary" asChild>
            <Link
              href={`/projects/${projectId}/edit`}
              data-testid="edit-project-link"
            >
              <FileEdit />
              <span>Edit project</span>
            </Link>
          </Button>
        )}
      </div>
      <div className="grid flex-1 grid-cols-3 gap-6">
        <div className="space-y-3">
          <DetailItem
            label="Country"
            value={country.name}
            countryCode={country.code}
          />
          <DetailItem label="Ecosystem" value={ecosystem} />
          <DetailItem
            label="Carbon revenues to cover"
            value={carbonRevenuesToCover}
          />
        </div>
        <div className="space-y-3">
          <DetailItem
            label="Project size"
            value={
              typeof projectSize === "number"
                ? projectSize
                : Number(projectSize)
            }
            unit="hectares"
          />
          <DetailItem label="Activity type" value={activity} />
          <DetailItem
            label={initialCarbonPrice.label}
            value={initialCarbonPrice.value}
            unit="$"
            numberFormatOptions={{
              maximumFractionDigits: 0,
            }}
          />
        </div>
        <div className="space-y-3">
          <DetailItem
            label="Project length"
            value={projectLength}
            unit="years"
          />
          {typeof lossRate === "number" && (
            <DetailItem
              label="Loss rate"
              value={Math.abs(lossRate)}
              unit="%"
              numberFormatOptions={{
                minimumFractionDigits: 2,
              }}
            />
          )}
          {emissionFactors && (
            <DetailItem
              label="Emission factor"
              value={emissionFactors.emissionFactor}
              subValues={
                !emissionFactors.emissionFactor
                  ? [
                      {
                        label: "AGB",
                        value: emissionFactors.emissionFactorAgb,
                        unit: "tCO2e/ha/yr",
                      },
                      {
                        label: "SOC",
                        value: emissionFactors.emissionFactorSoc,
                        unit: "tCO2e/ha/yr",
                      },
                    ]
                  : undefined
              }
              unit={emissionFactors.emissionFactor ? "tCO2e/ha/yr" : undefined}
            />
          )}
          {restorationActivity && (
            <DetailItem
              label="Restoration activity type"
              value={restorationActivity}
            />
          )}
          {sequestrationRate && (
            <DetailItem
              label="Sequestration rate"
              value={sequestrationRate}
              unit="tCO2e/ha/yr"
            />
          )}
          {typeof totalCreditsIssued === "number" && (
            <DetailItem
              label="Total credit generation"
              value={totalCreditsIssued}
              unit="tCO2e"
            />
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProjectDetails;
