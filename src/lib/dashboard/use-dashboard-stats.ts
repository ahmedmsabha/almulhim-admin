"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import {
  DASHBOARD_STATS_PATH,
  fetchDashboardStats,
} from "@/lib/dashboard/fetch-dashboard-stats";
import { adminKeys } from "@/lib/query/keys";

export function useDashboardStats(options?: { enabled?: boolean }) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const enabled =
    (options?.enabled ?? true) &&
    isLoaded &&
    Boolean(isSignedIn) &&
    Boolean(userId);

  return useQuery({
    queryKey: adminKeys.dashboard.stats(userId ?? "signed-out"),
    enabled,
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new ApiError({
          kind: "unauthorized",
          message: `[dashboard] Clerk session has no token for ${DASHBOARD_STATS_PATH}`,
          path: DASHBOARD_STATS_PATH,
        });
      }
      return fetchDashboardStats(token);
    },
  });
}
