import { apiFetch } from "@/lib/api/api-fetch";
import { ApiError } from "@/lib/api/errors";
import type { DashboardStats } from "@/lib/dashboard/mock-data";
import { parseDashboardStats } from "@/lib/dashboard/parse-dashboard-stats";

/** Nest admin dashboard aggregates. Body shape: ADR 0003 / 0004. */
export const DASHBOARD_STATS_PATH = "/analytics/admin/dashboard";

export async function fetchDashboardStats(
  token: string,
): Promise<DashboardStats> {
  if (!token) {
    throw new ApiError({
      kind: "unauthorized",
      message: `[dashboard] missing Bearer token for ${DASHBOARD_STATS_PATH}`,
      path: DASHBOARD_STATS_PATH,
    });
  }

  const payload = await apiFetch<unknown>(DASHBOARD_STATS_PATH, { token });
  return parseDashboardStats(payload, DASHBOARD_STATS_PATH);
}
