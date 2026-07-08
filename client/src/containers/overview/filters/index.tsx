import { useState, useEffect } from "react";

import { CheckedState } from "@radix-ui/react-checkbox";
import { getProjectsQuerySchema } from "@shared/contracts/projects.contract";
import { ACTIVITY } from "@shared/entities/activity.enum";
import { ECOSYSTEM } from "@shared/entities/ecosystem.enum";
import { PROJECT_SIZE_FILTER } from "@shared/entities/projects.entity";
import { keepPreviousData } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { XIcon } from "lucide-react";
import { useDebounce } from "rooks";
import { z } from "zod";

import { formatNumber } from "@/lib/format";
import { client } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

import { INITIAL_FILTERS_STATE } from "@/app/(overview)/constants";
import { projectsUIState } from "@/app/(overview)/store";
import { useProjectOverviewFilters } from "@/app/(overview)/url-store";

import { FILTERS } from "@/constants/tooltip";

import { filtersToQueryParams } from "@/containers/overview/utils";

import { Button } from "@/components/ui/button";
import { CheckboxWrapper } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RangeSlider, SliderLabels } from "@/components/ui/slider";

import { ACTIVITIES } from "./constants";

export const FILTERS_SIDEBAR_WIDTH = 320;

export default function ProjectsFilters() {
  const [filters, setFilters] = useProjectOverviewFilters();
  const setFiltersOpen = useSetAtom(projectsUIState);

  const closeFilters = () => {
    setFiltersOpen((prev) => ({ ...prev, filtersOpen: false }));
  };

  const { queryKey: countriesQueryKey } = queryKeys.countries.all;
  const { data: countryOptions } = client.projects.getProjectCountries.useQuery(
    countriesQueryKey,
    {},
    {
      queryKey: countriesQueryKey,
      select: (data) =>
        data.body.data.map(({ name, code }) => ({ label: name, value: code })),
    },
  );

  const handleEcosystemChange = async (
    isChecked: CheckedState,
    ecosystem: ECOSYSTEM,
  ) => {
    await setFilters((prev) => ({
      ...prev,
      ecosystem: isChecked
        ? [...prev.ecosystem, ecosystem]
        : prev.ecosystem.filter((e) => e !== ecosystem),
    }));
  };

  const handleActivityChange = async (
    isChecked: CheckedState,
    activity: ACTIVITY,
  ) => {
    await setFilters((prev) => ({
      ...prev,
      activity: isChecked
        ? [...prev.activity, activity]
        : prev.activity.filter((e) => e !== activity),
    }));
  };

  const handleSubActivityChange = async (
    isChecked: CheckedState,
    subActivity: (typeof filters.restorationActivity)[number],
  ) => {
    await setFilters((prev) => ({
      ...prev,
      restorationActivity: isChecked
        ? [...prev.restorationActivity, subActivity]
        : prev.restorationActivity.filter((e) => e !== subActivity),
    }));
  };

  const handleProjectSizeChange = async (
    isChecked: CheckedState,
    size: PROJECT_SIZE_FILTER,
  ) => {
    await setFilters((prev) => ({
      ...prev,
      projectSizeFilter: isChecked
        ? [...prev.projectSizeFilter, size]
        : prev.projectSizeFilter.filter((e) => e !== size),
    }));
  };

  const debouncedCostChange = useDebounce(async (cost: number[]) => {
    await setFilters((prev) => ({
      ...prev,
      costRange: cost,
    }));
  }, 250);

  const debouncedAbatementPotentialChange = useDebounce(
    async (abatementPotential: number[]) => {
      await setFilters((prev) => ({
        ...prev,
        abatementPotentialRange: abatementPotential,
      }));
    },
    250,
  );

  const queryParams: z.infer<typeof getProjectsQuerySchema> = {
    ...filtersToQueryParams(filters),
    costRangeSelector: filters.costRangeSelector,
    partialProjectName: filters.keyword,
  };

  const { queryKey: boundsQueryKey } = queryKeys.projects.bounds(queryParams);

  const { data: bounds, isSuccess } =
    client.projects.getProjectsFiltersBounds.useQuery(
      boundsQueryKey,
      {
        query: queryParams,
      },
      {
        queryKey: boundsQueryKey,
        select: (response) => response.body.data,
        placeholderData: keepPreviousData,
      },
    );

  const { queryKey: defaultBoundsQueryKey } = queryKeys.projects.defaultBounds;

  const { data: defaultBounds, isSuccess: isSuccessDefaultBounds } =
    client.projects.getProjectsFiltersBounds.useQuery(
      defaultBoundsQueryKey,
      {
        query: {
          ...filtersToQueryParams(INITIAL_FILTERS_STATE),
          costRangeSelector: INITIAL_FILTERS_STATE.costRangeSelector,
          partialProjectName: INITIAL_FILTERS_STATE.keyword,
        },
      },
      {
        queryKey: defaultBoundsQueryKey,
        select: (response) => response.body.data,
        placeholderData: keepPreviousData,
      },
    );

  const [costValuesState, setCostValuesState] = useState([
    filters.costRange[0] ?? bounds?.cost.min,
    filters.costRange[1] ?? bounds?.cost.max,
  ]);

  const [abatementValueState, setAbatementValueState] = useState([
    filters.abatementPotentialRange[0] ?? bounds?.abatementPotential.min,
    filters.abatementPotentialRange[1] ?? bounds?.abatementPotential.max,
  ]);

  const resetFilters = async () => {
    await setFilters(() => INITIAL_FILTERS_STATE);

    if (isSuccessDefaultBounds) {
      setCostValuesState([defaultBounds.cost.min, defaultBounds.cost.max]);
      setAbatementValueState([
        defaultBounds.abatementPotential.min,
        defaultBounds.abatementPotential.max,
      ]);
    }
  };

  useEffect(() => {
    if (isSuccess && bounds?.cost && bounds?.abatementPotential) {
      setCostValuesState([bounds.cost.min, bounds.cost.max]);
      setAbatementValueState([
        bounds.abatementPotential.min,
        bounds.abatementPotential.max,
      ]);
    }
  }, [isSuccess, bounds]);

  return (
    <section
      className="flex h-full flex-1 flex-col overflow-hidden border-r border-border bg-big-stone-950 pt-6"
      style={{
        width: FILTERS_SIDEBAR_WIDTH,
      }}
    >
      <div className="flex justify-end px-6">
        <Button
          onClick={closeFilters}
          variant="ghost"
          className="h-4 w-4 p-0 hover:bg-transparent"
        >
          <XIcon className="h-4 w-4 text-foreground hover:text-muted-foreground" />
        </Button>
      </div>
      <ScrollArea className="px-6 pb-6">
        <div className="h-full space-y-10">
          <header className="flex w-full flex-col">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold">Filters</h3>
              <Button
                onClick={resetFilters}
                variant="secondary"
                size="sm"
                className="text-xs"
              >
                Reset
              </Button>
            </div>
          </header>

          <div className="space-y-2">
            <Label
              htmlFor="countryCode"
              tooltip={{
                title: "Country",
                content: FILTERS.COUNTRY,
              }}
            >
              Country
            </Label>
            <Select
              name="countryCode"
              defaultValue={filters.countryCode || "all"}
              value={filters.countryCode || "all"}
              onValueChange={async (v) => {
                await setFilters((prev) => ({
                  ...prev,
                  countryCode: v === "all" ? "" : v,
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {countryOptions?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label
              tooltip={{
                title: "Ecosystems",
                content: FILTERS.ECOSYSTEM,
              }}
            >
              Ecosystems
            </Label>
            <ul className="flex flex-col gap-2">
              {Object.values(ECOSYSTEM).map((ecosystem) => (
                <li key={ecosystem}>
                  <CheckboxWrapper
                    label={ecosystem}
                    id={ecosystem}
                    checked={filters.ecosystem.includes(ecosystem)}
                    onCheckedChange={async (isChecked) => {
                      await handleEcosystemChange(isChecked, ecosystem);
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <Label
              tooltip={{
                title: "Activities",
                content: FILTERS.ACTIVITY_TYPE,
              }}
            >
              Activities
            </Label>
            <ul className="flex flex-col gap-2">
              {ACTIVITIES.map((activity) => (
                <li
                  key={activity.value}
                  className={cn({
                    "flex flex-col gap-2": activity.children,
                  })}
                >
                  <CheckboxWrapper
                    label={activity.label}
                    id={activity.value}
                    checked={filters.activity.includes(activity.value)}
                    onCheckedChange={async (isChecked) => {
                      await handleActivityChange(isChecked, activity.value);
                    }}
                  />
                  {activity.children && (
                    <ul className="ml-6 flex flex-col gap-2">
                      {activity.children.map((subActivity) => (
                        <li key={subActivity.value}>
                          <CheckboxWrapper
                            label={subActivity.label}
                            id={subActivity.value}
                            checked={filters.restorationActivity.includes(
                              subActivity.value,
                            )}
                            onCheckedChange={async (isChecked) => {
                              await handleSubActivityChange(
                                isChecked,
                                subActivity.value,
                              );
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <Label
              tooltip={{
                title: "Cost ($)",
                content: FILTERS.COST,
              }}
            >
              Cost ($)
            </Label>
            <RangeSlider
              defaultValue={costValuesState}
              min={bounds?.cost.min}
              max={bounds?.cost.max}
              step={1}
              minStepsBetweenThumbs={1}
              value={costValuesState}
              onValueChange={(v) => {
                setCostValuesState(v);
                debouncedCostChange(v);
              }}
              format={(v) => formatNumber(v, {})}
            />
            <SliderLabels
              min={formatNumber(bounds?.cost.min ?? 0)}
              max={formatNumber(bounds?.cost.max ?? 0)}
            />
          </div>

          <div className="flex flex-col gap-3">
            <Label
              tooltip={{
                title: "Abatement (credit) potential (tCO2e/yr)",
                content: FILTERS.ABATEMENT_POTENTIAL,
              }}
            >
              Abatement Potential (tCO2e/yr)
            </Label>
            <RangeSlider
              defaultValue={abatementValueState}
              min={bounds?.abatementPotential.min}
              max={bounds?.abatementPotential.max}
              step={1}
              value={abatementValueState}
              minStepsBetweenThumbs={1}
              onValueChange={(v) => {
                setAbatementValueState(v);
                debouncedAbatementPotentialChange(v);
              }}
              format={formatNumber}
            />
            <SliderLabels
              min={formatNumber(bounds?.abatementPotential.min ?? 0)}
              max={formatNumber(bounds?.abatementPotential.max ?? 0)}
            />
          </div>

          <div className="space-y-2">
            <Label
              tooltip={{
                title: "Project size",
                content: FILTERS.PROJECT_SIZE,
              }}
            >
              Project size
            </Label>
            <ul className="flex gap-2">
              {Object.values(PROJECT_SIZE_FILTER).map((size) => (
                <li key={size}>
                  <CheckboxWrapper
                    label={size}
                    id={size}
                    checked={filters.projectSizeFilter.includes(size)}
                    onCheckedChange={async (isChecked) => {
                      await handleProjectSizeChange(isChecked, size);
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ScrollArea>
    </section>
  );
}
