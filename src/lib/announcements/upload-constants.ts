import type { AnnouncementImageContentType } from "@/lib/announcements/types";

export const ALLOWED_ANNOUNCEMENT_IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const satisfies readonly AnnouncementImageContentType[];

export const MAX_ANNOUNCEMENT_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function isAnnouncementImageContentType(
  value: string,
): value is AnnouncementImageContentType {
  return (
    ALLOWED_ANNOUNCEMENT_IMAGE_CONTENT_TYPES as readonly string[]
  ).includes(value);
}
