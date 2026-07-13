"use client";

import { ArrowClockwiseIcon, WarningCircleIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type DashboardErrorPanelProps = {
  message?: string;
  onRetry: () => void;
};

export function DashboardErrorPanel({
  message,
  onRetry,
}: DashboardErrorPanelProps) {
  return (
    <Empty className="min-h-72 rounded-xl border border-outline-variant bg-surface-container-lowest">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <WarningCircleIcon />
        </EmptyMedia>
        <EmptyTitle className="text-on-surface">
          Dashboard data unavailable
        </EmptyTitle>
        <EmptyDescription>
          {message ??
            "The Mulhim Backend could not return analytics aggregates. Confirm the API is running and exposes GET /analytics/admin/dashboard, then try again."}
        </EmptyDescription>
      </EmptyHeader>
      <Button type="button" variant="outline" onClick={onRetry}>
        <ArrowClockwiseIcon data-icon="inline-start" />
        Retry
      </Button>
    </Empty>
  );
}
