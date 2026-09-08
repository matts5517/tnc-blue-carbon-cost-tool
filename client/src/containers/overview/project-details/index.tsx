import { useMemo } from "react";

import { keepPreviousData } from "@tanstack/react-query";
import { useAtom, useAtomValue } from "jotai";

import { client } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";

import {
  projectDetailsAtom,
  projectDetailsFiltersAtom,
} from "@/app/(overview)/store";

import AbatementPotential from "@/containers/overview/project-details/abatement-potential";
import ProjectDetailsCost from "@/containers/overview/project-details/cost";
import CostEstimates from "@/containers/overview/project-details/cost-estimates";
import Footer from "@/containers/overview/project-details/footer";
import ProjectDetailsOffsetPrice from "@/containers/overview/project-details/offset-price";
import Navigation from "@/containers/overview/project-details/navigation";
import ParametersProjects from "@/containers/overview/project-details/parameters";
import ScoreCardRating from "@/containers/overview/project-details/score-card-rating";
import ScoreCardRatings from "@/containers/overview/project-details/score-card-ratings";
import {
  getProjectSizeLabel,
  parseCostEstimatesForTable,
} from "@/containers/overview/project-details/utils";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function ProjectDetails() {
  const { costRangeSelector } = useAtomValue(projectDetailsFiltersAtom);
  const [projectDetails, setProjectDetails] = useAtom(projectDetailsAtom);
  const queryKey = queryKeys.projects.one(projectDetails.id).queryKey;
  const { data: projectData } = client.projects.getProject.useQuery(
    queryKey,
    {
      params: { id: projectDetails.id },
    },
    {
      queryKey,
      select: (data) => data.body.data,
      enabled: projectDetails.isOpen && !!projectDetails.id,
      placeholderData: keepPreviousData,
    },
  );
  const costItems = useMemo(
    () =>
      projectData?.projectCost[costRangeSelector]
        ? parseCostEstimatesForTable(
            projectData?.projectCost[costRangeSelector],
          )
        : [],
    [projectData?.projectCost, costRangeSelector],
  );
  const projectSizeLabel = useMemo(
    () => getProjectSizeLabel(projectData),
    [projectData],
  );

  const handleOpenDetails = (open: boolean) =>
    setProjectDetails({ ...projectDetails, isOpen: open });

  return (
    <Sheet open={projectDetails.isOpen} onOpenChange={handleOpenDetails}>
      <SheetContent className="flex h-full flex-col gap-0 overflow-hidden px-0 pb-0 sm:max-w-[50%]">
        <SheetHeader className="space-y-6 px-6 pb-6">
          <div className="flex gap-4">
            <Navigation />
            <div className="flex items-center justify-between">
              <SheetTitle>{projectData?.projectName}</SheetTitle>
            </div>
          </div>
          <ParametersProjects />
        </SheetHeader>

        <ScrollArea>
          <div className="h-full space-y-6 px-6 pb-6">
            <div className="grid grid-cols-2 gap-4">
              <Card variant="secondary" className="flex flex-col gap-4 p-4">
                <ProjectDetailsCost data={projectData?.projectCost} />
              </Card>

              <Card variant="secondary" className="flex flex-col gap-4 p-4">
                <ProjectDetailsOffsetPrice
                  data={projectData?.projectCost}
                  creditsIssued={projectData?.creditsIssued}
                  priceType={projectData?.priceType}
                />
              </Card>
            </div>

            <div className="flex gap-4">
              <Card variant="secondary" className="w-3/4 p-4">
                <AbatementPotential value={projectData?.abatementPotential} />
              </Card>

              <Card variant="secondary" className="w-1/4 p-4">
                <ScoreCardRating value={projectData?.scoreCardRating} />
              </Card>
            </div>

            <Card variant="secondary" className="p-0">
              <ScoreCardRatings data={projectData?.scorecard} />
            </Card>
            <Card variant="secondary" className="overflow-hidden p-0">
              <CostEstimates items={costItems} />
            </Card>
          </div>
        </ScrollArea>
        <Footer projectSize={projectSizeLabel} />
      </SheetContent>
    </Sheet>
  );
}
