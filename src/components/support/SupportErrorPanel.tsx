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

type SupportErrorPanelProps = {
  title?: string;
  message?: string;
  onRetry: () => void;
};

export function SupportErrorPanel({
  title = "Support data unavailable",
  message,
  onRetry,
}: SupportErrorPanelProps) {
  return (
    <Empty className="min-h-72 rounded-xl border border-outline-variant bg-surface-container-lowest">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <WarningCircleIcon />
        </EmptyMedia>
        <EmptyTitle className="text-on-surface">{title}</EmptyTitle>
        <EmptyDescription>
          {message ??
            "The Mulhim Backend could not return support requests. Confirm the API is running and exposes GET /support/admin/requests, then try again."}
        </EmptyDescription>
      </EmptyHeader>
      <Button type="button" variant="outline" onClick={onRetry}>
        <ArrowClockwiseIcon data-icon="inline-start" />
        Retry
      </Button>
    </Empty>
  );
}
