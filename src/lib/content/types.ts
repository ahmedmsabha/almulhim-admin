export type ContentRegion = "gaza" | "west_bank" | "both";

export type LessonAccessLevel = "preview" | "subscriber_only";

export type ContentEntityType = "unit" | "chapter" | "lesson";

export type AdminUnitSummary = {
  id: string;
  title: string;
  description: string | null;
  region: ContentRegion;
  sortOrder: number;
  isPublished: boolean;
  publishedAt: string | null;
};

export type AdminChapterSummary = {
  id: string;
  title: string;
  sortOrder: number;
  isPublished: boolean;
  publishedAt: string | null;
};

export type AdminLessonSummary = {
  id: string;
  title: string;
  sortOrder: number;
  accessLevel: LessonAccessLevel;
  isPublished: boolean;
  publishedAt: string | null;
};

export type AdminVideo = {
  id: string;
  title: string | null;
  durationSeconds: number | null;
  sortOrder: number;
  storageKey: string;
};

export type AdminPdf = {
  id: string;
  title: string | null;
  sortOrder: number;
  storageKey: string;
};

export type AdminLessonDetail = AdminLessonSummary & {
  chapterId: string;
  videos: AdminVideo[];
  pdfs: AdminPdf[];
};

export type AdminContentTreeLesson = AdminLessonSummary;

export type AdminContentTreeChapter = AdminChapterSummary & {
  lessons: AdminContentTreeLesson[];
};

export type AdminContentTreeUnit = AdminUnitSummary & {
  chapters: AdminContentTreeChapter[];
};

export type AdminContentTreeResponse = {
  units: AdminContentTreeUnit[];
};

export type ContentSearchItem = {
  id: string;
  title: string;
  type: ContentEntityType;
  orderIndex: number;
};

export type ContentSearchInput = {
  query: string;
  items: ContentSearchItem[];
};

export type ContentSearchResponse = {
  matchingIds: string[];
};

export type MediaUploadUrlResponse = {
  uploadUrl: string;
  storageKey: string;
  expiresInSeconds: number;
};

export type ContentMediaDeleted = {
  deleted: true;
  id: string;
};

export type AdminChapterDetail = AdminChapterSummary & {
  unitId: string;
  lessons: AdminLessonSummary[];
};

export type CreateUnitBody = {
  title: string;
  description?: string;
  region: ContentRegion;
  sortOrder: number;
};

export type UpdateUnitBody = {
  title?: string;
  description?: string | null;
  region?: ContentRegion;
  sortOrder?: number;
};

export type CreateChapterBody = {
  title: string;
  sortOrder: number;
};

export type UpdateChapterBody = {
  title?: string;
  sortOrder?: number;
};

export type CreateLessonBody = {
  title: string;
  accessLevel: LessonAccessLevel;
  sortOrder: number;
};

export type UpdateLessonBody = {
  title?: string;
  accessLevel?: LessonAccessLevel;
  sortOrder?: number;
};

export type AttachVideoBody = {
  storageKey: string;
  title?: string;
  sortOrder: number;
  durationSeconds?: number;
};

export type AttachPdfBody = {
  storageKey: string;
  title?: string;
  sortOrder: number;
};

export type UpdateVideoBody = {
  title?: string | null;
  sortOrder?: number;
  durationSeconds?: number | null;
};

export type UpdatePdfBody = {
  title?: string | null;
  sortOrder?: number;
};

export const CONTENT_REGION_LABELS: Record<ContentRegion, string> = {
  gaza: "Gaza",
  west_bank: "West Bank",
  both: "Both regions",
};

export const ACCESS_LEVEL_LABELS: Record<LessonAccessLevel, string> = {
  preview: "Preview",
  subscriber_only: "Subscriber",
};
