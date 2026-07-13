"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import {
  contentAdminLessonPath,
  fetchContentLesson,
} from "@/lib/content/fetch-content";
import { adminKeys } from "@/lib/query/keys";

export function useContentLesson(lessonId: string | null) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();

  return useQuery({
    queryKey: adminKeys.content.lesson(lessonId ?? "none"),
    enabled:
      Boolean(lessonId) &&
      isLoaded &&
      Boolean(isSignedIn) &&
      Boolean(userId),
    queryFn: async () => {
      if (!lessonId) {
        throw new ApiError({
          kind: "client",
          message: "[content] lessonId required",
          path: "/content/admin/lessons",
        });
      }
      const path = contentAdminLessonPath(lessonId);
      const token = await getToken();
      if (!token) {
        throw new ApiError({
          kind: "unauthorized",
          message: `[content] Clerk session has no token for ${path}`,
          path,
        });
      }
      return fetchContentLesson(token, lessonId);
    },
  });
}
