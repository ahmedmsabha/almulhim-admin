import type { SubscriptionStatus } from "@/lib/domain/subscription-status";

/** Nest `SubscriptionPlanSummary` (admin + student subscription responses). */
export type SubscriptionPlanSummary = {
  id: string;
  name: string;
  priceAmount: number;
  currency: string;
  durationDays: number;
};

/** Nest `AdminStudentSummary` on pending queue rows. */
export type AdminStudentSummary = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  region: string;
};

/** One check inside Nest `ReceiptVerificationResult.checks`. */
export type VerificationCheck = {
  passed: boolean;
  detected: string | null;
  reason: string | null;
  expected?: string | null;
  transactionReference?: string | null;
};

/**
 * Nest `ReceiptVerificationResult` v1 stored on `verificationResult`.
 * Null on the subscription until verification runs.
 */
export type ReceiptVerificationResult = {
  version: 1;
  passed: boolean;
  verifiedAt: string;
  aiEnabled: boolean;
  model: string | null;
  error: string | null;
  checks: {
    recipientMatch: VerificationCheck;
    senderMatch: VerificationCheck;
    notDuplicate: VerificationCheck;
  };
  notes: string | null;
};

/** Nest `AdminSubscriptionResponse` from admin subscription endpoints. */
export type AdminSubscriptionResponse = {
  id: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlanSummary;
  student: AdminStudentSummary;
  receiptSenderName: string | null;
  verificationResult: ReceiptVerificationResult | null | unknown;
  verifiedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  expiresAt: string | null;
  suspendedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Nest `AdminSubscriptionListResponse` (`GET /subscriptions/pending`). */
export type AdminSubscriptionListResponse = {
  subscriptions: AdminSubscriptionResponse[];
};

/** Nest `AiVerificationLogItem` from `GET /subscriptions/ai-logs`. */
export type AiVerificationLogItem = {
  subscriptionId: string;
  student: AdminStudentSummary;
  plan: SubscriptionPlanSummary;
  status: SubscriptionStatus;
  verificationResult: ReceiptVerificationResult | null | unknown;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AiVerificationLogListResponse = {
  logs: AiVerificationLogItem[];
};

export type SubscriptionsTab = "pending" | "archived" | "ai_logs";

/** Nest signed receipt URL response (`GET /subscriptions/:id/receipt-url`). */
export type SubscriptionReceiptUrlResponse = {
  url: string;
};

/** Nest `RejectSubscriptionDto` — PATCH `/subscriptions/:id/reject`. */
export type RejectSubscriptionInput = {
  rejectionReason: string;
};

export type SubscriptionReviewDecision = "approve" | "reject" | "suspend";

export type SubscriptionListFilters = {
  q?: string;
};
