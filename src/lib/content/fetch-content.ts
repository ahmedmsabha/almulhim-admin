import { apiFetch } from "@/lib/api/api-fetch";
import { ApiError } from "@/lib/api/errors";
import {
  parseAdminChapterDetail,
  parseAdminChapterSummary,
  parseAdminContentTreeResponse,
  parseAdminLessonDetail,
  parseAdminPdf,
  parseAdminUnitSummary,
  parseAdminVideo,
  parseContentMediaDeleted,
  parseContentSearchResponse,
  parseMediaUploadUrlResponse,
  parseMediaViewUrlResponse,
} from "@/lib/content/parse-content";
import type {
  AdminChapterDetail,
  AdminChapterSummary,
  AdminContentTreeResponse,
  AdminLessonDetail,
  AdminPdf,
  AdminUnitSummary,
  AdminVideo,
  AttachPdfBody,
  AttachVideoBody,
  ContentEntityType,
  ContentMediaDeleted,
  ContentSearchInput,
  ContentSearchResponse,
  CreateChapterBody,
  CreateLessonBody,
  CreateUnitBody,
  MediaUploadUrlResponse,
  MediaViewUrlResponse,
  UpdateChapterBody,
  UpdateLessonBody,
  UpdatePdfBody,
  UpdateUnitBody,
  UpdateVideoBody,
} from "@/lib/content/types";

export const CONTENT_ADMIN_TREE_PATH = "/content/admin/tree";
export const CONTENT_SEARCH_PATH = "/content/search";

export function contentAdminLessonPath(lessonId: string) {
  return `/content/admin/lessons/${lessonId}`;
}

function contentPublishPath(
  entityType: ContentEntityType,
  id: string,
  publish: boolean,
) {
  const segment =
    entityType === "unit"
      ? "units"
      : entityType === "chapter"
        ? "chapters"
        : "lessons";
  const action = publish ? "publish" : "unpublish";
  return `/content/admin/${segment}/${id}/${action}`;
}

function requireToken(token: string, path: string) {
  if (!token) {
    throw new ApiError({
      kind: "unauthorized",
      message: `[content] missing Bearer token for ${path}`,
      path,
    });
  }
}

export async function fetchContentTree(
  token: string,
): Promise<AdminContentTreeResponse> {
  requireToken(token, CONTENT_ADMIN_TREE_PATH);
  const payload = await apiFetch<unknown>(CONTENT_ADMIN_TREE_PATH, { token });
  return parseAdminContentTreeResponse(payload, CONTENT_ADMIN_TREE_PATH);
}

export async function fetchContentLesson(
  token: string,
  lessonId: string,
): Promise<AdminLessonDetail> {
  const path = contentAdminLessonPath(lessonId);
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, { token });
  return parseAdminLessonDetail(payload, path);
}

export async function publishContentEntity(
  token: string,
  entityType: ContentEntityType,
  id: string,
  publish: boolean,
): Promise<AdminUnitSummary | AdminChapterSummary | AdminLessonDetail> {
  const path = contentPublishPath(entityType, id, publish);
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, { token, method: "PATCH" });
  if (entityType === "unit") {
    return parseAdminUnitSummary(payload, path);
  }
  if (entityType === "chapter") {
    return parseAdminChapterSummary(payload, path);
  }
  return parseAdminLessonDetail(payload, path);
}

export async function searchContentItems(
  token: string,
  body: ContentSearchInput,
): Promise<ContentSearchResponse> {
  requireToken(token, CONTENT_SEARCH_PATH);
  const payload = await apiFetch<unknown>(CONTENT_SEARCH_PATH, {
    token,
    method: "POST",
    body,
  });
  return parseContentSearchResponse(payload, CONTENT_SEARCH_PATH);
}

export async function createUnit(
  token: string,
  body: CreateUnitBody,
): Promise<AdminUnitSummary> {
  const path = "/content/admin/units";
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, {
    token,
    method: "POST",
    body,
  });
  return parseAdminUnitSummary(payload, path);
}

export async function updateUnit(
  token: string,
  unitId: string,
  body: UpdateUnitBody,
): Promise<AdminUnitSummary> {
  const path = `/content/admin/units/${unitId}`;
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, {
    token,
    method: "PATCH",
    body,
  });
  return parseAdminUnitSummary(payload, path);
}

export async function createChapter(
  token: string,
  unitId: string,
  body: CreateChapterBody,
): Promise<AdminChapterDetail> {
  const path = `/content/admin/units/${unitId}/chapters`;
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, {
    token,
    method: "POST",
    body,
  });
  return parseAdminChapterDetail(payload, path);
}

export async function updateChapter(
  token: string,
  chapterId: string,
  body: UpdateChapterBody,
): Promise<AdminChapterDetail> {
  const path = `/content/admin/chapters/${chapterId}`;
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, {
    token,
    method: "PATCH",
    body,
  });
  return parseAdminChapterDetail(payload, path);
}

export async function createLesson(
  token: string,
  chapterId: string,
  body: CreateLessonBody,
): Promise<AdminLessonDetail> {
  const path = `/content/admin/chapters/${chapterId}/lessons`;
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, {
    token,
    method: "POST",
    body,
  });
  return parseAdminLessonDetail(payload, path);
}

export async function updateLesson(
  token: string,
  lessonId: string,
  body: UpdateLessonBody,
): Promise<AdminLessonDetail> {
  const path = `/content/admin/lessons/${lessonId}`;
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, {
    token,
    method: "PATCH",
    body,
  });
  return parseAdminLessonDetail(payload, path);
}

export async function createVideoUploadUrl(
  token: string,
  lessonId: string,
): Promise<MediaUploadUrlResponse> {
  const path = `/content/admin/lessons/${lessonId}/videos/upload-url`;
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, {
    token,
    method: "POST",
    body: { contentType: "video/mp4" },
  });
  return parseMediaUploadUrlResponse(payload, path);
}

export async function attachVideo(
  token: string,
  lessonId: string,
  body: AttachVideoBody,
): Promise<AdminVideo> {
  const path = `/content/admin/lessons/${lessonId}/videos`;
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, {
    token,
    method: "POST",
    body,
  });
  return parseAdminVideo(payload, path);
}

export async function updateVideo(
  token: string,
  videoId: string,
  body: UpdateVideoBody,
): Promise<AdminVideo> {
  const path = `/content/admin/videos/${videoId}`;
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, {
    token,
    method: "PATCH",
    body,
  });
  return parseAdminVideo(payload, path);
}

export async function deleteVideo(
  token: string,
  videoId: string,
): Promise<ContentMediaDeleted> {
  const path = `/content/admin/videos/${videoId}`;
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, {
    token,
    method: "DELETE",
  });
  return parseContentMediaDeleted(payload, path);
}

export function videoPlaybackUrlPath(videoId: string) {
  return `/content/admin/videos/${videoId}/playback-url`;
}

export async function fetchVideoPlaybackUrl(
  token: string,
  videoId: string,
): Promise<MediaViewUrlResponse> {
  const path = videoPlaybackUrlPath(videoId);
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, { token });
  return parseMediaViewUrlResponse(payload, path);
}

export function pdfViewUrlPath(pdfId: string) {
  return `/content/admin/pdfs/${pdfId}/view-url`;
}

export async function fetchPdfViewUrl(
  token: string,
  pdfId: string,
): Promise<MediaViewUrlResponse> {
  const path = pdfViewUrlPath(pdfId);
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, { token });
  return parseMediaViewUrlResponse(payload, path);
}

export async function createPdfUploadUrl(
  token: string,
  lessonId: string,
): Promise<MediaUploadUrlResponse> {
  const path = `/content/admin/lessons/${lessonId}/pdfs/upload-url`;
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, {
    token,
    method: "POST",
    body: { contentType: "application/pdf" },
  });
  return parseMediaUploadUrlResponse(payload, path);
}

export async function attachPdf(
  token: string,
  lessonId: string,
  body: AttachPdfBody,
): Promise<AdminPdf> {
  const path = `/content/admin/lessons/${lessonId}/pdfs`;
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, {
    token,
    method: "POST",
    body,
  });
  return parseAdminPdf(payload, path);
}

export async function updatePdf(
  token: string,
  pdfId: string,
  body: UpdatePdfBody,
): Promise<AdminPdf> {
  const path = `/content/admin/pdfs/${pdfId}`;
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, {
    token,
    method: "PATCH",
    body,
  });
  return parseAdminPdf(payload, path);
}

export async function deletePdf(
  token: string,
  pdfId: string,
): Promise<ContentMediaDeleted> {
  const path = `/content/admin/pdfs/${pdfId}`;
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, {
    token,
    method: "DELETE",
  });
  return parseContentMediaDeleted(payload, path);
}
