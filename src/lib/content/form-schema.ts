import { z } from "zod";

import type {
  CreateChapterBody,
  CreateLessonBody,
  CreateUnitBody,
  UpdateChapterBody,
  UpdateLessonBody,
  UpdatePdfBody,
  UpdateUnitBody,
  UpdateVideoBody,
} from "@/lib/content/types";

export const unitFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  region: z.enum(["gaza", "west_bank", "both"]),
  sortOrder: z.coerce.number().int().min(0),
});

export type UnitFormInput = z.input<typeof unitFormSchema>;
export type UnitFormValues = z.output<typeof unitFormSchema>;

export const chapterFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  sortOrder: z.coerce.number().int().min(0),
});

export type ChapterFormInput = z.input<typeof chapterFormSchema>;
export type ChapterFormValues = z.output<typeof chapterFormSchema>;

export const lessonFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  accessLevel: z.enum(["preview", "subscriber_only"]),
  sortOrder: z.coerce.number().int().min(0),
});

export type LessonFormInput = z.input<typeof lessonFormSchema>;
export type LessonFormValues = z.output<typeof lessonFormSchema>;

export const videoMetaFormSchema = z.object({
  title: z.string().trim().max(200).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0),
  durationSeconds: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value, ctx) => {
      if (!value) return null;
      const parsed = Number(value);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Duration must be a positive whole number of seconds",
        });
        return z.NEVER;
      }
      return parsed;
    }),
});

export type VideoMetaFormInput = z.input<typeof videoMetaFormSchema>;
export type VideoMetaFormValues = z.output<typeof videoMetaFormSchema>;

export const pdfMetaFormSchema = z.object({
  title: z.string().trim().max(200).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0),
});

export type PdfMetaFormInput = z.input<typeof pdfMetaFormSchema>;
export type PdfMetaFormValues = z.output<typeof pdfMetaFormSchema>;

export function unitFormToCreateBody(
  values: UnitFormValues,
  sortOrder: number,
): CreateUnitBody {
  const description = values.description?.trim();
  return {
    title: values.title,
    region: values.region,
    sortOrder,
    ...(description ? { description } : {}),
  };
}

export function unitFormToUpdateBody(values: UnitFormValues): UpdateUnitBody {
  const description = values.description?.trim() ?? "";
  return {
    title: values.title,
    region: values.region,
    sortOrder: values.sortOrder,
    description: description.length > 0 ? description : null,
  };
}

export function chapterFormToCreateBody(
  values: ChapterFormValues,
  sortOrder: number,
): CreateChapterBody {
  return { title: values.title, sortOrder };
}

export function chapterFormToUpdateBody(
  values: ChapterFormValues,
): UpdateChapterBody {
  return { title: values.title, sortOrder: values.sortOrder };
}

export function lessonFormToCreateBody(
  values: LessonFormValues,
  sortOrder: number,
): CreateLessonBody {
  return {
    title: values.title,
    accessLevel: values.accessLevel,
    sortOrder,
  };
}

export function lessonFormToUpdateBody(
  values: LessonFormValues,
): UpdateLessonBody {
  return {
    title: values.title,
    accessLevel: values.accessLevel,
    sortOrder: values.sortOrder,
  };
}

export function videoMetaToUpdateBody(
  values: VideoMetaFormValues,
): UpdateVideoBody {
  const title = values.title?.trim() ?? "";
  return {
    title: title.length > 0 ? title : null,
    sortOrder: values.sortOrder,
    durationSeconds: values.durationSeconds,
  };
}

export function pdfMetaToUpdateBody(values: PdfMetaFormValues): UpdatePdfBody {
  const title = values.title?.trim() ?? "";
  return {
    title: title.length > 0 ? title : null,
    sortOrder: values.sortOrder,
  };
}
