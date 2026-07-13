import { apiFetch } from "@/lib/api/api-fetch";
import { ApiError } from "@/lib/api/errors";
import {
  parseAdminSubscriptionListResponse,
  parseAdminSubscriptionResponse,
  parseAiVerificationLogListResponse,
  parseSubscriptionReceiptUrlResponse,
} from "@/lib/subscriptions/parse-subscriptions";
import type {
  AdminSubscriptionListResponse,
  AdminSubscriptionResponse,
  AiVerificationLogListResponse,
  RejectSubscriptionInput,
  SubscriptionReceiptUrlResponse,
} from "@/lib/subscriptions/types";

export const SUBSCRIPTIONS_PENDING_PATH = "/subscriptions/pending";
export const SUBSCRIPTIONS_ARCHIVED_PATH = "/subscriptions/archived";
export const SUBSCRIPTIONS_AI_LOGS_PATH = "/subscriptions/ai-logs";

export function subscriptionPath(id: string) {
  return `/subscriptions/${id}`;
}

export function subscriptionReceiptUrlPath(id: string) {
  return `/subscriptions/${id}/receipt-url`;
}

export function subscriptionApprovePath(id: string) {
  return `/subscriptions/${id}/approve`;
}

export function subscriptionRejectPath(id: string) {
  return `/subscriptions/${id}/reject`;
}

export function subscriptionSuspendPath(id: string) {
  return `/subscriptions/${id}/suspend`;
}

function requireToken(token: string, path: string) {
  if (!token) {
    throw new ApiError({
      kind: "unauthorized",
      message: `[subscriptions] missing Bearer token for ${path}`,
      path,
    });
  }
}

export async function fetchPendingSubscriptions(
  token: string,
): Promise<AdminSubscriptionListResponse> {
  requireToken(token, SUBSCRIPTIONS_PENDING_PATH);
  const payload = await apiFetch<unknown>(SUBSCRIPTIONS_PENDING_PATH, {
    token,
  });
  return parseAdminSubscriptionListResponse(payload, SUBSCRIPTIONS_PENDING_PATH);
}

export async function fetchArchivedSubscriptions(
  token: string,
): Promise<AdminSubscriptionListResponse> {
  requireToken(token, SUBSCRIPTIONS_ARCHIVED_PATH);
  const payload = await apiFetch<unknown>(SUBSCRIPTIONS_ARCHIVED_PATH, {
    token,
  });
  return parseAdminSubscriptionListResponse(
    payload,
    SUBSCRIPTIONS_ARCHIVED_PATH,
  );
}

export async function fetchAiVerificationLogs(
  token: string,
): Promise<AiVerificationLogListResponse> {
  requireToken(token, SUBSCRIPTIONS_AI_LOGS_PATH);
  const payload = await apiFetch<unknown>(SUBSCRIPTIONS_AI_LOGS_PATH, {
    token,
  });
  return parseAiVerificationLogListResponse(
    payload,
    SUBSCRIPTIONS_AI_LOGS_PATH,
  );
}

export async function fetchSubscriptionDetail(
  token: string,
  id: string,
): Promise<AdminSubscriptionResponse> {
  const path = subscriptionPath(id);
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, { token });
  return parseAdminSubscriptionResponse(payload, path);
}

export async function fetchSubscriptionReceiptUrl(
  token: string,
  id: string,
): Promise<SubscriptionReceiptUrlResponse> {
  const path = subscriptionReceiptUrlPath(id);
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, { token });
  return parseSubscriptionReceiptUrlResponse(payload, path);
}

export async function approveSubscription(
  token: string,
  id: string,
): Promise<AdminSubscriptionResponse> {
  const path = subscriptionApprovePath(id);
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, {
    token,
    method: "PATCH",
  });
  return parseAdminSubscriptionResponse(payload, path);
}

export async function rejectSubscription(
  token: string,
  id: string,
  body: RejectSubscriptionInput,
): Promise<AdminSubscriptionResponse> {
  const path = subscriptionRejectPath(id);
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, {
    token,
    method: "PATCH",
    body,
  });
  return parseAdminSubscriptionResponse(payload, path);
}

export async function suspendSubscription(
  token: string,
  id: string,
): Promise<AdminSubscriptionResponse> {
  const path = subscriptionSuspendPath(id);
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, {
    token,
    method: "PATCH",
  });
  return parseAdminSubscriptionResponse(payload, path);
}
