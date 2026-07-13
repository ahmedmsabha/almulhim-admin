"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ImageBrokenIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  RejectReasonDialog,
  rejectMutationErrorMessage,
} from "@/components/subscriptions/RejectReasonDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isApiError } from "@/lib/api/errors";
import { buildVerificationPanel } from "@/lib/subscriptions/parse-verification-result";
import type { AdminSubscriptionResponse } from "@/lib/subscriptions/types";
import { useSubscriptionReview } from "@/lib/subscriptions/use-subscription-mutations";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { cn } from "@/lib/utils";

type SubscriptionDetailViewProps = {
  subscription: AdminSubscriptionResponse;
  receiptUrl: string | null;
  receiptError?: string;
  onRetryReceipt?: () => void;
};

type ConfirmKind = "approve" | "suspend" | null;
type ReviewAttempt = "approve" | "reject" | "suspend";

function formatTimestamp(iso: string | null, lang: string) {
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

function formatPrice(amount: number, currency: string, lang: string) {
  try {
    return new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-GB", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${currency}`;
  }
}

function isPendingStatus(status: AdminSubscriptionResponse["status"]) {
  return status === "pending_review" || status === "pending_approval";
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

function getCheckLabel(key: string, label: string, lang: string) {
  if (lang !== "ar") return label;
  if (key === "recipientMatch") return "مطابقة المستلم";
  if (key === "senderMatch") return "مطابقة المرسل";
  if (key === "notDuplicate") return "ليس مكرراً";
  return label;
}

export function SubscriptionDetailView({
  subscription,
  receiptUrl,
  receiptError,
  onRetryReceipt,
}: SubscriptionDetailViewProps) {
  const review = useSubscriptionReview(subscription.id);
  const [confirm, setConfirm] = useState<ConfirmKind>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<ReviewAttempt | null>(null);
  const ai = buildVerificationPanel(subscription.verificationResult);
  const pendingActions = isPendingStatus(subscription.status);
  const canSuspend = subscription.status === "active";
  const { t, lang } = useTranslation();

  function mutationError(prefix: string) {
    if (!review.isError) return null;
    if (!isApiError(review.error)) {
      return lang === "ar" ? `${prefix === "Suspend" ? "تعليق" : "قبول"} فشل. حاول مرة أخرى.` : `${prefix} failed. Try again.`;
    }
    if (review.error.status === 403) {
      return lang === "ar"
        ? `ليس لديك صلاحية لـ ${prefix === "Suspend" ? "تعليق" : "قبول"} هذا الاشتراك.`
        : `You are not allowed to ${prefix.toLowerCase()} this subscription.`;
    }
    if (review.error.status === 404) {
      return lang === "ar" ? "هذا الاشتراك لم يعد موجوداً." : "This subscription no longer exists.";
    }
    return review.error.message;
  }

  const inlineReviewError =
    review.isError && !rejectOpen && lastAttempt && lastAttempt !== "reject"
      ? mutationError(lastAttempt === "suspend" ? "Suspend" : "Approve")
      : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link
          href="/subscriptions"
          className="inline-flex w-fit items-center gap-1.5 text-body-sm text-on-surface-variant hover:text-on-surface"
        >
          <ArrowLeftIcon className="size-4" aria-hidden />
          {t("subscriptions.backToQueue")}
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-label-md uppercase tracking-wider text-on-surface-variant">
              {t("subscriptions.titles.pending")}
            </p>
            <h1 className="font-display text-headline-lg font-bold text-on-surface">
              {subscription.student.fullName}
            </h1>
            <p className="text-body-md text-on-surface-variant">
              {subscription.student.email} · {subscription.plan.name}
            </p>
          </div>
          <StatusBadge status={subscription.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest py-0 ring-0">
          <CardHeader className="border-b border-outline-variant px-6 py-4">
            <CardTitle className="text-headline-sm font-display text-on-surface">
              {t("subscriptions.detail.verificationDocument")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {receiptUrl ? (
              // Signed Nest URL only; do not persist the binary in public assets.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={receiptUrl}
                alt={`${lang === "ar" ? "إيصال الدفع لـ" : "Payment receipt for"} ${subscription.student.fullName}`}
                className="aspect-[3/4] w-full rounded-lg border border-outline-variant object-contain bg-surface-container-high"
              />
            ) : (
              <div className="flex aspect-[3/4] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-outline-variant bg-surface-container-high px-6 text-center">
                <ImageBrokenIcon
                  className="size-10 text-on-surface-variant"
                  aria-hidden
                />
                <p className="text-body-md text-on-surface-variant">
                  {receiptError ?? (lang === "ar" ? "صورة الإيصال غير متوفرة." : "Receipt image is not available.")}
                </p>
                {onRetryReceipt ? (
                  <Button type="button" variant="outline" onClick={onRetryReceipt}>
                    {lang === "ar" ? "إعادة محاولة جلب رابط الإيصال" : "Retry receipt URL"}
                  </Button>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="rounded-xl border border-outline-variant bg-surface-container-lowest py-0 ring-0">
            <CardHeader className="border-b border-outline-variant px-6 py-4">
              <CardTitle className="text-headline-sm font-display text-on-surface">
                {t("subscriptions.detail.submissionDetails")}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 px-6 py-5 text-body-md">
              <DetailRow label={t("subscriptions.table.plan")} value={subscription.plan.name} />
              <DetailRow
                label={t("subscriptions.detail.price")}
                value={formatPrice(
                  subscription.plan.priceAmount,
                  subscription.plan.currency,
                  lang,
                )}
              />
              <DetailRow
                label={t("subscriptions.detail.senderName")}
                value={subscription.receiptSenderName ?? "—"}
              />
              <DetailRow
                label={t("students.phone")}
                value={subscription.student.phoneNumber || "—"}
              />
              <DetailRow
                label={t("students.region")}
                value={t(`common.regions.${subscription.student.region}`)}
              />
              <DetailRow
                label={t("subscriptions.detail.submitted")}
                value={formatTimestamp(subscription.createdAt, lang)}
              />
              {subscription.rejectionReason ? (
                <DetailRow
                  label={t("subscriptions.detail.rejectionReason")}
                  value={subscription.rejectionReason}
                />
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-outline-variant bg-surface-container-lowest py-0 ring-0">
            <CardHeader className="border-b border-outline-variant px-6 py-4">
              <CardTitle className="text-headline-sm font-display text-on-surface">
                {t("subscriptions.table.aiValidation")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 px-6 py-5">
              <div
                className={cn(
                  "flex items-start gap-3 rounded-lg border px-4 py-3",
                  ai.overallPassed === true &&
                    "border-status-active/30 bg-status-active-bg text-status-active",
                  ai.overallPassed === false &&
                    "border-status-rejected/30 bg-status-rejected-bg text-status-rejected",
                  ai.overallPassed === null &&
                    "border-outline-variant bg-surface-container-low text-on-surface",
                )}
              >
                {ai.overallPassed === true ? (
                  <CheckCircleIcon className="mt-0.5 size-5 shrink-0" weight="fill" />
                ) : ai.overallPassed === false ? (
                  <WarningCircleIcon className="mt-0.5 size-5 shrink-0" weight="fill" />
                ) : null}
                <div className="flex flex-col gap-1">
                  <p className="font-bold text-body-md">{getAiSummary(ai.summary, lang)}</p>
                  {ai.model ? (
                    <p className="text-body-sm opacity-80">
                      {lang === "ar" ? "النموذج: " : "Model: "}{ai.model}
                    </p>
                  ) : null}
                  {ai.aiEnabled === false ? (
                    <p className="text-body-sm opacity-80">
                      {lang === "ar" ? "تم تخطي التحقق الذكي لهذا الإيصال." : "AI was skipped for this receipt."}
                    </p>
                  ) : null}
                </div>
              </div>

              {ai.checks.length > 0 ? (
                <ul className="flex flex-col gap-3">
                  {ai.checks.map((row) => (
                    <li
                      key={row.key}
                      className="rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-label-md uppercase tracking-wider text-on-surface-variant">
                          {getCheckLabel(row.key, row.label, lang)}
                        </p>
                        <span
                          className={cn(
                            "text-body-sm font-bold",
                            row.check.passed
                              ? "text-status-active"
                              : "text-status-rejected",
                          )}
                        >
                          {row.check.passed
                            ? (lang === "ar" ? "ناجح" : "Passed")
                            : (lang === "ar" ? "فاشل" : "Failed")}
                        </span>
                      </div>
                      {row.check.detected ? (
                        <p className="mt-2 text-body-md text-on-surface">
                          {lang === "ar" ? "المكتشف: " : "Detected: "}{row.check.detected}
                        </p>
                      ) : null}
                      {row.check.expected ? (
                        <p className="mt-1 text-body-sm text-on-surface-variant">
                          {lang === "ar" ? "المتوقع: " : "Expected: "}{row.check.expected}
                        </p>
                      ) : null}
                      {row.check.reason ? (
                        <p className="mt-1 text-body-sm text-on-surface-variant">
                          {row.check.reason}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}

              {ai.transactionReference ? (
                <p className="text-body-sm text-on-surface-variant">
                  {lang === "ar" ? "مرجع المعاملة: " : "Transaction ref: "}{" "}
                  <span className="font-medium text-on-surface">
                    {ai.transactionReference}
                  </span>
                </p>
              ) : null}
              {ai.notes ? (
                <p className="text-body-md text-on-surface">{ai.notes}</p>
              ) : null}
              {ai.error ? (
                <p className="text-body-sm text-error" role="alert">
                  {ai.error}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-outline-variant bg-surface-container-lowest py-0 ring-0">
            <CardContent className="flex flex-col gap-3 px-6 py-5">
              {pendingActions ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    className="flex-1 bg-status-active text-white hover:bg-status-active/90"
                    disabled={review.isPending}
                    onClick={() => {
                      review.reset();
                      setLastAttempt(null);
                      setConfirm("approve");
                    }}
                  >
                    {t("subscriptions.detail.approve")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-status-rejected text-status-rejected hover:bg-status-rejected-bg"
                    disabled={review.isPending}
                    onClick={() => {
                      review.reset();
                      setLastAttempt(null);
                      setRejectOpen(true);
                    }}
                  >
                    {t("subscriptions.detail.reject")}
                  </Button>
                </div>
              ) : null}
              {canSuspend ? (
                <Button
                  type="button"
                  variant="outline"
                  className="border-status-suspended text-status-suspended hover:bg-status-suspended-bg"
                  disabled={review.isPending}
                  onClick={() => {
                    review.reset();
                    setLastAttempt(null);
                    setConfirm("suspend");
                  }}
                >
                  {t("subscriptions.detail.suspend")}
                </Button>
              ) : null}
              {!pendingActions && !canSuspend ? (
                <p className="text-body-md text-on-surface-variant">
                  {lang === "ar"
                    ? "هذا الاشتراك لا ينتظر قراراً بشأن الإيصال. ينطبق القبول والرفض على الصفوف المعلقة؛ وينطبق التعليق عندما تكون الحالة نشطة."
                    : "This subscription is not awaiting a receipt decision. Approve and reject apply to pending rows; suspend applies when status is active."}
                </p>
              ) : null}
              {inlineReviewError ? (
                <p className="text-body-sm text-error" role="alert">
                  {inlineReviewError}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open && !review.isPending) setConfirm(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "suspend"
                ? (lang === "ar" ? "تعليق هذا الاشتراك؟" : "Suspend this subscription?")
                : (lang === "ar" ? "قبول هذا الاشتراك؟" : "Approve this subscription?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "suspend"
                ? (lang === "ar"
                    ? `تعليق الوصول المدفوع لـ ${subscription.student.fullName}. سيقوم Nest بتحديد الاشتراك كـ معلق.`
                    : `Suspend paid access for ${subscription.student.fullName}. Nest will mark the subscription suspended.`)
                : (lang === "ar"
                    ? `الموافقة على إيصال ${subscription.student.fullName} للباقة ${subscription.plan.name}. سيقوم Nest بتفعيل الاشتراك.`
                    : `Approve the receipt for ${subscription.student.fullName} on ${subscription.plan.name}. Nest will activate the subscription.`)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={review.isPending}>
              {t("students.confirmCancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant={confirm === "suspend" ? "destructive" : "default"}
              disabled={review.isPending || !confirm}
              onClick={(event) => {
                event.preventDefault();
                if (!confirm) return;
                setLastAttempt(confirm);
                review.mutate(
                  { decision: confirm },
                  {
                    onSuccess: () => setConfirm(null),
                  },
                );
              }}
            >
              {review.isPending
                ? confirm === "suspend"
                  ? (lang === "ar" ? "جاري التعليق…" : "Suspending…")
                  : (lang === "ar" ? "جاري الموافقة…" : "Approving…")
                : confirm === "suspend"
                  ? (lang === "ar" ? "تأكيد التعليق" : "Confirm suspend")
                  : (lang === "ar" ? "تأكيد الموافقة" : "Confirm approve")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RejectReasonDialog
        open={rejectOpen}
        onOpenChange={(open) => {
          if (review.isPending) return;
          setRejectOpen(open);
          if (!open && review.isError && lastAttempt === "reject") {
            review.reset();
            setLastAttempt(null);
          }
        }}
        studentName={subscription.student.fullName}
        pending={review.isPending}
        errorMessage={
          rejectOpen && review.isError && lastAttempt === "reject"
            ? rejectMutationErrorMessage(review.error, lang)
            : undefined
        }
        onSubmit={(reason) => {
          setLastAttempt("reject");
          review.mutate(
            { decision: "reject", body: { rejectionReason: reason } },
            {
              onSuccess: () => setRejectOpen(false),
            },
          );
        }}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
      <span className="text-label-md uppercase tracking-wider text-on-surface-variant">
        {label}
      </span>
      <span className="font-medium text-on-surface sm:text-right">{value}</span>
    </div>
  );
}
