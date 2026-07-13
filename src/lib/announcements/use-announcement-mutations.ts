"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import {
  ANNOUNCEMENTS_ADMIN_PATH,
  announcementPath,
  attachAnnouncementImage,
  createAnnouncement,
  createAnnouncementImageUploadUrl,
  publishAnnouncement,
  unpublishAnnouncement,
  updateAnnouncement,
} from "@/lib/announcements/fetch-announcements";
import {
  isAnnouncementImageContentType,
  MAX_ANNOUNCEMENT_IMAGE_SIZE_BYTES,
} from "@/lib/announcements/upload-constants";
import type {
  AdminAnnouncementListResponse,
  AdminAnnouncementSummary,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from "@/lib/announcements/types";
import { putFileWithProgress } from "@/lib/content/put-file-with-progress";
import { adminKeys } from "@/lib/query/keys";
import { toastAdminError } from "@/lib/toast/admin-toast";

function upsertAnnouncementInList(
  current: AdminAnnouncementListResponse | undefined,
  announcement: AdminAnnouncementSummary,
): AdminAnnouncementListResponse {
  if (!current) {
    return { announcements: [announcement] };
  }
  const index = current.announcements.findIndex(
    (item) => item.id === announcement.id,
  );
  if (index === -1) {
    return { announcements: [announcement, ...current.announcements] };
  }
  const announcements = [...current.announcements];
  announcements[index] = announcement;
  return { announcements };
}

function writeAnnouncementCache(
  queryClient: QueryClient,
  announcement: AdminAnnouncementSummary,
) {
  queryClient.setQueryData<AdminAnnouncementListResponse>(
    adminKeys.announcements.list(),
    (current) => upsertAnnouncementInList(current, announcement),
  );
  queryClient.setQueryData(
    adminKeys.announcements.detail(announcement.id),
    announcement,
  );
  void queryClient.invalidateQueries({
    queryKey: adminKeys.announcements.all(),
  });
}

async function requireClerkToken(
  getToken: () => Promise<string | null>,
  path: string,
) {
  const token = await getToken();
  if (!token) {
    throw new ApiError({
      kind: "unauthorized",
      message: `[announcements] Clerk session has no token for ${path}`,
      path,
    });
  }
  return token;
}

export function useCreateAnnouncement() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateAnnouncementInput) => {
      const token = await requireClerkToken(getToken, ANNOUNCEMENTS_ADMIN_PATH);
      return createAnnouncement(token, body);
    },
    onSuccess: (announcement) => {
      writeAnnouncementCache(queryClient, announcement);
    },
    onError: (error) => {
      toastAdminError(error);
    },
  });
}

export function useUpdateAnnouncement() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      announcementId: string;
      body: UpdateAnnouncementInput;
    }) => {
      const path = announcementPath(vars.announcementId);
      const token = await requireClerkToken(getToken, path);
      return updateAnnouncement(token, vars.announcementId, vars.body);
    },
    onSuccess: (announcement) => {
      writeAnnouncementCache(queryClient, announcement);
    },
    onError: (error) => {
      toastAdminError(error);
    },
  });
}

export function useAnnouncementPublish() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { id: string; publish: boolean }) => {
      const path = vars.publish
        ? `${announcementPath(vars.id)}/publish`
        : `${announcementPath(vars.id)}/unpublish`;
      const token = await requireClerkToken(getToken, path);
      return vars.publish
        ? publishAnnouncement(token, vars.id)
        : unpublishAnnouncement(token, vars.id);
    },
    onSuccess: (announcement) => {
      writeAnnouncementCache(queryClient, announcement);
    },
    onError: (error) => {
      toastAdminError(error);
    },
  });
}

type UploadImageVars = {
  announcementId: string;
  file: File;
  onProgress: (percent: number) => void;
  signal?: AbortSignal;
};

export function useUploadAnnouncementImage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: UploadImageVars) => {
      const path = `${announcementPath(vars.announcementId)}/image-upload-url`;
      if (!isAnnouncementImageContentType(vars.file.type)) {
        throw new ApiError({
          kind: "client",
          message: "Image must be JPEG, PNG, or WebP",
          path,
        });
      }
      if (vars.file.size > MAX_ANNOUNCEMENT_IMAGE_SIZE_BYTES) {
        throw new ApiError({
          kind: "client",
          message: "Image must be 5 MB or smaller",
          path,
        });
      }

      const token = await requireClerkToken(getToken, path);
      const upload = await createAnnouncementImageUploadUrl(
        token,
        vars.announcementId,
        { contentType: vars.file.type },
      );
      await putFileWithProgress(
        upload.uploadUrl,
        vars.file,
        vars.file.type,
        vars.onProgress,
        vars.signal,
        "announcements",
      );
      return attachAnnouncementImage(token, vars.announcementId, {
        storageKey: upload.storageKey,
      });
    },
    onSuccess: (announcement) => {
      writeAnnouncementCache(queryClient, announcement);
    },
    onError: (error) => {
      toastAdminError(error);
    },
  });
}
