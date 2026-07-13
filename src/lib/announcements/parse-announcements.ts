import { ApiError } from "@/lib/api/errors";
import type {
  AdminAnnouncementListResponse,
  AdminAnnouncementSummary,
  ImageUploadUrlResponse,
} from "@/lib/announcements/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isContentRegion(value: unknown): value is string {
  return value === "gaza" || value === "west_bank" || value === "both";
}

export function isAdminAnnouncementSummary(
  value: unknown,
): value is AdminAnnouncementSummary {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string") return false;
  if (typeof value.title !== "string") return false;
  if (typeof value.body !== "string") return false;
  if (!isContentRegion(value.region)) return false;
  if (
    value.imageStorageKey !== null &&
    typeof value.imageStorageKey !== "string"
  ) {
    return false;
  }
  if (typeof value.isPublished !== "boolean") return false;
  if (value.publishedAt !== null && typeof value.publishedAt !== "string") {
    return false;
  }
  if (typeof value.createdAt !== "string") return false;
  if (typeof value.updatedAt !== "string") return false;
  return true;
}

export function isAdminAnnouncementListResponse(
  value: unknown,
): value is AdminAnnouncementListResponse {
  if (!isRecord(value)) return false;
  if (!Array.isArray(value.announcements)) return false;
  return value.announcements.every(isAdminAnnouncementSummary);
}

export function isImageUploadUrlResponse(
  value: unknown,
): value is ImageUploadUrlResponse {
  if (!isRecord(value)) return false;
  return (
    typeof value.uploadUrl === "string" &&
    typeof value.storageKey === "string" &&
    typeof value.expiresInSeconds === "number"
  );
}

export function parseAdminAnnouncementSummary(
  value: unknown,
  path: string,
): AdminAnnouncementSummary {
  if (!isAdminAnnouncementSummary(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[announcements] invalid AdminAnnouncementSummary from ${path}`,
      path,
    });
  }
  return value;
}

export function parseAdminAnnouncementListResponse(
  value: unknown,
  path: string,
): AdminAnnouncementListResponse {
  if (!isAdminAnnouncementListResponse(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[announcements] invalid AdminAnnouncementListResponse from ${path}`,
      path,
    });
  }
  return value;
}

export function parseImageUploadUrlResponse(
  value: unknown,
  path: string,
): ImageUploadUrlResponse {
  if (!isImageUploadUrlResponse(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[announcements] invalid ImageUploadUrlResponse from ${path}`,
      path,
    });
  }
  return value;
}
