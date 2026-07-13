"use client";

import { Area, AreaChart } from "recharts";

import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

type KpiSparklineProps = {
  data: number[];
  color?: string;
  className?: string;
};

export function KpiSparkline({
  data,
  color = "var(--color-primary)",
  className,
}: KpiSparklineProps) {
  if (data.length === 0) {
    return <div className={cn("h-10 w-full", className)} aria-hidden />;
  }

  const chartData = data.map((value, index) => ({ index, value }));
  const config = {
    value: { label: "Trend", color },
  } satisfies ChartConfig;

  return (
    <ChartContainer
      config={config}
      className={cn("h-10 w-full aspect-auto", className)}
      initialDimension={{ width: 160, height: 40 }}
    >
      <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--color-value)"
          fill="none"
          strokeWidth={2}
          isAnimationActive={false}
          dot={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
