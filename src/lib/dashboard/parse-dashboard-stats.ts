import { ApiError } from "@/lib/api/errors";
import type { DashboardStats } from "@/lib/dashboard/mock-data";
import type { Region } from "@/lib/domain/region";
import { REGIONS } from "@/lib/domain/region";

const REGION_SET = new Set<Region>(REGIONS);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRegion(value: unknown): value is Region {
  return typeof value === "string" && REGION_SET.has(value as Region);
}

export function isDashboardStats(value: unknown): value is DashboardStats {
  if (!isRecord(value)) return false;

  if (typeof value.totalStudents !== "number") return false;
  if (typeof value.activeSubscriptions !== "number") return false;
  if (typeof value.pendingApprovals !== "number") return false;
  if (typeof value.openSupportTickets !== "number") return false;

  if (!Array.isArray(value.subscriptionGrowth)) return false;
  for (const point of value.subscriptionGrowth) {
    if (!isRecord(point)) return false;
    if (typeof point.date !== "string") return false;
    if (typeof point.count !== "number") return false;
  }

  if (!Array.isArray(value.regionDistribution)) return false;
  for (const row of value.regionDistribution) {
    if (!isRecord(row)) return false;
    if (!isRegion(row.region)) return false;
    if (typeof row.count !== "number") return false;
  }

  if (!Array.isArray(value.recentActivity)) return false;
  for (const row of value.recentActivity) {
    if (!isRecord(row)) return false;
    if (typeof row.id !== "string") return false;
    if (typeof row.studentName !== "string") return false;
    if (typeof row.action !== "string") return false;
    if (typeof row.timestamp !== "string") return false;
  }

  return true;
}

export function parseDashboardStats(
  value: unknown,
  path: string,
): DashboardStats {
  if (!isDashboardStats(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[dashboard] invalid DashboardStats payload from ${path}`,
      path,
    });
  }
  return value;
}
