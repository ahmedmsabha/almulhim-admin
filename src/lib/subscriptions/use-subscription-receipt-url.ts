"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import { adminKeys } from "@/lib/query/keys";
import {
  fetchSubscriptionReceiptUrl,
  subscriptionReceiptUrlPath,
} from "@/lib/subscriptions/fetch-subscriptions";

export function useSubscriptionReceiptUrl(
  id: string,
  options?: { enabled?: boolean },
) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const path = subscriptionReceiptUrlPath(id);
  const enabled =
    (options?.enabled ?? true) &&
    Boolean(id) &&
    isLoaded &&
    Boolean(isSignedIn) &&
    Boolean(userId);

  return useQuery({
    queryKey: adminKeys.subscriptions.receiptUrl(id),
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
      return fetchSubscriptionReceiptUrl(token, id);
    },
  });
}
