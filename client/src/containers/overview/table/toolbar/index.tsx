import { cn } from "@/lib/utils";

import { KEY_COSTS, SCORECARD_PRIORITIZATION } from "@/constants/tooltip";

import SearchProjectsTable from "@/containers/overview/table/toolbar/search";
import TabsProjectsTable from "@/containers/overview/table/toolbar/table-selector";

import InfoButton from "@/components/ui/info-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ScorecardMetric {
  name: string;
  description: string;
  weight: number;
}

interface KeyCost {
  name: string;
  description: string | keyof typeof KEY_COSTS;
}

const SCORECARD_METRICS: ScorecardMetric[] = [
  {
    name: "Economic feasibility",
    description: "FINANCIAL_FEASIBILITY",
    weight: 20,
  },
  {
    name: "Credit potential",
    description: "ABATEMENT_POTENTIAL",
    weight: 18,
  },
  { name: "Legal feasibility", description: "LEGAL_FEASIBILITY", weight: 12 },
  {
    name: "Implementation risk score",
    description: "IMPLEMENTATION_FEASIBILITY",
    weight: 12,
  },
  { name: "Social feasibility", description: "SOCIAL_FEASIBILITY", weight: 12 },
  {
    name: "Availability of experienced labor",
    description: "AVAILABILITY_OF_EXPERIENCED_LABOR",
    weight: 10,
  },
  { name: "Security rating", description: "SECURITY_FEASIBILITY", weight: 5 },
  {
    name: "Availability of alternative funding",
    description: "AVAILABILITY_OF_ALTERNATIVE_FUNDING",
    weight: 5,
  },
  {
    name: "Coastal protection benefit",
    description: "COASTAL_PROTECTION_BENEFIT",
    weight: 3,
  },
  {
    name: "Biodiversity benefit",
    description: "BIODIVERSITY_BENEFIT",
    weight: 3,
  },
];

const KEY_COSTS_DATA: KeyCost[] = [
  {
    name: "Implementation labor",
    description: "IMPLEMENTATION_LABOR",
  },
  {
    name: "Landowner/community benefit share",
    description: "COMMUNITY_BENEFIT_SHARING_FUND",
  },
  {
    name: "Monitoring and maintenance",
    description: "MONITORING_AND_MAINTENANCE",
  },
  {
    name: "Community representation/liaison",
    description: "COMMUNITY_REPRESENTATION",
  },
  {
    name: "Conservation planning and admin",
    description:
      "Approximated as the salaries of a project manager and a program coordinator. 20% of the salaries is added to account for meetings/ expenses. 75% of these approximations are considered here and 25% of these costs are applied for community representation/ liaison",
  },
  {
    name: "Long-term project operating",
    description: "LONG_TERM_OPERATING",
  },
  {
    name: "Carbon standard fees",
    description: "CARBON_STANDARD_FEES",
  },
];

const TABS_TRIGGER_CLASSES =
  "border-b-2 border-transparent transition-colors data-[state=active]:!border-sky-blue-300 data-[state=active]:bg-transparent";

export default function ToolbarProjectsTable() {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <SearchProjectsTable />
      <TabsProjectsTable />
      <div className="flex flex-1 items-center justify-end space-x-2">
        <span className="text-sm text-muted-foreground">Table details</span>
        <InfoButton title="Table details">
          <div className="relative flex h-[600px] w-[auto] flex-col">
            <Tabs
              defaultValue="general"
              className="flex h-full w-full flex-col"
            >
              <div className="sticky top-0 z-10 bg-background">
                <TabsList className="w-full justify-start space-x-6 divide-x-0 divide-transparent rounded-none border border-l-0 border-r-0 border-t-0 bg-transparent p-0">
                  <TabsTrigger
                    value="general"
                    className={cn(TABS_TRIGGER_CLASSES, "ml-0 px-0")}
                  >
                    General
                  </TabsTrigger>
                  <TabsTrigger
                    value="overview"
                    className={TABS_TRIGGER_CLASSES}
                  >
                    Overview table
                  </TabsTrigger>
                  <TabsTrigger
                    value="scorecard"
                    className={TABS_TRIGGER_CLASSES}
                  >
                    Scorecard prioritization table
                  </TabsTrigger>
                  <TabsTrigger value="costs" className={TABS_TRIGGER_CLASSES}>
                    Key costs table
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="h-full overflow-y-hidden pb-6">
                <TabsContent
                  value="general"
                  className="mt-4 h-full space-y-2 text-sm data-[state=inactive]:hidden"
                >
                  <p>
                    This table offers three distinct views, showcasing modelled
                    project scenarios across various countries, activity types,
                    and sizes. Use the filters to refine your results, or adjust
                    the selectors at the top (Carbon price type, Cost type). The
                    modelled scenarios can provide insight to the financial
                    feasibility of blue carbon market projects across
                    geographies, types and sizes.
                  </p>
                  <p>
                    The project name includes the country, ecosystem, activity
                    and project size for each modelled scenario. Scorecard
                    rating is the overall score for the modeled project
                    scenario, based on weighted non-economic scores and economic
                    feasibility. See the &quot;Scorecard prioritization
                    table&quot; tab for more details.
                  </p>
                  <p>
                    Cost $(USD)/tCO2e is the total cost at NPV per credit,
                    measured as a metric ton of CO2e, for the project scenario.
                    Abatement potential (tCO2e/yr) is the estimated blue carbon
                    credit potential of each project scenario, measured in
                    metric tons of CO2e per year.
                  </p>
                  <p>
                    Total cost (CAPEX + OPEX) is in USD for each modelled
                    project scenario.
                  </p>
                  <p>All modeled scenarios are across 20 years.</p>
                </TabsContent>

                <TabsContent
                  value="overview"
                  className="mt-4 h-full space-y-4 text-sm data-[state=inactive]:hidden"
                >
                  <p>
                    In addition to economic feasibility and abatement potential,
                    this table includes{" "}
                    <span className="font-medium">
                      qualitative, non-economic scores
                    </span>
                    , which may vary by country or ecosystem. Each
                    project&apos;s overall score combines these non-economic
                    scores with economic feasibility and abatement potential to
                    give a comprehensive evaluation. These scores add additional
                    insights for project assessment.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-1/3 font-medium">Low</div>
                      <div className="w-1/3 text-center font-medium">
                        Medium
                      </div>
                      <div className="w-1/3 text-right font-medium">High</div>
                    </div>
                    <div className="to-green-500 h-2 w-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500" />
                  </div>
                </TabsContent>

                <TabsContent
                  value="scorecard"
                  className="mt-4 h-full space-y-4 data-[state=inactive]:hidden"
                >
                  <ScrollArea className="h-full pr-4">
                    <div className="space-y-6">
                      <div className="space-y-2 text-sm">
                        <p>
                          In addition to economic feasibility and abatement
                          potential, this table includes{" "}
                          <span className="font-medium">
                            qualitative, non-economic scores
                          </span>
                          , which may vary by country or ecosystem. Each
                          project&apos;s overall score combines these
                          non-economic scores with economic feasibility and
                          abatement potential to give a comprehensive
                          evaluation. These scores add additional insights for
                          project assessment.
                        </p>
                        <p className="!mt-6">
                          Each metric can go from a scale from low to high:
                        </p>
                        <div className="!mt-4 grid grid-cols-3 gap-2 text-center">
                          <div className="h-fit rounded-md bg-ramps-red p-2 text-sky-blue-950">
                            <div className="font-medium">Low</div>
                          </div>
                          <div className="h-fit rounded-md bg-ramps-yellow p-2 text-sky-blue-950">
                            <div className="font-medium">Medium</div>
                          </div>
                          <div className="h-fit rounded-md bg-ramps-green p-2 text-sky-blue-950">
                            <div className="font-medium">High</div>
                          </div>
                        </div>
                      </div>

                      <Table className="rounded-md border">
                        <TableHeader>
                          <TableRow className="divide-x-0 text-xs">
                            <TableHead className="border-r-0">Metric</TableHead>
                            <TableHead className="border-r-0">
                              Description
                            </TableHead>
                            <TableHead className="w-24 border-r-0 text-right">
                              Weight
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {SCORECARD_METRICS.map((metric) => (
                            <TableRow key={metric.name} className="divide-x-0">
                              <TableCell className="border-r-0 font-medium">
                                {metric.name}
                              </TableCell>
                              <TableCell className="border-r-0">
                                {
                                  SCORECARD_PRIORITIZATION[
                                    metric.description as keyof typeof SCORECARD_PRIORITIZATION
                                  ]
                                }
                              </TableCell>
                              <TableCell className="border-r-0 text-right">
                                {metric.weight}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent
                  value="costs"
                  className="mt-4 h-full space-y-4 data-[state=inactive]:hidden"
                >
                  <ScrollArea className="h-full pr-4">
                    <div className="space-y-6">
                      <div className="space-y-2 text-sm">
                        <p>
                          This table provides an overview of the most
                          significant cost components for typical blue carbon
                          projects, categorized by country, ecosystem, and
                          activity. This table enables easy comparison of these
                          essential cost components.
                        </p>
                        <p className="!mt-4">
                          Each metric is color coded depending on the minimum
                          range for each metric.
                        </p>
                        <div className="!mt-4 flex flex-col gap-2">
                          <div className="h-4 w-full bg-gradient-to-r from-[#E7C4B1] via-[#EEE0BD] to-[#C7DBBC]" />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Min value</span>
                            <span>Max value</span>
                          </div>
                        </div>
                      </div>

                      <Table className="rounded-md border">
                        <TableHeader>
                          <TableRow className="divide-x-0 text-xs">
                            <TableHead className="border-r-0">Metric</TableHead>
                            <TableHead className="border-r-0">
                              Description
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {KEY_COSTS_DATA.map((cost) => (
                            <TableRow className="divide-x-0" key={cost.name}>
                              <TableCell className="border-r-0 font-medium">
                                {cost.name}
                              </TableCell>
                              <TableCell className="border-r-0">
                                {typeof cost.description === "string" &&
                                !KEY_COSTS[
                                  cost.description as keyof typeof KEY_COSTS
                                ]
                                  ? cost.description
                                  : KEY_COSTS[
                                      cost.description as keyof typeof KEY_COSTS
                                    ]}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </InfoButton>
      </div>
    </div>
  );
}
