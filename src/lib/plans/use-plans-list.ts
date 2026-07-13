"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import { fetchAllPlans, PLANS_ALL_PATH } from "@/lib/plans/fetch-plans";
import { adminKeys } from "@/lib/query/keys";

export function usePlansList(options?: { enabled?: boolean }) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const enabled =
    (options?.enabled ?? true) &&
    isLoaded &&
    Boolean(isSignedIn) &&
    Boolean(userId);

  return useQuery({
    queryKey: adminKeys.plans.list(),
    enabled,
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new ApiError({
          kind: "unauthorized",
          message: `[plans] Clerk session has no token for ${PLANS_ALL_PATH}`,
          path: PLANS_ALL_PATH,
        });
      }
      return fetchAllPlans(token);
    },
  });
}
