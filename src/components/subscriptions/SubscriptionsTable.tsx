"use client";

import Link from "next/link";
import {
  CheckCircleIcon,
  EyeIcon,
  QueueIcon,
  WarningCircleIcon,
  WarningIcon,
} from "@phosphor-icons/react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminSubscriptionListResponse } from "@/lib/subscriptions/types";
import {
  parseVerificationResult,
  type VerificationOutcome,
} from "@/lib/subscriptions/parse-verification-result";
import { cn } from "@/lib/utils";

type SubscriptionsTableProps = {
  data: AdminSubscriptionListResponse;
};

function initials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatSubmittedAt(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function AiCell({
  outcome,
  summary,
}: {
  outcome: VerificationOutcome | null;
  summary: string;
}) {
  const Icon =
    outcome === "pass"
      ? CheckCircleIcon
      : outcome === "warn"
        ? WarningIcon
        : outcome === "fail"
          ? WarningCircleIcon
          : null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-body-md font-medium",
        outcome === "pass" && "text-status-active",
        outcome === "warn" && "text-status-pending-approval",
        outcome === "fail" && "text-status-rejected",
        outcome === null && "text-on-surface-variant",
      )}
    >
      {Icon ? <Icon className="size-5 shrink-0" weight="fill" aria-hidden /> : null}
      <span>{summary}</span>
    </div>
  );
}

export function SubscriptionsTable({ data }: SubscriptionsTableProps) {
  const { subscriptions } = data;

  if (subscriptions.length === 0) {
    return (
      <Empty className="min-h-56 rounded-none border-0 px-6">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <QueueIcon />
          </EmptyMedia>
          <EmptyTitle className="text-on-surface">No pending subscriptions</EmptyTitle>
          <EmptyDescription>
            Try a different search, or check back when students submit receipts.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Table aria-label="Pending subscription receipts">
      <TableHeader>
        <TableRow className="border-outline-variant bg-surface-container-low/50 hover:bg-surface-container-low/50">
          <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
            Student Name
          </TableHead>
          <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
            Plan
          </TableHead>
          <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
            Submitted Date
          </TableHead>
          <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
            Status
          </TableHead>
          <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
            AI Verification
          </TableHead>
          <TableHead className="px-6 py-4 text-right text-label-md uppercase tracking-wider text-on-surface-variant">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subscriptions.map((row) => {
          const ai = parseVerificationResult(row.verificationResult);
          const detailHref = `/subscriptions/${row.id}`;

          return (
            <TableRow
              key={row.id}
              className="h-12 border-outline-variant hover:bg-surface-container-low"
            >
              <TableCell className="px-6 py-4">
                <Link
                  href={detailHref}
                  className="flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary-container text-xs font-bold text-on-primary-container">
                      {initials(row.student.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex flex-col gap-0.5">
                    <span className="font-bold text-on-surface">
                      {row.student.fullName}
                    </span>
                    <span className="text-body-sm text-on-surface-variant">
                      {row.student.email}
                    </span>
                  </span>
                </Link>
              </TableCell>
              <TableCell className="px-6 py-4 text-body-md text-on-surface">
                {row.plan.name}
              </TableCell>
              <TableCell className="px-6 py-4 text-body-md text-on-surface">
                {formatSubmittedAt(row.createdAt)}
              </TableCell>
              <TableCell className="px-6 py-4">
                <StatusBadge status={row.status} />
              </TableCell>
              <TableCell className="px-6 py-4">
                <AiCell outcome={ai.outcome} summary={ai.summary} />
              </TableCell>
              <TableCell className="px-6 py-4">
                <div className="flex justify-end gap-1">
                  <Link
                    href={detailHref}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon-sm" }),
                      "rounded-lg text-on-surface-variant",
                    )}
                    aria-label={`View receipt for ${row.student.fullName}`}
                    title="View receipt"
                  >
                    <EyeIcon />
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
