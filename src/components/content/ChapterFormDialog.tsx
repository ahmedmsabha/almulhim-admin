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
import { Input } from "@/components/ui/input";
import { isApiError } from "@/lib/api/errors";
import {
  chapterFormSchema,
  chapterFormToCreateBody,
  chapterFormToUpdateBody,
  type ChapterFormInput,
  type ChapterFormValues,
} from "@/lib/content/form-schema";
import { nextSortOrder } from "@/lib/content/next-sort-order";
import type { AdminContentTreeChapter } from "@/lib/content/types";
import {
  useCreateChapter,
  useUpdateChapter,
} from "@/lib/content/use-content-mutations";
import { nestFieldErrorsFromApiError } from "@/lib/plans/nest-field-errors";

type ChapterFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId: string;
  chapter: AdminContentTreeChapter | null;
  siblingSortOrders: number[];
};

const emptyDefaults: ChapterFormInput = {
  title: "",
  sortOrder: 0,
};

function defaultsFromChapter(
  chapter: AdminContentTreeChapter | null,
): ChapterFormInput {
  if (!chapter) return emptyDefaults;
  return {
    title: chapter.title,
    sortOrder: chapter.sortOrder,
  };
}

export function ChapterFormDialog({
  open,
  onOpenChange,
  unitId,
  chapter,
  siblingSortOrders,
}: ChapterFormDialogProps) {
  const isEdit = chapter !== null;
  const create = useCreateChapter();
  const update = useUpdateChapter();
  const pending = create.isPending || update.isPending;

  const form = useForm<ChapterFormInput, unknown, ChapterFormValues>({
    resolver: zodResolver(chapterFormSchema),
    defaultValues: emptyDefaults,
  });

  const chapterId = chapter?.id;

  useEffect(() => {
    if (open) {
      form.reset(defaultsFromChapter(chapter));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by chapterId
  }, [open, chapterId, form]);

  async function onSubmit(values: ChapterFormValues) {
    form.clearErrors();
    try {
      if (isEdit && chapter) {
        await update.mutateAsync({
          chapterId: chapter.id,
          body: chapterFormToUpdateBody(values),
        });
      } else {
        await create.mutateAsync({
          unitId,
          body: chapterFormToCreateBody(
            values,
            nextSortOrder(siblingSortOrders),
          ),
        });
      }
      onOpenChange(false);
    } catch (error) {
      const mapped = nestFieldErrorsFromApiError(error);
      for (const [key, message] of Object.entries(mapped)) {
        form.setError(key as keyof ChapterFormValues, { message });
      }
      if (Object.keys(mapped).length === 0) {
        form.setError("root", {
          message: isApiError(error)
            ? error.message
            : "Could not save chapter. Try again.",
        });
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit chapter" : "New chapter"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update chapter title and order."
              : "Create a chapter under this unit. Sort order is appended."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FieldGroup>
            <Field data-invalid={Boolean(form.formState.errors.title)}>
              <FieldLabel htmlFor="chapter-title">Title</FieldLabel>
              <Input
                id="chapter-title"
                {...form.register("title")}
                aria-invalid={Boolean(form.formState.errors.title)}
              />
              <FieldError>{form.formState.errors.title?.message}</FieldError>
            </Field>
            {isEdit ? (
              <Field data-invalid={Boolean(form.formState.errors.sortOrder)}>
                <FieldLabel htmlFor="chapter-sort">Sort order</FieldLabel>
                <Input
                  id="chapter-sort"
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
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending
                ? "Saving…"
                : isEdit
                  ? "Save chapter"
                  : "Create chapter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
