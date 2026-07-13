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

type PlansErrorPanelProps = {
  title?: string;
  message?: string;
  onRetry: () => void;
};

export function PlansErrorPanel({
  title = "Plans data unavailable",
  message,
  onRetry,
}: PlansErrorPanelProps) {
  return (
    <Empty className="min-h-72 rounded-xl border border-outline-variant bg-surface-container-lowest">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <WarningCircleIcon />
        </EmptyMedia>
        <EmptyTitle className="text-on-surface">{title}</EmptyTitle>
        <EmptyDescription>
          {message ??
            "The Mulhim Backend could not return plans. Confirm the API is running and exposes GET /plans/all, then try again."}
        </EmptyDescription>
      </EmptyHeader>
      <Button type="button" variant="outline" onClick={onRetry}>
        <ArrowClockwiseIcon data-icon="inline-start" />
        Retry
      </Button>
    </Empty>
  );
}
