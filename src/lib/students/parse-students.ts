import { ApiError } from "@/lib/api/errors";
import type { Region } from "@/lib/domain/region";
import { REGIONS } from "@/lib/domain/region";
import type { SubscriptionStatus } from "@/lib/domain/subscription-status";
import { SUBSCRIPTION_STATUS_LABELS } from "@/lib/domain/subscription-status";
import type {
  DeleteStudentResponse,
  StudentListItem,
  StudentListResponse,
} from "@/lib/students/types";

const REGION_SET = new Set<Region>(REGIONS);
const STATUS_SET = new Set<string>(Object.keys(SUBSCRIPTION_STATUS_LABELS));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRegion(value: unknown): value is Region {
  return typeof value === "string" && REGION_SET.has(value as Region);
}

function isSubscriptionStatus(value: unknown): value is SubscriptionStatus {
  return typeof value === "string" && STATUS_SET.has(value);
}

export function isStudentListItem(value: unknown): value is StudentListItem {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string") return false;
  if (typeof value.clerkId !== "string" || !value.clerkId.trim()) return false;
  if (typeof value.fullName !== "string") return false;
  if (typeof value.email !== "string") return false;
  if (value.phone !== null && typeof value.phone !== "string") return false;
  if (value.telegram !== null && typeof value.telegram !== "string") {
    return false;
  }
  if (!isRegion(value.region)) return false;
  if (!isSubscriptionStatus(value.subscriptionStatus)) return false;
  if (value.deactivatedAt !== null && typeof value.deactivatedAt !== "string") {
    return false;
  }
  return true;
}

export function isDeleteStudentResponse(
  value: unknown,
): value is DeleteStudentResponse {
  if (!isRecord(value)) return false;
  return value.deleted === true && typeof value.userId === "string";
}

export function isStudentListResponse(
  value: unknown,
): value is StudentListResponse {
  if (!isRecord(value)) return false;
  if (!Array.isArray(value.students)) return false;
  if (typeof value.total !== "number") return false;
  if (typeof value.page !== "number") return false;
  if (typeof value.pageSize !== "number") return false;
  return value.students.every(isStudentListItem);
}

export function parseStudentListItem(
  value: unknown,
  path: string,
): StudentListItem {
  if (!isStudentListItem(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[students] invalid StudentListItem from ${path}`,
      path,
    });
  }
  return value;
}

export function parseStudentListResponse(
  value: unknown,
  path: string,
): StudentListResponse {
  if (!isStudentListResponse(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[students] invalid StudentListResponse from ${path}`,
      path,
    });
  }
  return value;
}

export function parseDeleteStudentResponse(
  value: unknown,
  path: string,
): DeleteStudentResponse {
  if (!isDeleteStudentResponse(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[students] invalid DeleteStudentResponse from ${path}`,
      path,
    });
  }
  return value;
}
