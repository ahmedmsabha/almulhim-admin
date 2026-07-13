import type { ReactNode } from "react";

import { KpiSparkline } from "@/components/dashboard/KpiSparkline";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  label: string;
  value: number;
  changePct?: number;
  sparkline?: number[];
  sparklineColor?: string;
  icon: ReactNode;
  urgent?: boolean;
  urgentHint?: string;
  className?: string;
};

function formatValue(value: number) {
  return value.toLocaleString("en-US");
}

function formatChange(changePct: number) {
  const sign = changePct > 0 ? "+" : "";
  return `${sign}${changePct}%`;
}

export function KpiCard({
  label,
  value,
  changePct,
  sparkline,
  sparklineColor,
  icon,
  urgent = false,
  urgentHint,
  className,
}: KpiCardProps) {
  if (urgent) {
    return (
      <Card
        className={cn(
          "relative overflow-hidden rounded-xl border-2 border-tertiary-container bg-tertiary-fixed py-0 ring-0",
          className
        )}
      >
        <CardContent className="relative z-10 flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between">
            <div className="rounded-lg bg-tertiary-container p-2 text-on-tertiary-fixed">
              {icon}
            </div>
            <Badge className="rounded-md bg-tertiary-fixed-dim/30 text-tertiary">
              Urgent
            </Badge>
          </div>
          <div>
            <p className="mb-1 text-label-md uppercase text-on-tertiary-fixed-variant">
              {label}
            </p>
            <p className="text-headline-md text-on-tertiary-fixed">
              {formatValue(value)}
            </p>
            {urgentHint ? (
              <p className="mt-2 text-body-sm text-on-tertiary-fixed-variant">
                {urgentHint}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  }

  const changePositive = (changePct ?? 0) >= 0;

  return (
    <Card
      className={cn(
        "rounded-xl border border-outline-variant bg-surface-container-lowest py-0 ring-0",
        className
      )}
    >
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
          {typeof changePct === "number" ? (
            <Badge
              variant="outline"
              className={cn(
                "rounded-md border-transparent",
                changePositive
                  ? "bg-status-active-bg text-status-active"
                  : "bg-error-container text-error"
              )}
            >
              {formatChange(changePct)}
            </Badge>
          ) : null}
        </div>
        <div>
          <p className="mb-1 text-label-md uppercase text-on-surface-variant">
            {label}
          </p>
          <p className="text-headline-md text-on-surface">{formatValue(value)}</p>
        </div>
        {sparkline ? (
          <KpiSparkline data={sparkline} color={sparklineColor} />
        ) : null}
      </CardContent>
    </Card>
  );
}
