"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DashboardStats } from "@/lib/dashboard/mock-data";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type SubscriptionGrowthChartProps = {
  data: DashboardStats["subscriptionGrowth"];
};

function formatTick(date: string, lang: string) {
  const d = new Date(`${date}T00:00:00.000Z`);
  return d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  });
}

export function SubscriptionGrowthChart({ data }: SubscriptionGrowthChartProps) {
  const { t, lang } = useTranslation();

  const chartConfig = {
    count: {
      label: t("dashboard.charts.newSubscriptions"),
      color: "var(--color-primary)",
    },
  } satisfies ChartConfig;

  return (
    <Card className="rounded-xl border border-outline-variant bg-surface-container-lowest py-0 ring-0 lg:col-span-2">
      <CardHeader className="flex flex-row items-start justify-between gap-4 px-8 pt-8">
        <div>
          <CardTitle className="text-headline-sm font-display text-on-surface">
            {t("dashboard.charts.subscriptionGrowth")}
          </CardTitle>
          <CardDescription className="text-body-sm text-on-surface-variant">
            {t("dashboard.charts.growthDescription")}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        {data.length === 0 ? (
          <Empty className="min-h-64 rounded-xl border border-dashed border-outline-variant">
            <EmptyHeader>
              <EmptyTitle className="text-on-surface">{t("dashboard.charts.noGrowthData")}</EmptyTitle>
              <EmptyDescription>
                {t("dashboard.charts.growthHint")}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-64 w-full"
            initialDimension={{ width: 640, height: 256 }}
          >
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tickFormatter={(tick) => formatTick(tick, lang)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--color-count)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
