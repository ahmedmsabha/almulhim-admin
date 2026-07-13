export type SubscriptionStatus =
  | "free"
  | "pending_review"
  | "pending_approval"
  | "active"
  | "expired"
  | "rejected"
  | "suspended";

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  free: "Free",
  pending_review: "Pending Review",
  pending_approval: "Pending Approval",
  active: "Active",
  expired: "Expired",
  rejected: "Rejected",
  suspended: "Suspended",
};
