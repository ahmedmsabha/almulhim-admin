"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import { adminKeys } from "@/lib/query/keys";
import {
  fetchSubscriptionDetail,
  subscriptionPath,
} from "@/lib/subscriptions/fetch-subscriptions";

export function useSubscriptionDetail(
  id: string,
  options?: { enabled?: boolean },
) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const path = subscriptionPath(id);
  const enabled =
    (options?.enabled ?? true) &&
    Boolean(id) &&
    isLoaded &&
    Boolean(isSignedIn) &&
    Boolean(userId);

  return useQuery({
    queryKey: adminKeys.subscriptions.detail(id),
    enabled,
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new ApiError({
          kind: "unauthorized",
          message: `[subscriptions] Clerk session has no token for ${path}`,
          path,
        });
      }
      return fetchSubscriptionDetail(token, id);
    },
    // Poll while Nest AI verification has not written `verificationResult` yet.
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const pending =
        data.status === "pending_review" || data.status === "pending_approval";
      if (!pending) return false;
      return data.verificationResult == null ? 3000 : false;
    },
  });
}
