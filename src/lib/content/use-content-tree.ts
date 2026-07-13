"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import {
  CONTENT_ADMIN_TREE_PATH,
  fetchContentTree,
} from "@/lib/content/fetch-content";
import { adminKeys } from "@/lib/query/keys";

export function useContentTree() {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();

  return useQuery({
    queryKey: adminKeys.content.tree(),
    enabled: isLoaded && Boolean(isSignedIn) && Boolean(userId),
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new ApiError({
          kind: "unauthorized",
          message: `[content] Clerk session has no token for ${CONTENT_ADMIN_TREE_PATH}`,
          path: CONTENT_ADMIN_TREE_PATH,
        });
      }
      return fetchContentTree(token);
    },
  });
}
