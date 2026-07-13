import { apiFetch } from "@/lib/api/api-fetch";
import { ApiError } from "@/lib/api/errors";
import {
  parseAdminAnnouncementListResponse,
  parseAdminAnnouncementSummary,
  parseImageUploadUrlResponse,
} from "@/lib/announcements/parse-announcements";
import type {
  AdminAnnouncementListResponse,
  AdminAnnouncementSummary,
  AttachAnnouncementImageInput,
  CreateAnnouncementImageUploadUrlInput,
  CreateAnnouncementInput,
  ImageUploadUrlResponse,
  UpdateAnnouncementInput,
} from "@/lib/announcements/types";

export const ANNOUNCEMENTS_ADMIN_PATH = "/announcements/admin";

export function announcementPath(announcementId: string) {
  return `${ANNOUNCEMENTS_ADMIN_PATH}/${announcementId}`;
}

function requireToken(token: string, path: string) {
  if (!token) {
    throw new ApiError({
      kind: "unauthorized",
      message: `[announcements] missing Bearer token for ${path}`,
      path,
    });
  }
}

export async function fetchAnnouncements(
  token: string,
): Promise<AdminAnnouncementListResponse> {
  requireToken(token, ANNOUNCEMENTS_ADMIN_PATH);
  const payload = await apiFetch<unknown>(ANNOUNCEMENTS_ADMIN_PATH, { token });
  return parseAdminAnnouncementListResponse(payload, ANNOUNCEMENTS_ADMIN_PATH);
}

export async function fetchAnnouncement(
  token: string,
  announcementId: string,
): Promise<AdminAnnouncementSummary> {
  const path = announcementPath(announcementId);
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, { token });
  return parseAdminAnnouncementSummary(payload, path);
}

export async function createAnnouncement(
  token: string,
  body: CreateAnnouncementInput,
): Promise<AdminAnnouncementSummary> {
  requireToken(token, ANNOUNCEMENTS_ADMIN_PATH);
  const payload = await apiFetch<unknown>(ANNOUNCEMENTS_ADMIN_PATH, {
    token,
    method: "POST",
    body,
  });
  return parseAdminAnnouncementSummary(payload, ANNOUNCEMENTS_ADMIN_PATH);
}

export async function updateAnnouncement(
  token: string,
  announcementId: string,
  body: UpdateAnnouncementInput,
): Promise<AdminAnnouncementSummary> {
  const path = announcementPath(announcementId);
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, {
    token,
    method: "PATCH",
    body,
  });
  return parseAdminAnnouncementSummary(payload, path);
}

export async function publishAnnouncement(
  token: string,
  announcementId: string,
): Promise<AdminAnnouncementSummary> {
  const path = `${announcementPath(announcementId)}/publish`;
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, { token, method: "PATCH" });
  return parseAdminAnnouncementSummary(payload, path);
}

export async function unpublishAnnouncement(
  token: string,
  announcementId: string,
): Promise<AdminAnnouncementSummary> {
  const path = `${announcementPath(announcementId)}/unpublish`;
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, { token, method: "PATCH" });
  return parseAdminAnnouncementSummary(payload, path);
}

export async function createAnnouncementImageUploadUrl(
  token: string,
  announcementId: string,
  body: CreateAnnouncementImageUploadUrlInput,
): Promise<ImageUploadUrlResponse> {
  const path = `${announcementPath(announcementId)}/image-upload-url`;
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, {
    token,
    method: "POST",
    body,
  });
  return parseImageUploadUrlResponse(payload, path);
}

export async function attachAnnouncementImage(
  token: string,
  announcementId: string,
  body: AttachAnnouncementImageInput,
): Promise<AdminAnnouncementSummary> {
  const path = `${announcementPath(announcementId)}/attach-image`;
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, {
    token,
    method: "PATCH",
    body,
  });
  return parseAdminAnnouncementSummary(payload, path);
}
