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

type AnnouncementsErrorPanelProps = {
  title?: string;
  message?: string;
  onRetry: () => void;
};

export function AnnouncementsErrorPanel({
  title = "Announcements data unavailable",
  message,
  onRetry,
}: AnnouncementsErrorPanelProps) {
  return (
    <Empty className="min-h-72 rounded-xl border border-outline-variant bg-surface-container-lowest">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <WarningCircleIcon />
        </EmptyMedia>
        <EmptyTitle className="text-on-surface">{title}</EmptyTitle>
        <EmptyDescription>
          {message ??
            "The Mulhim Backend could not return announcements. Confirm the API is running and exposes GET /announcements/admin, then try again."}
        </EmptyDescription>
      </EmptyHeader>
      <Button type="button" variant="outline" onClick={onRetry}>
        <ArrowClockwiseIcon data-icon="inline-start" />
        Retry
      </Button>
    </Empty>
  );
}
