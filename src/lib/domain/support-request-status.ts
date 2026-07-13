export type SupportRequestStatus = "open" | "reviewed" | "closed";

export const SUPPORT_REQUEST_STATUSES: SupportRequestStatus[] = [
  "open",
  "reviewed",
  "closed",
];

export const SUPPORT_REQUEST_STATUS_LABELS: Record<
  SupportRequestStatus,
  string
> = {
  open: "Open",
  reviewed: "Reviewed",
  closed: "Closed",
};

export function isSupportRequestStatus(
  value: string,
): value is SupportRequestStatus {
  return SUPPORT_REQUEST_STATUSES.includes(value as SupportRequestStatus);
}
