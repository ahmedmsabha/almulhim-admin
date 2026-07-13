import type { SupportRequestStatus } from "@/lib/domain/support-request-status";
import type {
  AdminSupportRequestListResponse,
  AdminSupportRequestResponse,
  SupportListFilters,
} from "@/lib/support/types";

export function filterSupportRequests(
  rows: AdminSupportRequestResponse[],
  filters: SupportListFilters = {},
): AdminSupportRequestResponse[] {
  const q = filters.q?.trim().toLowerCase();
  const status = filters.status;

  return rows.filter((row) => {
    if (status && row.status !== status) return false;
    if (!q) return true;
    const haystack =
      `${row.student.fullName} ${row.student.email} ${row.subject}`.toLowerCase();
    return haystack.includes(q);
  });
}

export function buildFilteredSupportList(
  rows: AdminSupportRequestResponse[],
  filters: SupportListFilters = {},
): AdminSupportRequestListResponse {
  return { requests: filterSupportRequests(rows, filters) };
}

export function resolveSupportStatusParam(
  value: string | undefined,
): SupportRequestStatus | undefined {
  if (value === "open" || value === "reviewed" || value === "closed") {
    return value;
  }
  return undefined;
}
