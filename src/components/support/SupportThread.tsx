"use client";

import { ChatTeardropTextIcon } from "@phosphor-icons/react";

import { TicketStatusBadge } from "@/components/shared/TicketStatusBadge";
import { SupportComposer } from "@/components/support/SupportComposer";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { REGION_LABELS } from "@/lib/domain/region";
import {
  formatSupportTime,
  initialsFromName,
  looksArabic,
} from "@/lib/support/format";
import type { AdminSupportRequestResponse } from "@/lib/support/types";
import { cn } from "@/lib/utils";

type SupportThreadProps = {
  request: AdminSupportRequestResponse | null;
};

export function SupportThread({ request }: SupportThreadProps) {
  if (!request) {
    return (
      <Empty className="min-h-72 flex-1 rounded-none border-0 bg-surface-bright px-6">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ChatTeardropTextIcon />
          </EmptyMedia>
          <EmptyTitle className="text-on-surface">No ticket selected</EmptyTitle>
          <EmptyDescription>
            Choose a request from the list, or clear filters if the inbox is
            empty.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const messageArabic = looksArabic(request.message);
  const replyArabic = request.adminReply
    ? looksArabic(request.adminReply)
    : false;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-surface-bright">
      <header className="flex items-center justify-between gap-4 border-b border-outline-variant bg-surface-container-lowest px-6 py-4">
        <div className="flex min-w-0 items-center gap-4">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-variant text-label-md font-medium text-on-surface-variant"
            aria-hidden
          >
            {initialsFromName(request.student.fullName)}
          </span>
          <div className="min-w-0">
            <h2 className="truncate font-semibold text-body-lg text-on-surface">
              {request.student.fullName}
            </h2>
            <p className="truncate text-body-sm text-on-surface-variant">
              {request.subject}
              {" · "}
              {REGION_LABELS[request.student.region]}
              {" · "}
              {request.student.email}
            </p>
          </div>
        </div>
        <TicketStatusBadge status={request.status} />
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
        <div
          className={cn(
            "flex max-w-[80%] flex-col",
            messageArabic ? "ms-auto items-end" : "items-start",
          )}
        >
          <div
            className={cn(
              "rounded-2xl bg-surface-container-highest p-4 text-on-surface-variant",
              messageArabic
                ? "rounded-se-none text-end leading-relaxed"
                : "rounded-ss-none",
            )}
            dir={messageArabic ? "rtl" : "ltr"}
            lang={messageArabic ? "ar" : undefined}
          >
            {request.message}
          </div>
          <span className="mt-1 px-2 text-label-md text-on-surface-variant">
            {formatSupportTime(request.createdAt)}
          </span>
        </div>

        {request.adminReply ? (
          <div
            className={cn(
              "flex max-w-[80%] flex-col",
              replyArabic ? "ms-auto items-end" : "items-start",
            )}
          >
            <div
              className={cn(
                "rounded-2xl bg-primary p-4 text-on-primary",
                replyArabic
                  ? "rounded-se-none text-end leading-relaxed"
                  : "rounded-ss-none",
              )}
              dir={replyArabic ? "rtl" : "ltr"}
              lang={replyArabic ? "ar" : undefined}
            >
              {request.adminReply}
            </div>
            <span className="mt-1 px-2 text-label-md text-on-surface-variant">
              {request.reviewedAt
                ? formatSupportTime(request.reviewedAt)
                : "—"}
            </span>
          </div>
        ) : null}
      </div>

      <SupportComposer
        requestId={request.id}
        ticketStatus={request.status}
      />
    </div>
  );
}
