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

type SubscriptionsErrorPanelProps = {
  title?: string;
  message?: string;
  onRetry: () => void;
};

export function SubscriptionsErrorPanel({
  title = "Subscriptions data unavailable",
  message,
  onRetry,
}: SubscriptionsErrorPanelProps) {
  return (
    <Empty className="min-h-72 rounded-xl border border-outline-variant bg-surface-container-lowest">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <WarningCircleIcon />
        </EmptyMedia>
        <EmptyTitle className="text-on-surface">{title}</EmptyTitle>
        <EmptyDescription>
          {message ??
            "The Mulhim Backend could not return subscriptions. Confirm the API is running and try again."}
        </EmptyDescription>
      </EmptyHeader>
      <Button type="button" variant="outline" onClick={onRetry}>
        <ArrowClockwiseIcon data-icon="inline-start" />
        Retry
      </Button>
    </Empty>
  );
}
