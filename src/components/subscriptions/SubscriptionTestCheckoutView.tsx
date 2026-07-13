"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  seedTestCheckoutAction,
  type SeedTestCheckoutState,
} from "@/app/(dashboard)/(gated)/dev/subscriptions/actions";
import { fetchAllPlans } from "@/lib/plans/fetch-plans";
import type { AdminPlan } from "@/lib/plans/types";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const initialState: SeedTestCheckoutState | null = null;

export function SubscriptionTestCheckoutView() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [planId, setPlanId] = useState("");
  const [state, formAction, pending] = useActionState(
    seedTestCheckoutAction,
    initialState,
  );
  const { t, lang } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const token = await getToken();
        if (!token) {
          if (!cancelled) {
            setPlansError(
              lang === "ar" ? "سجل الدخول مرة أخرى لتحميل الباقات." : "Sign in again to load plans.",
            );
          }
          return;
        }
        const list = await fetchAllPlans(token);
        if (cancelled) return;
        const active = list.plans.filter((plan) => plan.isActive);
        setPlans(active);
        setPlanId((current) => current || active[0]?.id || "");
      } catch (error) {
        if (!cancelled) {
          setPlansError(
            error instanceof Error
              ? error.message
              : (lang === "ar" ? "لم نتمكن من تحميل الباقات." : "Could not load plans."),
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken, lang]);

  useEffect(() => {
    if (state?.ok) {
      router.push(`/subscriptions/${state.subscriptionId}`);
    }
  }, [state, router]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow={t("subscriptions.titles.pending")}
        title={lang === "ar" ? "تجربة الدفع" : "Test checkout"}
        description={
          lang === "ar"
            ? "أرسل إيصال طالب حقيقي من خلال Nest (presign ← R2 ← إرسال). يعمل نموذج Gemini (gemini-3.5-flash) في الخلفية، ثم تفتح نفس شاشة المراجعة للإنتاج."
            : "Submit a real student receipt through Nest (presign → R2 → submit). Gemini (gemini-3.5-flash) runs on the backend, then you land on the same review screen as production."
        }
        className="mb-0"
      />

      <Card className="mx-auto w-full max-w-xl rounded-xl border border-outline-variant bg-surface-container-lowest py-0 ring-0">
        <CardHeader className="border-b border-outline-variant px-6 py-4">
          <CardTitle className="text-headline-sm font-display text-on-surface">
            {lang === "ar" ? "اشتراك الطالب" : "Student subscription"}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-5">
          <form action={formAction} className="flex flex-col gap-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="planId">{t("subscriptions.table.plan")}</FieldLabel>
                <input type="hidden" name="planId" value={planId} />
                <Select
                  value={planId || null}
                  onValueChange={(value) => {
                    if (value != null) setPlanId(String(value));
                  }}
                  disabled={pending || plans.length === 0}
                >
                  <SelectTrigger id="planId" className="w-full">
                    <SelectValue placeholder={lang === "ar" ? "اختر باقة" : "Select a plan"}>
                      {(value) => {
                        const plan = plans.find((p) => p.id === value);
                        return plan
                          ? `${plan.name} · ${(plan.priceAmount / 100).toFixed(2)} ${plan.currency}`
                          : "";
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} · {(plan.priceAmount / 100).toFixed(2)}{" "}
                        {plan.currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {plansError ? <FieldError>{plansError}</FieldError> : null}
              </Field>

              <Field>
                <FieldLabel htmlFor="senderName">{t("subscriptions.detail.senderName")}</FieldLabel>
                <Input
                  id="senderName"
                  name="senderName"
                  defaultValue="Ahmad Al-Masri"
                  disabled={pending}
                  required
                  minLength={2}
                  maxLength={120}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="receipt">{lang === "ar" ? "صورة الإيصال" : "Receipt image"}</FieldLabel>
                <Input
                  id="receipt"
                  name="receipt"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={pending}
                  required
                />
              </Field>
            </FieldGroup>

            {state && !state.ok ? (
              <p className="text-body-sm text-error" role="alert">
                {state.error}
              </p>
            ) : null}
            {state?.ok ? (
              <p className="text-body-sm text-status-active" role="status">
                {lang === "ar"
                  ? `تم الإرسال لـ ${state.studentEmail}. جاري فتح المراجعة…`
                  : `Submitted for ${state.studentEmail}. Opening review…`}
              </p>
            ) : null}

            <Button type="submit" disabled={pending || !planId}>
              {pending
                ? (lang === "ar" ? "جاري الإرسال إلى Nest…" : "Submitting to Nest…")
                : (lang === "ar" ? "إرسال وفتح المراجعة" : "Submit & open review")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
