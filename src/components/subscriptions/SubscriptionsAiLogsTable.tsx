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
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { cn } from "@/lib/utils";

type SubscriptionsAiLogsTableProps = {
  data: AiVerificationLogListResponse;
};

function formatVerifiedAt(iso: string | null, lang: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function getAiSummary(summary: string, lang: string) {
  if (lang !== "ar") return summary;
  const s = summary.trim();
  if (s === "Awaiting AI") return "بانتظار الذكاء الاصطناعي";
  if (s === "AI skipped") return "تم تخطي التحقق الذكي";
  if (s === "All checks passed") return "اجتازت جميع الفحوصات";
  if (s === "One check failed") return "فشل أحد الفحوصات";
  if (s === "Review needed") return "بحاجة إلى مراجعة";
  if (s === "Document matches") return "المستند مطابق";
  if (s === "Awaiting AI verification") return "بانتظار التحقق بالذكاء الاصطناعي";
  if (s === "AI checks passed") return "اجتازت فحوصات الذكاء الاصطناعي";
  if (s === "AI checks need review") return "فحوصات الذكاء الاصطناعي بحاجة لمراجعة";
  return s;
}

function AiCell({
  outcome,
  summary,
}: {
  outcome: VerificationOutcome | null;
  summary: string;
}) {
  const { lang } = useTranslation();
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
      <span>{getAiSummary(summary, lang)}</span>
    </div>
  );
}

export function SubscriptionsAiLogsTable({
  data,
}: SubscriptionsAiLogsTableProps) {
  const { logs } = data;
  const { t, lang } = useTranslation();

  if (logs.length === 0) {
    return (
      <Empty className="min-h-56 rounded-none border-0 px-6">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <QueueIcon />
          </EmptyMedia>
          <EmptyTitle className="text-on-surface">{t("subscriptions.table.empty")}</EmptyTitle>
          <EmptyDescription>
            {lang === "ar"
              ? "تظهر الإيصالات التي تحتوي على طابع زمني للتحقق بعد تشغيل Gemini."
              : "Receipts with a Nest verifiedAt timestamp appear here after Gemini runs."}
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
            {t("subscriptions.table.student")}
          </TableHead>
          <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
            {t("subscriptions.table.plan")}
          </TableHead>
          <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
            {lang === "ar" ? "تاريخ التحقق" : "Verified"}
          </TableHead>
          <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
            {t("subscriptions.table.status")}
          </TableHead>
          <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
            {t("subscriptions.table.aiValidation")}
          </TableHead>
          <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
            {lang === "ar" ? "النموذج" : "Model"}
          </TableHead>
          <TableHead className="px-6 py-4 text-right rtl:text-left text-label-md uppercase tracking-wider text-on-surface-variant">
            {lang === "ar" ? "عرض" : "View"}
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
                {formatVerifiedAt(row.verifiedAt, lang)}
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
                  aria-label={`${lang === "ar" ? "عرض" : "Open"} ${row.student.fullName}`}
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
