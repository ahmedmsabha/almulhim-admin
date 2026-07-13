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
  initialsFromName,
  looksArabic,
} from "@/lib/support/format";
import type { AdminSupportRequestResponse } from "@/lib/support/types";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { cn } from "@/lib/utils";

type SupportListProps = {
  requests: AdminSupportRequestResponse[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isRefreshing?: boolean;
};

function formatSupportTimeLocalized(iso: string, lang: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  const now = new Date("2026-07-13T18:00:00.000Z");
  const sameDay =
    date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth() &&
    date.getUTCDate() === now.getUTCDate();

  if (sameDay) {
    return date.toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  }

  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const isYesterday =
    date.getUTCFullYear() === yesterday.getUTCFullYear() &&
    date.getUTCMonth() === yesterday.getUTCMonth() &&
    date.getUTCDate() === yesterday.getUTCDate();

  if (isYesterday) return lang === "ar" ? "أمس" : "Yesterday";

  return date.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function SupportList({
  requests,
  selectedId,
  onSelect,
  isRefreshing = false,
}: SupportListProps) {
  const { lang } = useTranslation();

  if (requests.length === 0) {
    return (
      <Empty className="min-h-56 flex-1 rounded-none border-0 px-6">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ChatCircleIcon />
          </EmptyMedia>
          <EmptyTitle className="text-on-surface">
            {lang === "ar" ? "لم يتم العثور على طلبات" : "No requests found"}
          </EmptyTitle>
          <EmptyDescription>
            {lang === "ar" ? "لا توجد طلبات دعم تطابق هذه التصفية." : "No support requests match these filters."}
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
          <span>{lang === "ar" ? "جاري التحديث…" : "Updating…"}</span>
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
                      <p className="truncate font-semibold text-body-md text-on-surface text-start rtl:text-right">
                        {request.student.fullName}
                      </p>
                      <p className="truncate text-body-sm text-on-surface-variant text-start rtl:text-right">
                        {request.subject}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-label-md text-on-surface-variant opacity-70">
                    {formatSupportTimeLocalized(request.createdAt, lang)}
                  </span>
                </div>
                <p
                  className={cn(
                    "line-clamp-1 text-body-md text-on-surface-variant text-start rtl:text-right",
                    previewArabic && "text-end rtl:text-right",
                  )}
                  dir={previewArabic ? "rtl" : "ltr"}
                  lang={previewArabic ? "ar" : undefined}
                >
                  {request.message}
                </p>
                <div className="flex justify-end rtl:justify-start">
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
