import type { ContentRegion } from "@/lib/content/types";

export type AdminAnnouncementSummary = {
  id: string;
  title: string;
  body: string;
  region: ContentRegion;
  imageStorageKey: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminAnnouncementListResponse = {
  announcements: AdminAnnouncementSummary[];
};

export type CreateAnnouncementInput = {
  title: string;
  body: string;
  region: ContentRegion;
};

export type UpdateAnnouncementInput = {
  title?: string;
  body?: string;
  region?: ContentRegion;
};

export type AnnouncementImageContentType =
  | "image/jpeg"
  | "image/png"
  | "image/webp";

export type CreateAnnouncementImageUploadUrlInput = {
  contentType: AnnouncementImageContentType;
};

export type AttachAnnouncementImageInput = {
  storageKey: string;
};

export type ImageUploadUrlResponse = {
  uploadUrl: string;
  storageKey: string;
  expiresInSeconds: number;
};
