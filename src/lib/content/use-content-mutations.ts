"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import {
  attachPdf,
  attachVideo,
  createChapter,
  createLesson,
  createPdfUploadUrl,
  createUnit,
  createVideoUploadUrl,
  deletePdf,
  deleteVideo,
  updateChapter,
  updateLesson,
  updatePdf,
  updateUnit,
  updateVideo,
} from "@/lib/content/fetch-content";
import { putFileWithProgress } from "@/lib/content/put-file-with-progress";
import type {
  AttachPdfBody,
  AttachVideoBody,
  CreateChapterBody,
  CreateLessonBody,
  CreateUnitBody,
  UpdateChapterBody,
  UpdateLessonBody,
  UpdatePdfBody,
  UpdateUnitBody,
  UpdateVideoBody,
} from "@/lib/content/types";
import {
  MAX_PDF_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  PDF_CONTENT_TYPE,
  VIDEO_CONTENT_TYPE,
} from "@/lib/content/upload-constants";
import { captureAdminEvent } from "@/lib/posthog/capture";
import { adminKeys } from "@/lib/query/keys";
import { toastAdminError } from "@/lib/toast/admin-toast";

async function requireClerkToken(getToken: () => Promise<string | null>) {
  const token = await getToken();
  if (!token) {
    throw new ApiError({
      kind: "unauthorized",
      message: "[content] Clerk session has no token",
      path: "/content/admin",
    });
  }
  return token;
}

function invalidateContent(
  queryClient: ReturnType<typeof useQueryClient>,
  lessonId?: string,
) {
  void queryClient.invalidateQueries({ queryKey: adminKeys.content.tree() });
  void queryClient.invalidateQueries({
    queryKey: [...adminKeys.content.all(), "search"],
  });
  if (lessonId) {
    void queryClient.invalidateQueries({
      queryKey: adminKeys.content.lesson(lessonId),
    });
  }
}

export function useCreateUnit() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateUnitBody) => {
      const token = await requireClerkToken(getToken);
      return createUnit(token, body);
    },
    onSuccess: () => invalidateContent(queryClient),
    onError: (error) => {
      toastAdminError(error);
    },
  });
}

export function useUpdateUnit() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { unitId: string; body: UpdateUnitBody }) => {
      const token = await requireClerkToken(getToken);
      return updateUnit(token, vars.unitId, vars.body);
    },
    onSuccess: () => invalidateContent(queryClient),
    onError: (error) => {
      toastAdminError(error);
    },
  });
}

export function useCreateChapter() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { unitId: string; body: CreateChapterBody }) => {
      const token = await requireClerkToken(getToken);
      return createChapter(token, vars.unitId, vars.body);
    },
    onSuccess: () => invalidateContent(queryClient),
    onError: (error) => {
      toastAdminError(error);
    },
  });
}

export function useUpdateChapter() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      chapterId: string;
      body: UpdateChapterBody;
    }) => {
      const token = await requireClerkToken(getToken);
      return updateChapter(token, vars.chapterId, vars.body);
    },
    onSuccess: () => invalidateContent(queryClient),
    onError: (error) => {
      toastAdminError(error);
    },
  });
}

export function useCreateLesson() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      chapterId: string;
      body: CreateLessonBody;
    }) => {
      const token = await requireClerkToken(getToken);
      return createLesson(token, vars.chapterId, vars.body);
    },
    onSuccess: (lesson) => invalidateContent(queryClient, lesson.id),
    onError: (error) => {
      toastAdminError(error);
    },
  });
}

export function useUpdateLesson() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      lessonId: string;
      body: UpdateLessonBody;
    }) => {
      const token = await requireClerkToken(getToken);
      return updateLesson(token, vars.lessonId, vars.body);
    },
    onSuccess: (lesson) => invalidateContent(queryClient, lesson.id),
    onError: (error) => {
      toastAdminError(error);
    },
  });
}

export function useUpdateVideo() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      videoId: string;
      lessonId: string;
      body: UpdateVideoBody;
    }) => {
      const token = await requireClerkToken(getToken);
      return updateVideo(token, vars.videoId, vars.body);
    },
    onSuccess: (_data, vars) =>
      invalidateContent(queryClient, vars.lessonId),
    onError: (error) => {
      toastAdminError(error);
    },
  });
}

export function useUpdatePdf() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      pdfId: string;
      lessonId: string;
      body: UpdatePdfBody;
    }) => {
      const token = await requireClerkToken(getToken);
      return updatePdf(token, vars.pdfId, vars.body);
    },
    onSuccess: (_data, vars) =>
      invalidateContent(queryClient, vars.lessonId),
    onError: (error) => {
      toastAdminError(error);
    },
  });
}

export function useDeleteVideo() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { videoId: string; lessonId: string }) => {
      const token = await requireClerkToken(getToken);
      return deleteVideo(token, vars.videoId);
    },
    onSuccess: (_data, vars) => {
      captureAdminEvent("admin_content_media_deleted", {
        mediaType: "video",
        lessonId: vars.lessonId,
      });
      invalidateContent(queryClient, vars.lessonId);
    },
    onError: (error) => {
      toastAdminError(error);
    },
  });
}

export function useDeletePdf() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { pdfId: string; lessonId: string }) => {
      const token = await requireClerkToken(getToken);
      return deletePdf(token, vars.pdfId);
    },
    onSuccess: (_data, vars) => {
      captureAdminEvent("admin_content_media_deleted", {
        mediaType: "pdf",
        lessonId: vars.lessonId,
      });
      invalidateContent(queryClient, vars.lessonId);
    },
    onError: (error) => {
      toastAdminError(error);
    },
  });
}

type UploadProgressVars = {
  lessonId: string;
  file: File;
  title?: string;
  sortOrder: number;
  durationSeconds?: number;
  onProgress: (percent: number) => void;
  signal?: AbortSignal;
};

export function useUploadLessonVideo() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: UploadProgressVars) => {
      if (vars.file.type !== VIDEO_CONTENT_TYPE) {
        throw new ApiError({
          kind: "client",
          message: "Video must be video/mp4",
          path: `/content/admin/lessons/${vars.lessonId}/videos/upload-url`,
        });
      }
      if (vars.file.size > MAX_VIDEO_SIZE_BYTES) {
        throw new ApiError({
          kind: "client",
          message: "Video must be 1 GB or smaller",
          path: `/content/admin/lessons/${vars.lessonId}/videos/upload-url`,
        });
      }

      const token = await requireClerkToken(getToken);
      const upload = await createVideoUploadUrl(token, vars.lessonId);
      await putFileWithProgress(
        upload.uploadUrl,
        vars.file,
        VIDEO_CONTENT_TYPE,
        vars.onProgress,
        vars.signal,
      );

      const body: AttachVideoBody = {
        storageKey: upload.storageKey,
        sortOrder: vars.sortOrder,
        ...(vars.title ? { title: vars.title } : {}),
        ...(vars.durationSeconds
          ? { durationSeconds: vars.durationSeconds }
          : {}),
      };
      return attachVideo(token, vars.lessonId, body);
    },
    onSuccess: (_data, vars) => {
      captureAdminEvent("admin_content_media_attached", {
        mediaType: "video",
        lessonId: vars.lessonId,
      });
      invalidateContent(queryClient, vars.lessonId);
    },
    onError: (error) => {
      toastAdminError(error);
    },
  });
}

export function useUploadLessonPdf() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: UploadProgressVars) => {
      if (vars.file.type !== PDF_CONTENT_TYPE) {
        throw new ApiError({
          kind: "client",
          message: "File must be application/pdf",
          path: `/content/admin/lessons/${vars.lessonId}/pdfs/upload-url`,
        });
      }
      if (vars.file.size > MAX_PDF_SIZE_BYTES) {
        throw new ApiError({
          kind: "client",
          message: "PDF must be 50 MB or smaller",
          path: `/content/admin/lessons/${vars.lessonId}/pdfs/upload-url`,
        });
      }

      const token = await requireClerkToken(getToken);
      const upload = await createPdfUploadUrl(token, vars.lessonId);
      await putFileWithProgress(
        upload.uploadUrl,
        vars.file,
        PDF_CONTENT_TYPE,
        vars.onProgress,
        vars.signal,
      );

      const body: AttachPdfBody = {
        storageKey: upload.storageKey,
        sortOrder: vars.sortOrder,
        ...(vars.title ? { title: vars.title } : {}),
      };
      return attachPdf(token, vars.lessonId, body);
    },
    onSuccess: (_data, vars) => {
      captureAdminEvent("admin_content_media_attached", {
        mediaType: "pdf",
        lessonId: vars.lessonId,
      });
      invalidateContent(queryClient, vars.lessonId);
    },
    onError: (error) => {
      toastAdminError(error);
    },
  });
}
