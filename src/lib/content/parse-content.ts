import { ApiError } from "@/lib/api/errors";
import type {
  AdminChapterDetail,
  AdminChapterSummary,
  AdminContentTreeChapter,
  AdminContentTreeLesson,
  AdminContentTreeResponse,
  AdminContentTreeUnit,
  AdminLessonDetail,
  AdminLessonSummary,
  AdminPdf,
  AdminUnitSummary,
  AdminVideo,
  ContentMediaDeleted,
  ContentRegion,
  ContentSearchResponse,
  LessonAccessLevel,
  MediaUploadUrlResponse,
  MediaViewUrlResponse,
} from "@/lib/content/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isContentRegion(value: unknown): value is ContentRegion {
  return value === "gaza" || value === "west_bank" || value === "both";
}

function isAccessLevel(value: unknown): value is LessonAccessLevel {
  return value === "preview" || value === "subscriber_only";
}

function isIsoOrNull(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

export function isAdminUnitSummary(value: unknown): value is AdminUnitSummary {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    (value.description === null || typeof value.description === "string") &&
    isContentRegion(value.region) &&
    typeof value.sortOrder === "number" &&
    typeof value.isPublished === "boolean" &&
    isIsoOrNull(value.publishedAt)
  );
}

export function isAdminChapterSummary(
  value: unknown,
): value is AdminChapterSummary {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.sortOrder === "number" &&
    typeof value.isPublished === "boolean" &&
    isIsoOrNull(value.publishedAt)
  );
}

export function isAdminLessonSummary(
  value: unknown,
): value is AdminLessonSummary {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.sortOrder === "number" &&
    isAccessLevel(value.accessLevel) &&
    typeof value.isPublished === "boolean" &&
    isIsoOrNull(value.publishedAt)
  );
}

function isAdminVideo(value: unknown): value is AdminVideo {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    (value.title === null || typeof value.title === "string") &&
    (value.durationSeconds === null ||
      typeof value.durationSeconds === "number") &&
    typeof value.sortOrder === "number" &&
    typeof value.storageKey === "string"
  );
}

function isAdminPdf(value: unknown): value is AdminPdf {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    (value.title === null || typeof value.title === "string") &&
    typeof value.sortOrder === "number" &&
    typeof value.storageKey === "string"
  );
}

function isTreeLesson(value: unknown): value is AdminContentTreeLesson {
  return isAdminLessonSummary(value);
}

function isTreeChapter(value: unknown): value is AdminContentTreeChapter {
  if (!isRecord(value) || !Array.isArray(value.lessons)) return false;
  if (!value.lessons.every(isTreeLesson)) return false;
  return isAdminChapterSummary(value);
}

function isTreeUnit(value: unknown): value is AdminContentTreeUnit {
  if (!isRecord(value) || !Array.isArray(value.chapters)) return false;
  if (!value.chapters.every(isTreeChapter)) return false;
  return isAdminUnitSummary(value);
}

export function isAdminContentTreeResponse(
  value: unknown,
): value is AdminContentTreeResponse {
  if (!isRecord(value) || !Array.isArray(value.units)) return false;
  return value.units.every(isTreeUnit);
}

export function isAdminLessonDetail(value: unknown): value is AdminLessonDetail {
  if (!isRecord(value)) return false;
  if (typeof value.chapterId !== "string") return false;
  if (!Array.isArray(value.videos) || !value.videos.every(isAdminVideo)) {
    return false;
  }
  if (!Array.isArray(value.pdfs) || !value.pdfs.every(isAdminPdf)) {
    return false;
  }
  return isAdminLessonSummary(value);
}

export function isAdminChapterDetail(
  value: unknown,
): value is AdminChapterDetail {
  if (!isRecord(value)) return false;
  if (typeof value.unitId !== "string") return false;
  if (
    !Array.isArray(value.lessons) ||
    !value.lessons.every(isAdminLessonSummary)
  ) {
    return false;
  }
  return isAdminChapterSummary(value);
}

export function isContentSearchResponse(
  value: unknown,
): value is ContentSearchResponse {
  if (!isRecord(value) || !Array.isArray(value.matchingIds)) return false;
  return value.matchingIds.every((id) => typeof id === "string");
}

export function isMediaUploadUrlResponse(
  value: unknown,
): value is MediaUploadUrlResponse {
  if (!isRecord(value)) return false;
  return (
    typeof value.uploadUrl === "string" &&
    typeof value.storageKey === "string" &&
    typeof value.expiresInSeconds === "number"
  );
}

export function isMediaViewUrlResponse(
  value: unknown,
): value is MediaViewUrlResponse {
  if (!isRecord(value)) return false;
  return (
    typeof value.url === "string" &&
    value.url.trim().length > 0 &&
    typeof value.expiresInSeconds === "number"
  );
}

export function isContentMediaDeleted(
  value: unknown,
): value is ContentMediaDeleted {
  if (!isRecord(value)) return false;
  return value.deleted === true && typeof value.id === "string";
}

export function parseAdminContentTreeResponse(
  value: unknown,
  path: string,
): AdminContentTreeResponse {
  if (!isAdminContentTreeResponse(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[content] invalid AdminContentTreeResponse from ${path}`,
      path,
    });
  }
  return value;
}

export function parseAdminLessonDetail(
  value: unknown,
  path: string,
): AdminLessonDetail {
  if (!isAdminLessonDetail(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[content] invalid AdminLessonDetail from ${path}`,
      path,
    });
  }
  return value;
}

export function parseAdminUnitSummary(
  value: unknown,
  path: string,
): AdminUnitSummary {
  if (!isAdminUnitSummary(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[content] invalid AdminUnitSummary from ${path}`,
      path,
    });
  }
  return value;
}

export function parseAdminChapterSummary(
  value: unknown,
  path: string,
): AdminChapterSummary {
  if (!isAdminChapterSummary(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[content] invalid AdminChapterSummary from ${path}`,
      path,
    });
  }
  return value;
}

export function parseAdminChapterDetail(
  value: unknown,
  path: string,
): AdminChapterDetail {
  if (!isAdminChapterDetail(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[content] invalid AdminChapterDetail from ${path}`,
      path,
    });
  }
  return value;
}

export function parseAdminVideo(value: unknown, path: string): AdminVideo {
  if (!isAdminVideo(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[content] invalid AdminVideo from ${path}`,
      path,
    });
  }
  return value;
}

export function parseAdminPdf(value: unknown, path: string): AdminPdf {
  if (!isAdminPdf(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[content] invalid AdminPdf from ${path}`,
      path,
    });
  }
  return value;
}

export function parseMediaUploadUrlResponse(
  value: unknown,
  path: string,
): MediaUploadUrlResponse {
  if (!isMediaUploadUrlResponse(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[content] invalid MediaUploadUrlResponse from ${path}`,
      path,
    });
  }
  return value;
}

export function parseMediaViewUrlResponse(
  value: unknown,
  path: string,
): MediaViewUrlResponse {
  if (!isMediaViewUrlResponse(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[content] invalid MediaViewUrlResponse from ${path}`,
      path,
    });
  }
  return value;
}

export function parseContentMediaDeleted(
  value: unknown,
  path: string,
): ContentMediaDeleted {
  if (!isContentMediaDeleted(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[content] invalid ContentMediaDeleted from ${path}`,
      path,
    });
  }
  return value;
}

export function parseContentSearchResponse(
  value: unknown,
  path: string,
): ContentSearchResponse {
  if (!isContentSearchResponse(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[content] invalid ContentSearchResponse from ${path}`,
      path,
    });
  }
  return value;
}
