import { ApiError } from "@/lib/api/errors";
import { SUBSCRIPTION_STATUS_LABELS } from "@/lib/domain/subscription-status";
import type { SubscriptionStatus } from "@/lib/domain/subscription-status";
import type {
  AdminStudentSummary,
  AdminSubscriptionListResponse,
  AdminSubscriptionResponse,
  AiVerificationLogItem,
  AiVerificationLogListResponse,
  SubscriptionPlanSummary,
  SubscriptionReceiptUrlResponse,
} from "@/lib/subscriptions/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSubscriptionStatus(value: unknown): value is SubscriptionStatus {
  return typeof value === "string" && value in SUBSCRIPTION_STATUS_LABELS;
}

function isPlanSummary(value: unknown): value is SubscriptionPlanSummary {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.priceAmount === "number" &&
    typeof value.currency === "string" &&
    typeof value.durationDays === "number"
  );
}

function isStudentSummary(value: unknown): value is AdminStudentSummary {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.fullName === "string" &&
    typeof value.email === "string" &&
    typeof value.phoneNumber === "string" &&
    typeof value.region === "string"
  );
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

export function isAdminSubscriptionResponse(
  value: unknown,
): value is AdminSubscriptionResponse {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string") return false;
  if (!isSubscriptionStatus(value.status)) return false;
  if (!isPlanSummary(value.plan)) return false;
  if (!isStudentSummary(value.student)) return false;
  if (!isNullableString(value.receiptSenderName)) return false;
  if (!("verificationResult" in value)) return false;
  if (!isNullableString(value.verifiedAt)) return false;
  if (!isNullableString(value.approvedAt)) return false;
  if (!isNullableString(value.rejectedAt)) return false;
  if (!isNullableString(value.rejectionReason)) return false;
  if (!isNullableString(value.expiresAt)) return false;
  if (!isNullableString(value.suspendedAt)) return false;
  if (typeof value.createdAt !== "string") return false;
  if (typeof value.updatedAt !== "string") return false;
  return true;
}

export function isAdminSubscriptionListResponse(
  value: unknown,
): value is AdminSubscriptionListResponse {
  if (!isRecord(value)) return false;
  if (!Array.isArray(value.subscriptions)) return false;
  return value.subscriptions.every(isAdminSubscriptionResponse);
}

export function isAiVerificationLogItem(
  value: unknown,
): value is AiVerificationLogItem {
  if (!isRecord(value)) return false;
  if (typeof value.subscriptionId !== "string") return false;
  if (!isStudentSummary(value.student)) return false;
  if (!isPlanSummary(value.plan)) return false;
  if (!isSubscriptionStatus(value.status)) return false;
  if (!("verificationResult" in value)) return false;
  if (!isNullableString(value.verifiedAt)) return false;
  if (typeof value.createdAt !== "string") return false;
  if (typeof value.updatedAt !== "string") return false;
  return true;
}

export function isAiVerificationLogListResponse(
  value: unknown,
): value is AiVerificationLogListResponse {
  if (!isRecord(value)) return false;
  if (!Array.isArray(value.logs)) return false;
  return value.logs.every(isAiVerificationLogItem);
}

export function isSubscriptionReceiptUrlResponse(
  value: unknown,
): value is SubscriptionReceiptUrlResponse {
  if (!isRecord(value)) return false;
  if (typeof value.url === "string" && value.url.trim()) return true;
  if (typeof value.receiptUrl === "string" && value.receiptUrl.trim()) {
    return true;
  }
  if (typeof value.signedUrl === "string" && value.signedUrl.trim()) {
    return true;
  }
  return false;
}

export function parseAdminSubscriptionResponse(
  value: unknown,
  path: string,
): AdminSubscriptionResponse {
  if (!isAdminSubscriptionResponse(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[subscriptions] invalid AdminSubscriptionResponse from ${path}`,
      path,
    });
  }
  return value;
}

export function parseAdminSubscriptionListResponse(
  value: unknown,
  path: string,
): AdminSubscriptionListResponse {
  if (!isAdminSubscriptionListResponse(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[subscriptions] invalid AdminSubscriptionListResponse from ${path}`,
      path,
    });
  }
  return value;
}

export function parseAiVerificationLogListResponse(
  value: unknown,
  path: string,
): AiVerificationLogListResponse {
  if (!isAiVerificationLogListResponse(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[subscriptions] invalid AiVerificationLogListResponse from ${path}`,
      path,
    });
  }
  return value;
}

export function parseSubscriptionReceiptUrlResponse(
  value: unknown,
  path: string,
): SubscriptionReceiptUrlResponse {
  if (!isSubscriptionReceiptUrlResponse(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[subscriptions] invalid receipt URL response from ${path}`,
      path,
    });
  }
  const record = value as Record<string, unknown>;
  const url =
    (typeof record.url === "string" && record.url) ||
    (typeof record.receiptUrl === "string" && record.receiptUrl) ||
    (typeof record.signedUrl === "string" && record.signedUrl) ||
    "";
  return { url };
}
