"use client";

import { useState, useMemo } from "react";

import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { projectsQuerySchema } from "@shared/contracts/projects.contract";
import { PaginatedProjectsWithMaximums } from "@shared/dtos/projects/projects.dto";
import { COST_TYPE_SELECTOR } from "@shared/entities/projects.entity";
import { keepPreviousData } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  PaginationState,
  useReactTable,
  TableState,
} from "@tanstack/react-table";
import { ChevronsUpDownIcon } from "lucide-react";
import { z } from "zod";

import { client } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

import {
  useProjectOverviewFilters,
  useTableView,
} from "@/app/(overview)/url-store";

import { useTablePaginationReset } from "@/hooks/use-table-pagination-reset";

import { useProjectDetails } from "@/containers/overview/hooks";
import {
  DEFAULT_TABLE_SETTINGS,
  getColumnSortTitle,
  NO_DATA,
  NoResults,
  useSorting,
} from "@/containers/overview/table/utils";
import { columns } from "@/containers/overview/table/view/overview/columns";
import {
  filtersToQueryParams,
  getVisibleProjectIds,
} from "@/containers/overview/utils";

import {
  ScrollableTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TablePagination, {
  PAGINATION_SIZE_OPTIONS,
} from "@/components/ui/table-pagination";

type filterFields = z.infer<typeof projectsQuerySchema.shape.fields>;
type sortFields = z.infer<typeof projectsQuerySchema.shape.sort>;
export interface TableStateWithMaximums extends TableState {
  maximums?: {
    maxAbatementPotential: number;
    maxTotalCost: {
      [COST_TYPE_SELECTOR.NPV]: number;
      [COST_TYPE_SELECTOR.TOTAL]: number;
    };
  };
}

export function OverviewTable() {
  const [tableView] = useTableView();
  const [filters] = useProjectOverviewFilters();
  const { handleOpenDetails } = useProjectDetails();
  const { sorting, handleSortingChange } = useSorting();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: Number.parseInt(PAGINATION_SIZE_OPTIONS[0]),
  });
  useTablePaginationReset(filters.keyword, setPagination);

  const queryKey = queryKeys.tables.all(tableView, projectsQuerySchema, {
    ...filters,
    sorting,
    pagination,
  }).queryKey;

  const columnsBasedOnFilters = useMemo(() => columns(filters), [filters]);

  const { data, isSuccess } = client.projects.getProjects.useQuery(
    queryKey,
    {
      query: {
        ...filtersToQueryParams(filters),
        fields: [
          "id",
          "capex",
          "capexNPV",
          "opex",
          "opexNPV",
          "totalCost",
          "totalCostNPV",
          "creditsIssued",
        ].concat(columnsBasedOnFilters.map((column) => column.accessorKey)) as filterFields,
        ...(sorting.length > 0 && {
          sort: sorting.map(
            (sort) => `${sort.desc ? "-" : ""}${sort.id}`,
          ) as sortFields,
        }),
        costRange: filters.costRange,
        abatementPotentialRange: filters.abatementPotentialRange,
        costRangeSelector: filters.costRangeSelector,
        pageNumber: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        partialProjectName: filters.keyword,
        withMaximums: true,
      },
    },
    {
      queryKey,
      select: (data) => {
        console.log("Projects data:", data); // See in browser console
        return data.body;
      },
      placeholderData: keepPreviousData,
    },
  );

  const visibleProjectIds = useMemo(() => getVisibleProjectIds(data), [data]);

  const maximums = useMemo(
    () => ({
      maxAbatementPotential: isSuccess
        ? Math.max(...data.data.map((item) => item.abatementPotential ?? 0))
        : 0,
      maxTotalCost: isSuccess
        ? {
            [COST_TYPE_SELECTOR.NPV]: Math.max(
              ...data.data.map((item) => item.totalCostNPV ?? 0),
            ),
            [COST_TYPE_SELECTOR.TOTAL]: Math.max(
              ...data.data.map((item) => item.totalCost ?? 0),
            ),
          }
        : 0,
    }),
    [isSuccess, data?.data],
  );

  const table = useReactTable<PaginatedProjectsWithMaximums["data"][0]>({
    ...DEFAULT_TABLE_SETTINGS,
    data: isSuccess ? data.data : NO_DATA,
    columns: columnsBasedOnFilters,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
      pagination,
      maximums,
    } as TableStateWithMaximums,
    onSortingChange: handleSortingChange,
    onPaginationChange: setPagination,
  });

  return (
    <>
      <ScrollableTable>
        <TableHeader className="sticky top-0">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="divide-background">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn({
                          "flex items-center space-x-2": true,
                          "cursor-pointer select-none":
                            header.column.getCanSort(),
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                        title={getColumnSortTitle(header.column)}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {{
                          asc: <ChevronUpIcon className="h-4 w-4" />,
                          desc: <ChevronDownIcon className="h-4 w-4" />,
                        }[header.column.getIsSorted() as string] ?? (
                          <ChevronsUpDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isSuccess &&
            table.getRowModel().rows.map((row) => (
              <TableRow
                className="group cursor-pointer transition-colors hover:bg-big-stone-950"
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={() =>
                  handleOpenDetails(row.original.id!, visibleProjectIds)
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn({
                      "p-0": cell.column.id === "scoreCardRating",
                      "group-hover:underline": cell.column.id === "projectName",
                      "min-w-[200px] max-w-[200px] truncate":
                        cell.column.id === "projectName",
                      "px-4 py-2": cell.column.id !== "scoreCardRating",
                    })}
                    title={
                      typeof cell.getValue() === "string"
                        ? (cell.getValue() as string)
                        : undefined
                    }
                    style={
                      cell.column.id === "projectName"
                        ? {
                            minWidth: "fit-content",
                            maxWidth: "100%",
                          }
                        : undefined
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {isSuccess && data.data.length === 0 && (
            <TableRow>
              <NoResults colSpan={columnsBasedOnFilters.length} />
            </TableRow>
          )}
        </TableBody>
      </ScrollableTable>

      {isSuccess && data.data.length > 0 && (
        <TablePagination
          onChangePagination={setPagination}
          pagination={{
            ...pagination,
            totalPages: data?.metadata?.totalPages ?? 0,
            totalItems: data?.metadata?.totalItems ?? 0,
          }}
        />
      )}
    </>
  );
}
