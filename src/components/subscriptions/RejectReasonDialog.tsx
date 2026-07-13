"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { isApiError } from "@/lib/api/errors";
import {
  rejectSubscriptionSchema,
  type RejectSubscriptionFormValues,
} from "@/lib/subscriptions/reject-form-schema";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type RejectReasonDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  pending: boolean;
  errorMessage?: string;
  onSubmit: (reason: string) => void;
};

export function RejectReasonDialog({
  open,
  onOpenChange,
  studentName,
  pending,
  errorMessage,
  onSubmit,
}: RejectReasonDialogProps) {
  const form = useForm<RejectSubscriptionFormValues>({
    resolver: zodResolver(rejectSubscriptionSchema),
    defaultValues: { reason: "" },
  });
  const { lang } = useTranslation();

  useEffect(() => {
    if (open) {
      form.reset({ reason: "" });
    }
  }, [open, form]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{lang === "ar" ? "رفض الاشتراك" : "Reject subscription"}</DialogTitle>
          <DialogDescription>
            {lang === "ar"
              ? `أخبر ${studentName} عن سبب رفض هذا الإيصال. السبب مطلوب وسيتم إرساله مع طلب الرفض.`
              : `Tell ${studentName} why this receipt is being rejected. The reason is required and is sent to Nest with the reject call.`}
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit((values) => {
            onSubmit(values.reason);
          })}
        >
          <FieldGroup>
            <Field data-invalid={Boolean(form.formState.errors.reason)}>
              <FieldLabel htmlFor="reject-reason">{lang === "ar" ? "سبب الرفض" : "Rejection reason"}</FieldLabel>
              <Textarea
                id="reject-reason"
                rows={4}
                placeholder={lang === "ar" ? "أدخل سبب الرفض…" : "Enter rejection reason…"}
                disabled={pending}
                aria-invalid={Boolean(form.formState.errors.reason)}
                {...form.register("reason")}
              />
              <FieldError errors={[form.formState.errors.reason]} />
            </Field>
          </FieldGroup>
          {errorMessage ? (
            <p className="text-body-sm text-error" role="alert">
              {errorMessage}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending
                ? (lang === "ar" ? "جاري الرفض…" : "Rejecting…")
                : (lang === "ar" ? "رفض الاشتراك" : "Reject subscription")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function rejectMutationErrorMessage(error: unknown, lang: string): string {
  if (!isApiError(error)) return lang === "ar" ? "فشل الرفض. حاول مرة أخرى." : "Reject failed. Try again.";
  if (error.status === 403) {
    return lang === "ar" ? "ليس لديك صلاحية لرفض هذا الاشتراك." : "You are not allowed to reject this subscription.";
  }
  if (error.status === 404) {
    return lang === "ar" ? "هذا الاشتراك لم يعد موجوداً." : "This subscription no longer exists.";
  }
  if (error.status === 400) {
    return lang === "ar" ? "رفض Nest محتوى السبب. تحقق من السبب وحاول مرة أخرى." : "Nest rejected the reason payload. Check the reason and try again.";
  }
  return error.message;
}
