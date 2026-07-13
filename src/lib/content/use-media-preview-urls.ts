"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import {
  fetchPdfViewUrl,
  fetchVideoPlaybackUrl,
  pdfViewUrlPath,
  videoPlaybackUrlPath,
} from "@/lib/content/fetch-content";
import { adminKeys } from "@/lib/query/keys";

export function useVideoPlaybackUrl(
  videoId: string,
  options?: { enabled?: boolean },
) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const path = videoPlaybackUrlPath(videoId);
  const enabled =
    (options?.enabled ?? true) &&
    Boolean(videoId) &&
    isLoaded &&
    Boolean(isSignedIn) &&
    Boolean(userId);

  return useQuery({
    queryKey: adminKeys.content.videoPlaybackUrl(videoId),
    enabled,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new ApiError({
          kind: "unauthorized",
          message: `[content] Clerk session has no token for ${path}`,
          path,
        });
      }
      return fetchVideoPlaybackUrl(token, videoId);
    },
  });
}

export function usePdfViewUrl(
  pdfId: string,
  options?: { enabled?: boolean },
) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const path = pdfViewUrlPath(pdfId);
  const enabled =
    (options?.enabled ?? true) &&
    Boolean(pdfId) &&
    isLoaded &&
    Boolean(isSignedIn) &&
    Boolean(userId);

  return useQuery({
    queryKey: adminKeys.content.pdfViewUrl(pdfId),
    enabled,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new ApiError({
          kind: "unauthorized",
          message: `[content] Clerk session has no token for ${path}`,
          path,
        });
      }
      return fetchPdfViewUrl(token, pdfId);
    },
  });
}
