"use client";

import { ChatCircleIcon, CircleNotchIcon } from "@phosphor-icons/react";

import { TicketStatusBadge } from "@/components/shared/TicketStatusBadge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  formatSupportTime,
  initialsFromName,
  looksArabic,
} from "@/lib/support/format";
import type { AdminSupportRequestResponse } from "@/lib/support/types";
import { cn } from "@/lib/utils";

type SupportListProps = {
  requests: AdminSupportRequestResponse[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isRefreshing?: boolean;
};

export function SupportList({
  requests,
  selectedId,
  onSelect,
  isRefreshing = false,
}: SupportListProps) {
  if (requests.length === 0) {
    return (
      <Empty className="min-h-56 flex-1 rounded-none border-0 px-6">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ChatCircleIcon />
          </EmptyMedia>
          <EmptyTitle className="text-on-surface">No requests found</EmptyTitle>
          <EmptyDescription>
            No support requests match these filters.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col transition-opacity",
        isRefreshing && "opacity-60",
      )}
      aria-busy={isRefreshing || undefined}
    >
      {isRefreshing ? (
        <div className="pointer-events-none absolute end-3 top-3 z-10 flex items-center gap-1.5 rounded-md bg-surface-container-lowest/90 px-2 py-1 text-label-md text-on-surface-variant shadow-sm">
          <CircleNotchIcon
            className="size-3.5 animate-spin"
            aria-hidden
          />
          <span>Updating…</span>
        </div>
      ) : null}
      <ul
        className="flex flex-1 flex-col overflow-y-auto"
        role="listbox"
        aria-label="Support requests"
      >
        {requests.map((request) => {
          const selected = request.id === selectedId;
          const previewArabic = looksArabic(request.message);
          return (
            <li key={request.id} role="option" aria-selected={selected}>
              <button
                type="button"
                onClick={() => onSelect(request.id)}
                disabled={isRefreshing}
                className={cn(
                  "flex w-full flex-col gap-2 border-b border-outline-variant p-4 text-start transition-colors",
                  selected
                    ? "border-s-4 border-s-primary bg-surface-container-low"
                    : "border-s-4 border-s-transparent hover:bg-surface-container/50",
                  isRefreshing && "pointer-events-none",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-variant text-label-md font-medium text-on-surface-variant"
                      aria-hidden
                    >
                      {initialsFromName(request.student.fullName)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-body-md text-on-surface">
                        {request.student.fullName}
                      </p>
                      <p className="truncate text-body-sm text-on-surface-variant">
                        {request.subject}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-label-md text-on-surface-variant opacity-70">
                    {formatSupportTime(request.createdAt)}
                  </span>
                </div>
                <p
                  className={cn(
                    "line-clamp-1 text-body-md text-on-surface-variant",
                    previewArabic && "text-end",
                  )}
                  dir={previewArabic ? "rtl" : "ltr"}
                  lang={previewArabic ? "ar" : undefined}
                >
                  {request.message}
                </p>
                <div className="flex justify-end">
                  <TicketStatusBadge status={request.status} />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
