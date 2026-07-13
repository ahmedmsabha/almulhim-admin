"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FloppyDiskIcon } from "@phosphor-icons/react";

import { AnnouncementImageSection } from "@/components/announcements/AnnouncementImageSection";
import { AnnouncementPublishSwitch } from "@/components/announcements/AnnouncementPublishSwitch";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { isApiError } from "@/lib/api/errors";
import {
  announcementFormSchema,
  announcementFormToCreateBody,
  announcementFormToUpdateBody,
  EMPTY_ANNOUNCEMENT_FORM,
  type AnnouncementFormInput,
  type AnnouncementFormValues,
} from "@/lib/announcements/form-schema";
import type { AdminAnnouncementSummary } from "@/lib/announcements/types";
import {
  useCreateAnnouncement,
  useUpdateAnnouncement,
} from "@/lib/announcements/use-announcement-mutations";
import {
  CONTENT_REGION_LABELS,
  type ContentRegion,
} from "@/lib/content/types";
import { nestFieldErrorsFromApiError } from "@/lib/plans/nest-field-errors";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type AnnouncementsComposerProps = {
  selected: AdminAnnouncementSummary | null;
  onCreated: (id: string) => void;
};

export function AnnouncementsComposer({
  selected,
  onCreated,
}: AnnouncementsComposerProps) {
  const create = useCreateAnnouncement();
  const update = useUpdateAnnouncement();
  const isEdit = Boolean(selected);
  const { t, lang } = useTranslation();

  const form = useForm<AnnouncementFormInput, unknown, AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: EMPTY_ANNOUNCEMENT_FORM,
  });

  const selectedId = selected?.id;

  // Reset only when selection changes (new vs edit id), not when cache rewrites the same row.
  useEffect(() => {
    if (selected) {
      form.reset({
        title: selected.title,
        body: selected.body,
        region: selected.region,
      });
      return;
    }
    form.reset(EMPTY_ANNOUNCEMENT_FORM);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by selectedId, not full selected object
  }, [selectedId, form]);

  const saving = create.isPending || update.isPending;

  async function onSubmit(values: AnnouncementFormValues) {
    form.clearErrors();
    try {
      if (selected) {
        await update.mutateAsync({
          announcementId: selected.id,
          body: announcementFormToUpdateBody(values),
        });
        form.reset(values);
        return;
      }
      const created = await create.mutateAsync(
        announcementFormToCreateBody(values),
      );
      onCreated(created.id);
    } catch (error) {
      const fieldErrors = nestFieldErrorsFromApiError(error);
      for (const [name, message] of Object.entries(fieldErrors)) {
        if (name === "title" || name === "body" || name === "region") {
          form.setError(name, { message });
        }
      }
      if (Object.keys(fieldErrors).length === 0) {
        form.setError("root", {
          message: isApiError(error)
            ? error.message
            : (lang === "ar" ? "تعذر حفظ الإعلان." : "Could not save announcement."),
        });
      }
    }
  }

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-headline-sm font-semibold text-on-surface">
              {isEdit ? t("announcements.composer.editTitle") : t("announcements.composer.createTitle")}
            </h3>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              {lang === "ar"
                ? "العنوان، نص الرسالة بالعربية، والمنطقة المستهدفة. النشر منفصل عن الحفظ."
                : "Title, Arabic body, and region. Publish is separate from Save."}
            </p>
          </div>
          {selected ? (
            <AnnouncementPublishSwitch
              id={selected.id}
              title={selected.title}
              isPublished={selected.isPublished}
            />
          ) : null}
        </div>

        <FieldGroup>
          <Field data-invalid={Boolean(form.formState.errors.title)}>
            <FieldLabel htmlFor="announcement-title">
              {t("announcements.composer.titleLabel")}
            </FieldLabel>
            <Input
              id="announcement-title"
              placeholder={lang === "ar" ? "أدخل عنوان الإعلان…" : "Enter announcement title…"}
              {...form.register("title")}
            />
            <FieldError>{form.formState.errors.title?.message}</FieldError>
          </Field>

          <Field data-invalid={Boolean(form.formState.errors.region)}>
            <FieldLabel>{lang === "ar" ? "المنطقة المستهدفة" : "Target region"}</FieldLabel>
            <Controller
              control={form.control}
              name="region"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange(value as ContentRegion)
                  }
                >
                  <SelectTrigger
                    className="w-full max-w-xs"
                    aria-label="Announcement region"
                  >
                    <SelectValue>
                      {(value) => (value ? t(`common.regions.${value}`) : "")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(
                        Object.keys(CONTENT_REGION_LABELS) as ContentRegion[]
                      ).map((region) => (
                        <SelectItem key={region} value={region}>
                          {t(`common.regions.${region}`)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{form.formState.errors.region?.message}</FieldError>
          </Field>

          <Field data-invalid={Boolean(form.formState.errors.body)}>
            <FieldLabel htmlFor="announcement-body">
              {t("announcements.composer.bodyLabel")}
            </FieldLabel>
            <Textarea
              id="announcement-body"
              rows={12}
              dir="rtl"
              lang="ar"
              className="resize-y"
              placeholder="اكتب نص الإعلان بالعربية…"
              {...form.register("body")}
            />
            <FieldError>{form.formState.errors.body?.message}</FieldError>
          </Field>
        </FieldGroup>

        <AnnouncementImageSection
          announcementId={selected?.id ?? null}
          imageStorageKey={selected?.imageStorageKey ?? null}
        />

        {form.formState.errors.root?.message ? (
          <p className="text-sm text-destructive" role="alert">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            disabled={saving}
            data-icon="leading"
          >
            <FloppyDiskIcon className="size-4" aria-hidden />
            {saving
              ? (lang === "ar" ? "جاري الحفظ…" : "Saving…")
              : isEdit
              ? (lang === "ar" ? "حفظ التغييرات" : "Save changes")
              : (lang === "ar" ? "حفظ مسودة" : "Save draft")}
          </Button>
        </div>
      </form>
    </div>
  );
}
