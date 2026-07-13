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
import type { AiVerificationLogListResponse } from "@/lib/subscriptions/types";
import {
  isReceiptVerificationResult,
  parseVerificationResult,
  type VerificationOutcome,
} from "@/lib/subscriptions/parse-verification-result";
import { cn } from "@/lib/utils";

type SubscriptionsAiLogsTableProps = {
  data: AiVerificationLogListResponse;
};

function formatVerifiedAt(iso: string | null) {
  if (!iso) return "—";
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

export function SubscriptionsAiLogsTable({
  data,
}: SubscriptionsAiLogsTableProps) {
  const { logs } = data;

  if (logs.length === 0) {
    return (
      <Empty className="min-h-56 rounded-none border-0 px-6">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <QueueIcon />
          </EmptyMedia>
          <EmptyTitle className="text-on-surface">No AI logs yet</EmptyTitle>
          <EmptyDescription>
            Receipts with a Nest `verifiedAt` timestamp appear here after Gemini
            runs.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Table aria-label="Subscription AI verification logs">
      <TableHeader>
        <TableRow className="border-outline-variant bg-surface-container-low/50 hover:bg-surface-container-low/50">
          <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
            Student
          </TableHead>
          <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
            Plan
          </TableHead>
          <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
            Verified
          </TableHead>
          <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
            Status
          </TableHead>
          <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
            AI result
          </TableHead>
          <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
            Model
          </TableHead>
          <TableHead className="px-6 py-4 text-right text-label-md uppercase tracking-wider text-on-surface-variant">
            View
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((row) => {
          const ai = parseVerificationResult(row.verificationResult);
          const model = isReceiptVerificationResult(row.verificationResult)
            ? (row.verificationResult.model ?? "—")
            : "—";

          return (
            <TableRow
              key={row.subscriptionId}
              className="h-12 border-outline-variant hover:bg-surface-container-low"
            >
              <TableCell className="px-6 py-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-on-surface">
                    {row.student.fullName}
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    {row.student.email}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-6 py-4 text-on-surface">
                {row.plan.name}
              </TableCell>
              <TableCell className="px-6 py-4 text-on-surface-variant">
                {formatVerifiedAt(row.verifiedAt)}
              </TableCell>
              <TableCell className="px-6 py-4">
                <StatusBadge status={row.status} />
              </TableCell>
              <TableCell className="px-6 py-4">
                <AiCell outcome={ai.outcome} summary={ai.summary} />
              </TableCell>
              <TableCell className="px-6 py-4 font-mono text-[11px] text-on-surface-variant">
                {model}
              </TableCell>
              <TableCell className="px-6 py-4 text-right">
                <Link
                  href={`/subscriptions/${row.subscriptionId}`}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "text-on-surface-variant",
                  )}
                  aria-label={`Open ${row.student.fullName}`}
                >
                  <EyeIcon className="size-4" />
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
