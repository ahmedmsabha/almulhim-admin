import { ApiError } from "@/lib/api/errors";
import { isSupportRequestStatus } from "@/lib/domain/support-request-status";
import type {
  AdminSupportRequestListResponse,
  AdminSupportRequestResponse,
  AdminSupportStudentSummary,
} from "@/lib/support/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRegion(value: unknown): value is AdminSupportStudentSummary["region"] {
  return value === "gaza" || value === "west_bank";
}

export function isAdminSupportStudentSummary(
  value: unknown,
): value is AdminSupportStudentSummary {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string") return false;
  if (typeof value.fullName !== "string") return false;
  if (typeof value.email !== "string") return false;
  if (typeof value.phoneNumber !== "string") return false;
  if (!isRegion(value.region)) return false;
  return true;
}

export function isAdminSupportRequestResponse(
  value: unknown,
): value is AdminSupportRequestResponse {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string") return false;
  if (typeof value.subject !== "string") return false;
  if (typeof value.message !== "string") return false;
  if (
    typeof value.status !== "string" ||
    !isSupportRequestStatus(value.status)
  ) {
    return false;
  }
  if (value.adminReply !== null && typeof value.adminReply !== "string") {
    return false;
  }
  if (value.reviewedAt !== null && typeof value.reviewedAt !== "string") {
    return false;
  }
  if (value.closedAt !== null && typeof value.closedAt !== "string") {
    return false;
  }
  if (typeof value.createdAt !== "string") return false;
  if (!isAdminSupportStudentSummary(value.student)) return false;
  return true;
}

export function isAdminSupportRequestListResponse(
  value: unknown,
): value is AdminSupportRequestListResponse {
  if (!isRecord(value)) return false;
  if (!Array.isArray(value.requests)) return false;
  return value.requests.every(isAdminSupportRequestResponse);
}

export function parseAdminSupportRequestResponse(
  value: unknown,
  path: string,
): AdminSupportRequestResponse {
  if (!isAdminSupportRequestResponse(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[support] invalid AdminSupportRequestResponse from ${path}`,
      path,
    });
  }
  return value;
}

export function parseAdminSupportRequestListResponse(
  value: unknown,
  path: string,
): AdminSupportRequestListResponse {
  if (!isAdminSupportRequestListResponse(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[support] invalid AdminSupportRequestListResponse from ${path}`,
      path,
    });
  }
  return value;
}
