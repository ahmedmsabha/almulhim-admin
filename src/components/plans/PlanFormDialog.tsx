"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { isApiError } from "@/lib/api/errors";
import {
  planFormSchema,
  planFormToCreateBody,
  planFormToUpdateBody,
  type PlanFormInput,
  type PlanFormValues,
} from "@/lib/plans/form-schema";
import { minorToMajor } from "@/lib/plans/money";
import { nestFieldErrorsFromApiError } from "@/lib/plans/nest-field-errors";
import type { AdminPlan } from "@/lib/plans/types";
import {
  useCreatePlan,
  useUpdatePlan,
} from "@/lib/plans/use-plan-mutations";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type PlanFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: AdminPlan | null;
};

const emptyDefaults: PlanFormInput = {
  name: "",
  description: "",
  priceMajor: 0,
  durationDays: 30,
  sortOrder: 0,
  isActive: true,
};

function defaultsFromPlan(plan: AdminPlan | null): PlanFormInput {
  if (!plan) return emptyDefaults;
  return {
    name: plan.name,
    description: plan.description ?? "",
    priceMajor: minorToMajor(plan.priceAmount),
    durationDays: plan.durationDays,
    sortOrder: plan.sortOrder,
    isActive: plan.isActive,
  };
}

export function PlanFormDialog({
  open,
  onOpenChange,
  plan,
}: PlanFormDialogProps) {
  const isEdit = plan !== null;
  const create = useCreatePlan();
  const update = useUpdatePlan();
  const pending = create.isPending || update.isPending;
  const { t, lang } = useTranslation();

  const form = useForm<PlanFormInput, unknown, PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: emptyDefaults,
  });

  const planId = plan?.id;

  // Reset when the dialog opens or switches create ↔ edit plan — not on every list refresh.
  useEffect(() => {
    if (open) {
      form.reset(defaultsFromPlan(plan));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally keyed by planId, not full plan
  }, [open, planId, form]);

  // Keep isActive in sync with live list (row Switch) unless the admin edited it in the dialog.
  useEffect(() => {
    if (!open || !plan) return;
    if (!form.formState.dirtyFields.isActive) {
      form.setValue("isActive", plan.isActive);
    }
  }, [open, plan, form]);

  async function onSubmit(values: PlanFormValues) {
    form.clearErrors();
    try {
      if (isEdit && plan) {
        await update.mutateAsync({
          planId: plan.id,
          body: planFormToUpdateBody(values),
        });
      } else {
        await create.mutateAsync(planFormToCreateBody(values));
      }
      onOpenChange(false);
    } catch (error) {
      const fieldErrors = nestFieldErrorsFromApiError(error);
      for (const [key, message] of Object.entries(fieldErrors)) {
        form.setError(key as keyof PlanFormValues, { message });
      }
      if (Object.keys(fieldErrors).length === 0) {
        form.setError("root", {
          message: isApiError(error)
            ? error.message
            : (lang === "ar" ? "فشل حفظ الخطة. حاول مرة أخرى." : "Could not save the plan. Try again."),
        });
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <DialogTitle className="font-display text-headline-sm">
            {isEdit ? t("plans.form.editPlan") : t("plans.form.createPlan")}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? (lang === "ar" ? "تحديث الأسعار والمدة والتوافر لهذه الفئة." : "Update pricing, duration, and availability for this tier.")
              : (lang === "ar" ? "تكوين تفاصيل فئة اشتراك جديدة." : "Configure details for a new subscription tier.")}
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-6"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.name || undefined}>
              <FieldLabel htmlFor="plan-name">{t("plans.form.planName")}</FieldLabel>
              <Input
                id="plan-name"
                placeholder={lang === "ar" ? "مثال: الباقة السنوية" : "e.g. Premium Yearly"}
                aria-invalid={!!form.formState.errors.name || undefined}
                {...form.register("name")}
              />
              <FieldError>{form.formState.errors.name?.message}</FieldError>
            </Field>

            <Field
              data-invalid={!!form.formState.errors.description || undefined}
            >
              <FieldLabel htmlFor="plan-description">{t("plans.form.description")}</FieldLabel>
              <Textarea
                id="plan-description"
                rows={3}
                placeholder={lang === "ar" ? "وصف قصير اختياري" : "Optional short description"}
                aria-invalid={
                  !!form.formState.errors.description || undefined
                }
                {...form.register("description")}
              />
              <FieldError>
                {form.formState.errors.description?.message}
              </FieldError>
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                data-invalid={!!form.formState.errors.priceMajor || undefined}
              >
                <FieldLabel htmlFor="plan-price">{t("plans.form.priceIls")}</FieldLabel>
                <Input
                  id="plan-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  aria-invalid={
                    !!form.formState.errors.priceMajor || undefined
                  }
                  {...form.register("priceMajor")}
                />
                <p className="text-body-sm text-on-surface-variant">
                  {lang === "ar"
                    ? "أدخل السعر بالشيكل الإسرائيلي. يوضح الجدول الشيكل والدولار والجنيه من الأسعار الحية."
                    : "Enter the price in Israeli Shekels. The table shows ILS, USD, and EGP from live rates."}
                </p>
                <FieldError>
                  {form.formState.errors.priceMajor?.message}
                </FieldError>
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.durationDays || undefined
                }
              >
                <FieldLabel htmlFor="plan-duration">{t("plans.form.durationDays")}</FieldLabel>
                <Input
                  id="plan-duration"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="30"
                  aria-invalid={
                    !!form.formState.errors.durationDays || undefined
                  }
                  {...form.register("durationDays")}
                />
                <FieldError>
                  {form.formState.errors.durationDays?.message}
                </FieldError>
              </Field>
            </div>

            <Field
              data-invalid={!!form.formState.errors.sortOrder || undefined}
            >
              <FieldLabel htmlFor="plan-sort">{t("plans.form.sortOrder")}</FieldLabel>
              <Input
                id="plan-sort"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                aria-invalid={!!form.formState.errors.sortOrder || undefined}
                {...form.register("sortOrder")}
              />
              <FieldError>
                {form.formState.errors.sortOrder?.message}
              </FieldError>
            </Field>

            {isEdit ? (
              <Field orientation="horizontal">
                <div className="flex flex-1 flex-col gap-1">
                  <FieldLabel htmlFor="plan-active">{t("plans.form.isActive")}</FieldLabel>
                  <p className="text-body-sm text-on-surface-variant">
                    {lang === "ar" ? "إتاحة هذه الخطة للشراء" : "Make this plan available for purchase"}
                  </p>
                </div>
                <Controller
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <Switch
                      id="plan-active"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </Field>
            ) : null}
          </FieldGroup>

          {form.formState.errors.root?.message ? (
            <p className="text-body-sm text-destructive" role="alert">
              {form.formState.errors.root.message}
            </p>
          ) : null}

          <DialogFooter className="gap-3 sm:justify-stretch">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              {t("plans.form.cancel")}
            </Button>
            <Button type="submit" className="flex-1" disabled={pending}>
              {pending ? t("plans.form.saving") : t("plans.form.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
