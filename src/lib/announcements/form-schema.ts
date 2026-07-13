import { z } from "zod";

import type {
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from "@/lib/announcements/types";

export const announcementFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  body: z.string().trim().min(1, "Body is required").max(10000),
  region: z.enum(["gaza", "west_bank", "both"]),
});

export type AnnouncementFormValues = z.output<typeof announcementFormSchema>;
export type AnnouncementFormInput = z.input<typeof announcementFormSchema>;

export function announcementFormToCreateBody(
  values: AnnouncementFormValues,
): CreateAnnouncementInput {
  return {
    title: values.title,
    body: values.body,
    region: values.region,
  };
}

export function announcementFormToUpdateBody(
  values: AnnouncementFormValues,
): UpdateAnnouncementInput {
  return {
    title: values.title,
    body: values.body,
    region: values.region,
  };
}

export const EMPTY_ANNOUNCEMENT_FORM: AnnouncementFormInput = {
  title: "",
  body: "",
  region: "both",
};
