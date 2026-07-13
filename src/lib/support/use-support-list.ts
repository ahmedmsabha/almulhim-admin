"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import {
  SUPPORT_ADMIN_REQUESTS_PATH,
  fetchSupportRequests,
} from "@/lib/support/fetch-support";
import type { SupportListFilters } from "@/lib/support/types";
import { adminKeys } from "@/lib/query/keys";

export function useSupportList(
  filters: SupportListFilters = {},
  options?: { enabled?: boolean },
) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const enabled =
    (options?.enabled ?? true) &&
    isLoaded &&
    Boolean(isSignedIn) &&
    Boolean(userId);

  const status = filters.status;
  const q = filters.q?.trim() || undefined;
  const keyFilters: Record<string, string | undefined> = {
    status,
    q,
  };

  return useQuery({
    queryKey: adminKeys.support.list(keyFilters),
    enabled,
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new ApiError({
          kind: "unauthorized",
          message: `[support] Clerk session has no token for ${SUPPORT_ADMIN_REQUESTS_PATH}`,
          path: SUPPORT_ADMIN_REQUESTS_PATH,
        });
      }
      return fetchSupportRequests(token, { status, q });
    },
  });
}
