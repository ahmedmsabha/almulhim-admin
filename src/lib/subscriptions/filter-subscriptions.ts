import type {
  AdminSubscriptionListResponse,
  AdminSubscriptionResponse,
  SubscriptionListFilters,
} from "@/lib/subscriptions/types";

export function filterSubscriptions(
  rows: AdminSubscriptionResponse[],
  filters: SubscriptionListFilters = {},
): AdminSubscriptionResponse[] {
  const q = filters.q?.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) => {
    const haystack = `${row.student.fullName} ${row.student.email}`.toLowerCase();
    return haystack.includes(q);
  });
}

export function buildFilteredSubscriptionList(
  rows: AdminSubscriptionResponse[],
  filters: SubscriptionListFilters = {},
): AdminSubscriptionListResponse {
  return { subscriptions: filterSubscriptions(rows, filters) };
}
