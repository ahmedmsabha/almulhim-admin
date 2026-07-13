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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isApiError } from "@/lib/api/errors";
import {
  lessonFormSchema,
  lessonFormToCreateBody,
  lessonFormToUpdateBody,
  type LessonFormInput,
  type LessonFormValues,
} from "@/lib/content/form-schema";
import { nextSortOrder } from "@/lib/content/next-sort-order";
import type {
  AdminContentTreeLesson,
  LessonAccessLevel,
} from "@/lib/content/types";
import { ACCESS_LEVEL_LABELS } from "@/lib/content/types";
import {
  useCreateLesson,
  useUpdateLesson,
} from "@/lib/content/use-content-mutations";
import { nestFieldErrorsFromApiError } from "@/lib/plans/nest-field-errors";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type LessonFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapterId: string;
  lesson: AdminContentTreeLesson | null;
  siblingSortOrders: number[];
  onCreated?: (lessonId: string) => void;
};

const emptyDefaults: LessonFormInput = {
  title: "",
  accessLevel: "subscriber_only",
  sortOrder: 0,
};

function defaultsFromLesson(
  lesson: AdminContentTreeLesson | null,
): LessonFormInput {
  if (!lesson) return emptyDefaults;
  return {
    title: lesson.title,
    accessLevel: lesson.accessLevel,
    sortOrder: lesson.sortOrder,
  };
}

export function LessonFormDialog({
  open,
  onOpenChange,
  chapterId,
  lesson,
  siblingSortOrders,
  onCreated,
}: LessonFormDialogProps) {
  const isEdit = lesson !== null;
  const create = useCreateLesson();
  const update = useUpdateLesson();
  const pending = create.isPending || update.isPending;
  const { t, lang } = useTranslation();

  const form = useForm<LessonFormInput, unknown, LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: emptyDefaults,
  });

  const lessonId = lesson?.id;

  useEffect(() => {
    if (open) {
      form.reset(defaultsFromLesson(lesson));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by lessonId
  }, [open, lessonId, form]);

  async function onSubmit(values: LessonFormValues) {
    form.clearErrors();
    try {
      if (isEdit && lesson) {
        await update.mutateAsync({
          lessonId: lesson.id,
          body: lessonFormToUpdateBody(values),
        });
      } else {
        const created = await create.mutateAsync({
          chapterId,
          body: lessonFormToCreateBody(
            values,
            nextSortOrder(siblingSortOrders),
          ),
        });
        onCreated?.(created.id);
      }
      onOpenChange(false);
    } catch (error) {
      const mapped = nestFieldErrorsFromApiError(error);
      for (const [key, message] of Object.entries(mapped)) {
        form.setError(key as keyof LessonFormValues, { message });
      }
      if (Object.keys(mapped).length === 0) {
        form.setError("root", {
          message: isApiError(error)
            ? error.message
            : (lang === "ar" ? "تعذر حفظ الدرس. حاول مرة أخرى." : "Could not save lesson. Try again."),
        });
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? (lang === "ar" ? "تعديل الدرس" : "Edit lesson")
              : (lang === "ar" ? "درس جديد" : "New lesson")}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? (lang === "ar"
                  ? "تحديث عنوان الدرس، مستوى الوصول، والترتيب."
                  : "Update lesson title, access level, and order.")
              : (lang === "ar"
                  ? "إنشاء درس تحت هذا الفصل. يتم إلحاق ترتيب الفرز."
                  : "Create a lesson under this chapter. Sort order is appended.")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FieldGroup>
            <Field data-invalid={Boolean(form.formState.errors.title)}>
              <FieldLabel htmlFor="lesson-title">
                {lang === "ar" ? "العنوان" : "Title"}
              </FieldLabel>
              <Input
                id="lesson-title"
                {...form.register("title")}
                aria-invalid={Boolean(form.formState.errors.title)}
              />
              <FieldError>{form.formState.errors.title?.message}</FieldError>
            </Field>
            <Field data-invalid={Boolean(form.formState.errors.accessLevel)}>
              <FieldLabel>{lang === "ar" ? "مستوى الوصول" : "Access level"}</FieldLabel>
              <Controller
                control={form.control}
                name="accessLevel"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(value as LessonAccessLevel)
                    }
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-label="Lesson access level"
                    >
                      <SelectValue>
                        {(value) => (value ? t(`common.accessLevels.${value}`) : "")}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {(
                          Object.keys(
                            ACCESS_LEVEL_LABELS,
                          ) as LessonAccessLevel[]
                        ).map((level) => (
                          <SelectItem key={level} value={level}>
                            {t(`common.accessLevels.${level}`)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>
                {form.formState.errors.accessLevel?.message}
              </FieldError>
            </Field>
            {isEdit ? (
              <Field data-invalid={Boolean(form.formState.errors.sortOrder)}>
                <FieldLabel htmlFor="lesson-sort">
                  {lang === "ar" ? "ترتيب الفرز" : "Sort order"}
                </FieldLabel>
                <Input
                  id="lesson-sort"
                  type="number"
                  min={0}
                  step={1}
                  {...form.register("sortOrder")}
                />
                <FieldError>
                  {form.formState.errors.sortOrder?.message}
                </FieldError>
              </Field>
            ) : null}
          </FieldGroup>
          {form.formState.errors.root?.message ? (
            <p className="font-body-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending
                ? (lang === "ar" ? "جاري الحفظ…" : "Saving…")
                : isEdit
                ? (lang === "ar" ? "حفظ الدرس" : "Save lesson")
                : (lang === "ar" ? "إنشاء درس" : "Create lesson")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
