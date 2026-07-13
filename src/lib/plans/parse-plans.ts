import { ApiError } from "@/lib/api/errors";
import type {
  AdminPlan,
  AdminPlanListResponse,
} from "@/lib/plans/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isAdminPlan(value: unknown): value is AdminPlan {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string") return false;
  if (typeof value.name !== "string") return false;
  if (value.description !== null && typeof value.description !== "string") {
    return false;
  }
  if (typeof value.priceAmount !== "number") return false;
  if (typeof value.currency !== "string") return false;
  if (typeof value.durationDays !== "number") return false;
  if (typeof value.sortOrder !== "number") return false;
  if (typeof value.isActive !== "boolean") return false;
  if (typeof value.createdAt !== "string") return false;
  if (typeof value.updatedAt !== "string") return false;
  return true;
}

export function isAdminPlanListResponse(
  value: unknown,
): value is AdminPlanListResponse {
  if (!isRecord(value)) return false;
  if (!Array.isArray(value.plans)) return false;
  return value.plans.every(isAdminPlan);
}

export function parseAdminPlan(value: unknown, path: string): AdminPlan {
  if (!isAdminPlan(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[plans] invalid AdminPlan from ${path}`,
      path,
    });
  }
  return value;
}

export function parseAdminPlanListResponse(
  value: unknown,
  path: string,
): AdminPlanListResponse {
  if (!isAdminPlanListResponse(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[plans] invalid AdminPlanListResponse from ${path}`,
      path,
    });
  }
  return value;
}
