"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import { adminKeys } from "@/lib/query/keys";
import {
  fetchAiVerificationLogs,
  SUBSCRIPTIONS_AI_LOGS_PATH,
} from "@/lib/subscriptions/fetch-subscriptions";

export function useAiVerificationLogs(options?: { enabled?: boolean }) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const enabled =
    (options?.enabled ?? true) &&
    isLoaded &&
    Boolean(isSignedIn) &&
    Boolean(userId);

  return useQuery({
    queryKey: adminKeys.subscriptions.aiLogs(),
    enabled,
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new ApiError({
          kind: "unauthorized",
          message: `[subscriptions] Clerk session has no token for ${SUBSCRIPTIONS_AI_LOGS_PATH}`,
          path: SUBSCRIPTIONS_AI_LOGS_PATH,
        });
      }
      return fetchAiVerificationLogs(token);
    },
  });
}
