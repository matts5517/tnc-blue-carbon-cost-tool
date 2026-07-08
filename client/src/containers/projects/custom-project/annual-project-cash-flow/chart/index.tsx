"use client";

import { FC } from "react";

import { CARBON_REVENUES_TO_COVER } from "@shared/entities/custom-project.entity";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency, formatNumber } from "@/lib/format";

import {
  cashflowConfig,
  cumulativeNetIncomePlanTooltipLabel,
  YearlyBreakdownChartData,
} from "@/containers/projects/custom-project/annual-project-cash-flow/utils";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const CHART_COLORS = {
  estimatedRevenuePlan: "hsl(var(--chart-1))",
  opexTotalCostPlan: "hsl(var(--chart-2))",
  capexTotalCostPlan: "hsl(var(--chart-3))",
  annualNetCashFlow: "hsl(var(--chart-4)",
  cumulativeNetIncomePlan: "hsl(var(--chart-5))",
  cumulativeCreditsPlan: "hsl(200, 100%, 55%)",
} as const;

interface CashflowChartProps {
  data: YearlyBreakdownChartData;
  breakevenPoint: number | null;
  carbonRevenuesToCover?: CARBON_REVENUES_TO_COVER;
}

const CashflowChart: FC<CashflowChartProps> = ({
  data,
  breakevenPoint,
  carbonRevenuesToCover,
}) => {
  return (
    <ChartContainer
      config={{
        estimatedRevenuePlan: {
          label: "Est revenue",
          color: "hsl(var(--chart-1))",
        },
        opexTotalCostPlan: {
          label: "Total OpEx",
          color: "hsl(var(--chart-2))",
        },
        capexTotalCostPlan: {
          label: "Total CapEx",
          color: "hsl(var(--chart-3))",
        },
        annualNetCashFlow: {
          label: "Annual net cash flow",
          color: "hsl(var(--chart-4))",
          icon: () => <div className="h-[3px] w-[24px] bg-chart-4" />,
        },
        cumulativeNetIncomePlan: {
          label:
            cumulativeNetIncomePlanTooltipLabel[
              carbonRevenuesToCover as keyof typeof cumulativeNetIncomePlanTooltipLabel
            ],
          color: "hsl(var(--chart-5))",
          icon: () => <div className="h-[3px] w-[24px] bg-chart-5" />,
        },
        cumulativeCreditsPlan: {
          label: "Credit generation",
          color: "hsl(200, 100%, 55%)",
          icon: () => <div className="h-[3px] w-[24px]" style={{ backgroundColor: "hsl(200, 100%, 55%)" }} />,
        },
        breakevenPoint: {
          label: "Breakeven point",
          color: "hsl(var(--destructive))",
          icon: () => <div className="h-[3px] w-[24px] bg-destructive" />,
        },
      }}
      className="cashflow-chart h-full w-full"
    >
      <ComposedChart data={data} stackOffset="sign" accessibilityLayer>
        <CartesianGrid
          stroke="#194760"
          strokeDasharray="0 0"
          horizontal={true}
          vertical={true}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
        />

        <ChartLegend
          content={
            <ChartLegendContent className="bg-big-stone-950/60 py-2 backdrop-blur-[2px]" />
          }
        />
        <Bar
          stackId="a"
          dataKey="estimatedRevenuePlan"
          fill={CHART_COLORS.estimatedRevenuePlan}
          radius={[6, 6, 0, 0]}
        />
        <Bar
          stackId="a"
          dataKey="opexTotalCostPlan"
          fill={CHART_COLORS.opexTotalCostPlan}
          radius={[6, 6, 0, 0]}
        />
        <Bar
          stackId="a"
          dataKey="capexTotalCostPlan"
          fill={CHART_COLORS.capexTotalCostPlan}
          radius={[6, 6, 0, 0]}
        />
        {typeof breakevenPoint === "number" && (
          <ReferenceLine x={breakevenPoint} stroke="hsl(var(--destructive))" />
        )}
        <Line
          type="linear"
          dataKey="annualNetCashFlow"
          stroke={CHART_COLORS.annualNetCashFlow}
          dot={false}
          strokeWidth={2}
        />
        <Line
          type="linear"
          dataKey="cumulativeNetIncomePlan"
          stroke={CHART_COLORS.cumulativeNetIncomePlan}
          dot={false}
          strokeWidth={2}
        />
        <Line
          type="linear"
          dataKey="cumulativeCreditsPlan"
          stroke={CHART_COLORS.cumulativeCreditsPlan}
          dot={false}
          strokeWidth={2}
        />
        {/* Ensure breakeven point is part of the chart and visible in the legend */}
        <Line
          type="linear"
          dataKey="breakevenPoint"
          stroke="hsl(var(--destructive))"
          hide={true}
        />
        <XAxis
          dataKey="year"
          tickLine={false}
          axisLine={false}
          className="-translate-y-[100%]"
          tick={(props) => {
            const { x, y, payload } = props;

            // Not sure if needed, and from which number to count?
            if (payload.value === 0) return <g></g>;

            return (
              <g transform={`translate(${x + 10},${y + 60})`}>
                <foreignObject
                  x="0"
                  y="4"
                  width="1"
                  height="1"
                  style={{
                    overflow: "visible",
                  }}
                >
                  <p className="inline-flex items-center justify-center gap-0.5 rounded-sm bg-big-stone-950/60 px-2 py-1 text-white backdrop-blur-[2px]">
                    <span>{payload.value}</span>
                  </p>
                </foreignObject>
              </g>
            );
          }}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="dot"
              className="border-border"
              formatter={(v, n) => {
                const config = cashflowConfig[n as keyof typeof cashflowConfig];
                let label = config.label;
                if (n === "cumulativeNetIncomePlan") {
                  label =
                    cumulativeNetIncomePlanTooltipLabel[
                      carbonRevenuesToCover as keyof typeof cumulativeNetIncomePlanTooltipLabel
                    ];
                }
                if (n === "cumulativeCreditsPlan") {
                  return (
                    <p className="inline-flex w-full justify-between gap-2">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-normal">
                        {formatNumber(v as number, {
                          maximumFractionDigits: 0,
                        })}{" "}
                        tCO2e
                      </span>
                    </p>
                  );
                }
                return (
                  <p className="inline-flex w-full justify-between gap-2">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-normal">
                      {formatCurrency(v as number, {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </p>
                );
              }}
              hideIndicator
              hideIcon
              hideLabel
            />
          }
        />
      </ComposedChart>
    </ChartContainer>
  );
};

export default CashflowChart;
