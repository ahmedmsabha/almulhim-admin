"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import {
  ANNOUNCEMENTS_ADMIN_PATH,
  fetchAnnouncements,
} from "@/lib/announcements/fetch-announcements";
import { adminKeys } from "@/lib/query/keys";

export function useAnnouncementsList(options?: { enabled?: boolean }) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const enabled =
    (options?.enabled ?? true) &&
    isLoaded &&
    Boolean(isSignedIn) &&
    Boolean(userId);

  return useQuery({
    queryKey: adminKeys.announcements.list(),
    enabled,
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new ApiError({
          kind: "unauthorized",
          message: `[announcements] Clerk session has no token for ${ANNOUNCEMENTS_ADMIN_PATH}`,
          path: ANNOUNCEMENTS_ADMIN_PATH,
        });
      }
      return fetchAnnouncements(token);
    },
  });
}
