"use client";

import { GlobeSimpleIcon } from "@phosphor-icons/react/dist/ssr";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { DashboardStats } from "@/lib/dashboard/mock-data";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { cn } from "@/lib/utils";

type RegionDistributionProps = {
  data: DashboardStats["regionDistribution"];
};

export function RegionDistribution({ data }: RegionDistributionProps) {
  const { t } = useTranslation();
  const total = data.reduce((sum, row) => sum + row.count, 0);

  return (
    <Card className="flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest py-0 ring-0">
      <CardHeader className="px-8 pt-8">
        <CardTitle className="text-headline-sm font-display text-on-surface">
          {t("dashboard.charts.regionDistribution")}
        </CardTitle>
        <CardDescription className="text-body-sm text-on-surface-variant">
          {t("dashboard.charts.studentsByRegion")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center gap-6 px-8">
        {data.map((row) => {
          const percent =
            total > 0 ? Math.round((row.count / total) * 100) : 0;

          return (
            <div key={row.region} className="flex flex-col gap-2">
              <div className="flex items-end justify-between">
                <span className="font-bold text-on-surface">
                  {t(`common.regions.${row.region}`)}
                </span>
                <span className="text-label-md text-on-surface-variant">
                  {row.count.toLocaleString("en-US")} ({percent}%)
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-surface-container-low">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    row.region === "gaza" ? "bg-primary" : "bg-secondary",
                  )}
                  style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
      <CardFooter className="mt-auto flex-col items-stretch gap-0 border-0 px-8 pt-0 pb-8">
        <Separator className="mb-8 bg-outline-variant" />
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-lg bg-surface-container text-primary">
            <GlobeSimpleIcon />
          </div>
          <div>
            <p className="text-body-sm font-bold text-on-surface">
              {t("dashboard.charts.globalReach")}
            </p>
            <p className="text-[11px] text-on-surface-variant">
              {t("dashboard.charts.territoriesHint")}
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
