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

type StudentsErrorPanelProps = {
  title?: string;
  message?: string;
  onRetry: () => void;
};

export function StudentsErrorPanel({
  title = "Students data unavailable",
  message,
  onRetry,
}: StudentsErrorPanelProps) {
  return (
    <Empty className="min-h-72 rounded-xl border border-outline-variant bg-surface-container-lowest">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <WarningCircleIcon />
        </EmptyMedia>
        <EmptyTitle className="text-on-surface">{title}</EmptyTitle>
        <EmptyDescription>
          {message ??
            "The Mulhim Backend could not return students. Confirm the API is running and try again."}
        </EmptyDescription>
      </EmptyHeader>
      <Button type="button" variant="outline" onClick={onRetry}>
        <ArrowClockwiseIcon data-icon="inline-start" />
        Retry
      </Button>
    </Empty>
  );
}
