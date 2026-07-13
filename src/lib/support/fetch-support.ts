import { apiFetch } from "@/lib/api/api-fetch";
import { ApiError } from "@/lib/api/errors";
import {
  parseAdminSupportRequestListResponse,
  parseAdminSupportRequestResponse,
} from "@/lib/support/parse-support";
import type {
  AdminSupportRequestListResponse,
  AdminSupportRequestResponse,
  ReplySupportRequestInput,
  SupportListFilters,
} from "@/lib/support/types";

export const SUPPORT_ADMIN_REQUESTS_PATH = "/support/admin/requests";

export function supportRequestPath(requestId: string) {
  return `${SUPPORT_ADMIN_REQUESTS_PATH}/${requestId}`;
}

export function supportReplyPath(requestId: string) {
  return `${supportRequestPath(requestId)}/reply`;
}

export function supportClosePath(requestId: string) {
  return `${supportRequestPath(requestId)}/close`;
}

export function buildSupportListPath(filters: SupportListFilters = {}): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  const q = filters.q?.trim();
  if (q) params.set("q", q);
  const qs = params.toString();
  return qs
    ? `${SUPPORT_ADMIN_REQUESTS_PATH}?${qs}`
    : SUPPORT_ADMIN_REQUESTS_PATH;
}

function requireToken(token: string, path: string) {
  if (!token) {
    throw new ApiError({
      kind: "unauthorized",
      message: `[support] missing Bearer token for ${path}`,
      path,
    });
  }
}

export async function fetchSupportRequests(
  token: string,
  filters: SupportListFilters = {},
): Promise<AdminSupportRequestListResponse> {
  const path = buildSupportListPath(filters);
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, { token });
  return parseAdminSupportRequestListResponse(payload, path);
}

export async function replySupportRequest(
  token: string,
  requestId: string,
  body: ReplySupportRequestInput,
): Promise<AdminSupportRequestResponse> {
  const path = supportReplyPath(requestId);
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, {
    token,
    method: "PATCH",
    body,
  });
  return parseAdminSupportRequestResponse(payload, path);
}

export async function closeSupportRequest(
  token: string,
  requestId: string,
): Promise<AdminSupportRequestResponse> {
  const path = supportClosePath(requestId);
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, {
    token,
    method: "PATCH",
  });
  return parseAdminSupportRequestResponse(payload, path);
}
