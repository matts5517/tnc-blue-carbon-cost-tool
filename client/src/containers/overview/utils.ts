import { ApiPaginationResponse } from "@shared/dtos/global/api-response.dto";
import { ProjectKeyCosts } from "@shared/dtos/projects/project-key-costs.dto";
import { PaginatedProjectsWithMaximums } from "@shared/dtos/projects/projects.dto";
import { Project } from "@shared/entities/projects.entity";
import { z } from "zod";

import { filtersSchema } from "@/app/(overview)/constants";

import { scorecardFiltersSchema } from "@/containers/overview/table/view/scorecard-prioritization/schema";

const OMITTED_FIELDS = [
  "keyword",
  "costRange",
  "abatementPotentialRange",
  "costRangeSelector",
];

export const filtersToQueryParams = (
  filters: z.infer<typeof filtersSchema | typeof scorecardFiltersSchema>,
) => {
  return Object.keys(filters)
    .filter(
      (key) =>
        !OMITTED_FIELDS.includes(key) &&
        filters[key as keyof typeof filters] !== "",
    )
    .reduce(
      (acc, key) => ({
        ...acc,
        [`filter[${key}]`]: filters[key as keyof typeof filters],
      }),
      {},
    );
};

export const getVisibleProjectIds = (
  data?:
    | ApiPaginationResponse<Project>
    | PaginatedProjectsWithMaximums
    | ApiPaginationResponse<ProjectKeyCosts>,
): string[] => {
  if (!data) return [];

  return data.data.map((item) => item.id).filter((id) => id !== undefined);
};
