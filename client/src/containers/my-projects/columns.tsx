import * as React from "react";
import { useCallback, useState } from "react";

import Link from "next/link";

import {
  DotsHorizontalIcon,
  ExclamationTriangleIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { ACTIVITY } from "@shared/entities/activity.enum";
import { CustomProject as CustomProjectEntity } from "@shared/entities/custom-project.entity";
import { Changelog } from "@shared/entities/model-versioning/changelog.type";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef, Row, Table as TableInstance } from "@tanstack/react-table";
import { AlertTriangleIcon, PencilLineIcon } from "lucide-react";
import { useSession } from "next-auth/react";

import { FEATURE_FLAGS } from "@/lib/feature-flags";
import { formatCurrency } from "@/lib/format";
import { client } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { cn, getAuthHeader } from "@/lib/utils";

import { DEFAULT_CUSTOM_PROJECTS_QUERY_KEY } from "@/app/my-projects/url-store";

import useLatestChangelog from "@/hooks/use-latest-changelog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogContentContainer,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast/use-toast";

type CustomProject = Partial<CustomProjectEntity>;

type CustomColumn = ColumnDef<CustomProject, keyof CustomProject> & {
  className?: string;
};

const VersionDisplay = ({ changelog }: { changelog: Changelog }) => {
  const [open, setOpen] = useState(false);
  const { data: latestVersion } = useLatestChangelog();

  if (!changelog) {
    return <Badge variant="outline">N/A</Badge>;
  }

  const isOutdated =
    new Date(changelog.createdAt) < new Date(latestVersion?.createdAt ?? "");

  return (
    <div className="space-x-3 text-sm">
      <span className="flex items-center gap-1 space-x-1">
        <Badge variant="outline">{changelog.versionName}</Badge>
        {isOutdated && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
              <AlertTriangleIcon className="h-5 w-5" />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader className="space-y-4">
                <DialogTitle>Information</DialogTitle>
                <DialogContentContainer>
                  <p className="text-sm">
                    This project uses an outdated version. Please go to the{" "}
                    <Button
                      asChild
                      variant="link"
                      className="h-auto p-0 text-primary"
                    >
                      <Link href="/methodology">Methodology section</Link>
                    </Button>{" "}
                    to review the most accurate values.
                  </p>
                </DialogContentContainer>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={() => setOpen(false)}>OK</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </span>
    </div>
  );
};

const ActionsDropdown = ({
  instance,
}: {
  instance: TableInstance<CustomProject> | Row<CustomProject>;
}) => {
  const { "update-selection": updateSelection } = FEATURE_FLAGS;
  const isHeader = "getSelectedRowModel" in instance;
  const deleteLabel = isHeader ? "Delete selection" : "Delete project";
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const deleteCustomProjects = useCallback(
    async (ids: string[]): Promise<boolean> => {
      try {
        const { status } =
          await client.customProjects.deleteCustomProjects.mutation({
            extraHeaders: {
              ...getAuthHeader(session?.accessToken as string),
            },
            body: { ids },
          });

        if (status === 200) {
          const myProjectsQueryKey = queryKeys.customProjects.all().queryKey;
          await queryClient.invalidateQueries({
            predicate: (query) => query.queryKey[0] === myProjectsQueryKey[0],
          });
        }

        return status === 200;
      } catch (e) {
        return false;
      }
    },
    [session?.accessToken, queryClient],
  );

  const handleDelete = async () => {
    let ids: string[] = [];

    if (isHeader) {
      const selectedRows = (
        instance as TableInstance<CustomProject>
      ).getSelectedRowModel().rows;

      ids = selectedRows.map((row) => row.original.id as string);
    } else if (instance.original.id) {
      ids = [instance.original.id];
    }

    const success = await deleteCustomProjects(ids);

    if (success) {
      toast({
        description:
          ids.length === 1
            ? "Project deleted successfully"
            : `${ids.length} projects deleted successfully`,
      });

      await queryClient.invalidateQueries({
        queryKey: DEFAULT_CUSTOM_PROJECTS_QUERY_KEY,
      });

      if (isHeader) {
        (instance as TableInstance<CustomProject>).resetRowSelection();
      } else {
        (instance as Row<CustomProject>).toggleSelected(false);
      }
    } else {
      toast({
        variant: "destructive",
        description:
          ids.length === 1
            ? "Failed to delete project"
            : `Failed to delete ${ids.length} projects`,
      });
    }
  };

  return (
    <div className="flex w-full justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            data-testid="actions-dropdown-button"
          >
            <DotsHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-50" align="end">
          {FEATURE_FLAGS["edit-project"] && !isHeader && (
            <DropdownMenuItem asChild>
              <Link href={`/projects/${instance.original.id}/edit`}>
                <PencilLineIcon className="mr-1 h-4 w-4" />
                Edit project
              </Link>
            </DropdownMenuItem>
          )}
          {updateSelection && (
            <DropdownMenuItem>
              <ExclamationTriangleIcon className="mr-1 h-4 w-4" />
              Update selection
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="cursor-pointer space-x-2 text-sm font-normal"
            disabled={
              isHeader &&
              (instance as TableInstance<CustomProject>).getSelectedRowModel()
                .rows.length === 0
            }
            onClick={handleDelete}
          >
            <TrashIcon className="h-4 w-4" />
            {deleteLabel}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const columns: CustomColumn[] = [
  {
    accessorKey: "projectName",
    header: ({ table }: { table: TableInstance<CustomProject> }) => (
      <div className="flex items-center gap-2">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
        <span>Project</span>
      </div>
    ),
    cell: ({
      row,
      getValue,
    }: {
      row: Row<CustomProject>;
      getValue: () => string;
    }) => (
      <div className="flex items-center gap-2">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
        <Button variant="link" asChild>
          <Link href={`/projects/${row.original.id}`}>{getValue()}</Link>
        </Button>
      </div>
    ),
  },
  {
    accessorKey: "country.name",
    header: "Location",
  },
  {
    accessorKey: "totalCostNPV",
    header: "Total NPV Cost",
    cell: ({ getValue }: { getValue: () => string }) =>
      formatCurrency(Number(getValue()), { maximumFractionDigits: 0 }),
  },
  {
    accessorKey: "abatementPotential",
    header: "Credit potential",
    cell: ({ getValue }: { getValue: () => string }) => getValue(),
  },
  {
    accessorKey: "activity",
    header: "Type",
    cell: ({ getValue }: { getValue: () => string }) => (
      <div className="flex justify-center">
        <Badge
          variant="default"
          className={cn({
            "border-sky-300 bg-blue-500/20 text-sky-blue-300 hover:bg-blue-500/20":
              getValue() === ACTIVITY.CONSERVATION,
            "bg-green-500/20 hover:bg-green-500/20 border-mint-green-200 text-mint-green-200":
              getValue() === ACTIVITY.RESTORATION,
          })}
        >
          {getValue()}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "version",
    header: "Version",
    cell: ({ getValue }) => (
      <VersionDisplay changelog={getValue() as unknown as Changelog} />
    ),
    className: "!border-l-0",
    enableSorting: false,
  },
  {
    accessorKey: "actions",
    header: ({ table }) => <ActionsDropdown instance={table} />,
    cell: ({ row }) => <ActionsDropdown instance={row} />,
    className: "!border-l-0",
    enableSorting: false,
  },
];
