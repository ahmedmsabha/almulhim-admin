"use client";

import { useEffect, useState } from "react";
import { PaperPlaneTiltIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { isApiError } from "@/lib/api/errors";
import type { SupportRequestStatus } from "@/lib/domain/support-request-status";
import { replySupportSchema } from "@/lib/support/reply-schema";
import {
  useCloseSupportRequest,
  useReplySupportRequest,
} from "@/lib/support/use-support-mutations";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type SupportComposerProps = {
  requestId: string;
  ticketStatus: SupportRequestStatus;
};

const CLOSED_HELPER = "This ticket is closed. Reply and close are unavailable.";
const CLOSED_HELPER_AR = "هذه التذكرة مغلقة. الرد والإغلاق غير متاحين.";

function mutationErrorMessage(error: unknown, lang: string): string {
  if (!isApiError(error)) return lang === "ar" ? "حدث خطأ ما. حاول مرة أخرى." : "Something went wrong. Try again.";
  if (error.status === 400) return error.message || (lang === "ar" ? "تم رفض الطلب." : "Request was rejected.");
  if (error.status === 404) return lang === "ar" ? "طلب الدعم هذا لم يعد موجوداً." : "This support request no longer exists.";
  if (error.kind === "unauthorized") {
    return lang === "ar" ? "رمز الجلسة مفقود. سجل الدخول مرة أخرى ثم أعد المحاولة." : "Your session token was missing. Sign in again, then retry.";
  }
  if (error.kind === "network" || error.kind === "config") {
    return lang === "ar" ? "تعذر الاتصال بـ Mulhim Backend. تحقق من واجهة برمجة التطبيقات وحاول مرة أخرى." : "Could not reach the Mulhim Backend. Check the API and try again.";
  }
  return error.message;
}

export function SupportComposer({
  requestId,
  ticketStatus,
}: SupportComposerProps) {
  const isClosed = ticketStatus === "closed";
  const [draft, setDraft] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const { lang } = useTranslation();

  const reply = useReplySupportRequest();
  const close = useCloseSupportRequest();

  useEffect(() => {
    setDraft("");
    setValidationError(null);
    reply.reset();
    close.reset();
    // Reset local + mutation UI when the selected ticket changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only on requestId
  }, [requestId]);

  const busy = reply.isPending || close.isPending;
  const actionError = reply.error ?? close.error;

  function handleReply() {
    if (isClosed || busy) return;
    const parsed = replySupportSchema.safeParse({ reply: draft });
    if (!parsed.success) {
      setValidationError(
        parsed.error.issues[0]?.message ?? (lang === "ar" ? "الرد مطلوب" : "Reply is required"),
      );
      return;
    }
    setValidationError(null);
    reply.mutate(
      { requestId, body: parsed.data },
      {
        onSuccess: () => {
          setDraft("");
        },
      },
    );
  }

  function handleClose() {
    if (isClosed || busy) return;
    setValidationError(null);
    close.mutate({ requestId });
  }

  return (
    <div className="border-t border-outline-variant bg-surface-container-lowest p-4">
      <div className="overflow-hidden rounded-xl border border-outline-variant focus-within:ring-2 focus-within:ring-primary/30">
        <label htmlFor="support-reply" className="sr-only">
          {lang === "ar" ? "رد" : "Reply"}
        </label>
        <Textarea
          id="support-reply"
          disabled={isClosed || busy}
          rows={3}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            if (validationError) setValidationError(null);
          }}
          placeholder={
            isClosed
              ? (lang === "ar" ? "لا يمكن الرد على التذاكر المغلقة" : "Closed tickets cannot accept replies")
              : (lang === "ar" ? "اكتب ردك هنا…" : "Type your reply here…")
          }
          className="min-h-20 resize-none rounded-none border-0 bg-transparent px-4 py-4 text-body-md md:text-body-md"
          aria-describedby="support-reply-help"
        />
        <div className="flex flex-col gap-3 border-t border-outline-variant bg-surface-bright p-3 sm:flex-row sm:items-center sm:justify-between">
          <p
            id="support-reply-help"
            className="text-body-sm text-on-surface-variant"
          >
            {isClosed
              ? (lang === "ar" ? CLOSED_HELPER_AR : CLOSED_HELPER)
              : (lang === "ar"
                  ? "يرسل الرد بريداً إلكترونياً إلى الطالب عندما يتم تمكين بريد Nest. يحدد خيار الإغلاق التذكرة كمكتملة."
                  : "A reply emails the student when Nest mail is enabled. Close marks the ticket done.")}
          </p>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={isClosed || busy}
              onClick={handleClose}
            >
              {close.isPending
                ? (lang === "ar" ? "جاري الإغلاق…" : "Closing…")
                : (lang === "ar" ? "إغلاق التذكرة" : "Close ticket")}
            </Button>
            <Button
              type="button"
              disabled={isClosed || busy}
              className="gap-2"
              onClick={handleReply}
            >
              {reply.isPending
                ? (lang === "ar" ? "جاري الإرسال…" : "Sending…")
                : (lang === "ar" ? "إرسال الرد" : "Send reply")}
              <PaperPlaneTiltIcon className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
      {validationError ? (
        <p className="mt-2 text-body-sm text-error" role="alert">
          {validationError}
        </p>
      ) : null}
      {actionError ? (
        <p className="mt-2 text-body-sm text-error" role="alert">
          {mutationErrorMessage(actionError, lang)}
        </p>
      ) : null}
    </div>
  );
}
