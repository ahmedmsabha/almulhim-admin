import {
  filterSubscriptions,
} from "@/lib/subscriptions/filter-subscriptions";
import type {
  AdminSubscriptionListResponse,
  AdminSubscriptionResponse,
  SubscriptionListFilters,
} from "@/lib/subscriptions/types";

export type {
  AdminStudentSummary,
  AdminSubscriptionListResponse,
  AdminSubscriptionResponse,
  SubscriptionListFilters,
  SubscriptionPlanSummary,
} from "@/lib/subscriptions/types";

export { filterSubscriptions } from "@/lib/subscriptions/filter-subscriptions";

const PLAN_YEARLY = {
  id: "plan_yearly_001",
  name: "Premium Yearly",
  priceAmount: 49900,
  currency: "ILS",
  durationDays: 365,
} as const;

const PLAN_MONTHLY = {
  id: "plan_monthly_001",
  name: "Standard Monthly",
  priceAmount: 4900,
  currency: "ILS",
  durationDays: 30,
} as const;

const PLAN_TERM = {
  id: "plan_term_001",
  name: "Term Pass",
  priceAmount: 14900,
  currency: "ILS",
  durationDays: 90,
} as const;

function isoDaysAgo(days: number, hour = 12, minute = 0): string {
  const date = new Date("2026-07-12T12:00:00.000Z");
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(hour, minute, 0, 0);
  return date.toISOString();
}

function baseRow(
  partial: Pick<
    AdminSubscriptionResponse,
    | "id"
    | "status"
    | "plan"
    | "student"
    | "receiptSenderName"
    | "verificationResult"
    | "verifiedAt"
    | "createdAt"
  >,
): AdminSubscriptionResponse {
  return {
    approvedAt: null,
    rejectedAt: null,
    rejectionReason: null,
    expiresAt: null,
    suspendedAt: null,
    updatedAt: partial.createdAt,
    ...partial,
  };
}

/** Pending workload seeds (`pending_review` | `pending_approval` only). */
export const mockPendingSubscriptions: AdminSubscriptionResponse[] = [
  baseRow({
    id: "sub_pending_001",
    status: "pending_approval",
    plan: PLAN_YEARLY,
    student: {
      id: "user_ahmad_101",
      fullName: "Ahmad Al-Masri",
      email: "ahmad.masri@student.ps",
      phoneNumber: "+970 59 441 2201",
      region: "gaza",
    },
    receiptSenderName: "Ahmad Al-Masri",
    verificationResult: {
      outcome: "pass",
      summary: "Pass - Document matches",
    },
    verifiedAt: isoDaysAgo(0, 14, 5),
    createdAt: isoDaysAgo(0, 14, 20),
  }),
  baseRow({
    id: "sub_pending_002",
    status: "pending_review",
    plan: PLAN_MONTHLY,
    student: {
      id: "user_sara_102",
      fullName: "Sara Abu Khader",
      email: "sara.abukhader@student.ps",
      phoneNumber: "+970 59 902 4412",
      region: "west_bank",
    },
    receiptSenderName: "Sara Abu Khader",
    verificationResult: {
      outcome: "warn",
      summary: "AI: Blurred image detected",
    },
    verifiedAt: isoDaysAgo(0, 12, 50),
    createdAt: isoDaysAgo(0, 12, 45),
  }),
  baseRow({
    id: "sub_pending_003",
    status: "pending_approval",
    plan: PLAN_TERM,
    student: {
      id: "user_leila_103",
      fullName: "Leila Mansour",
      email: "leila.mansour@student.ps",
      phoneNumber: "+970 59 118 3340",
      region: "gaza",
    },
    receiptSenderName: "L. Mansour",
    verificationResult: {
      outcome: "pass",
      summary: "Amount and sender match plan",
    },
    verifiedAt: isoDaysAgo(1, 9, 10),
    createdAt: isoDaysAgo(1, 9, 0),
  }),
  baseRow({
    id: "sub_pending_004",
    status: "pending_review",
    plan: PLAN_MONTHLY,
    student: {
      id: "user_yousef_104",
      fullName: "Yousef Qassim",
      email: "yousef.qassim@student.ps",
      phoneNumber: "+970 56 778 9012",
      region: "west_bank",
    },
    receiptSenderName: null,
    verificationResult: null,
    verifiedAt: null,
    createdAt: isoDaysAgo(1, 16, 30),
  }),
  baseRow({
    id: "sub_pending_005",
    status: "pending_approval",
    plan: PLAN_YEARLY,
    student: {
      id: "user_mariam_105",
      fullName: "Mariam Khalil",
      email: "mariam.khalil@student.ps",
      phoneNumber: "+970 59 334 5566",
      region: "gaza",
    },
    receiptSenderName: "Mariam Khalil",
    verificationResult: {
      outcome: "fail",
      summary: "Possible duplicate transaction reference",
    },
    verifiedAt: isoDaysAgo(2, 11, 0),
    createdAt: isoDaysAgo(2, 10, 45),
  }),
  baseRow({
    id: "sub_pending_006",
    status: "pending_approval",
    plan: PLAN_MONTHLY,
    student: {
      id: "user_omar_106",
      fullName: "Omar Nasser",
      email: "omar.nasser@student.ps",
      phoneNumber: "+970 56 220 1188",
      region: "west_bank",
    },
    receiptSenderName: "Omar Nasser",
    verificationResult: {
      outcome: "pass",
      summary: "Pass - Document matches",
    },
    verifiedAt: isoDaysAgo(2, 18, 20),
    createdAt: isoDaysAgo(2, 18, 5),
  }),
  baseRow({
    id: "sub_pending_007",
    status: "pending_review",
    plan: PLAN_TERM,
    student: {
      id: "user_hala_107",
      fullName: "Hala Barghouti",
      email: "hala.barghouti@student.ps",
      phoneNumber: "+970 59 887 1100",
      region: "west_bank",
    },
    receiptSenderName: "Hala B.",
    verificationResult: {
      outcome: "warn",
      summary: "Sender name partially matches profile",
    },
    verifiedAt: isoDaysAgo(3, 8, 15),
    createdAt: isoDaysAgo(3, 8, 0),
  }),
  baseRow({
    id: "sub_pending_008",
    status: "pending_approval",
    plan: PLAN_YEARLY,
    student: {
      id: "user_rania_108",
      fullName: "Rania Odeh",
      email: "rania.odeh@student.ps",
      phoneNumber: "+970 56 441 9090",
      region: "gaza",
    },
    receiptSenderName: "Rania Odeh",
    verificationResult: {
      outcome: "pass",
      summary: "Bank slip clear, amount matches",
    },
    verifiedAt: isoDaysAgo(3, 15, 40),
    createdAt: isoDaysAgo(3, 15, 22),
  }),
  baseRow({
    id: "sub_pending_009",
    status: "pending_review",
    plan: PLAN_MONTHLY,
    student: {
      id: "user_kareem_109",
      fullName: "Kareem Haddad",
      email: "kareem.haddad@student.ps",
      phoneNumber: "+970 59 220 3344",
      region: "west_bank",
    },
    receiptSenderName: null,
    verificationResult: null,
    verifiedAt: null,
    createdAt: isoDaysAgo(4, 7, 50),
  }),
  baseRow({
    id: "sub_pending_010",
    status: "pending_approval",
    plan: PLAN_TERM,
    student: {
      id: "user_nour_110",
      fullName: "Nour Saleh",
      email: "nour.saleh@student.ps",
      phoneNumber: "+970 56 998 2211",
      region: "gaza",
    },
    receiptSenderName: "Nour Saleh",
    verificationResult: {
      outcome: "fail",
      summary: "Amount below selected plan price",
    },
    verifiedAt: isoDaysAgo(4, 13, 10),
    createdAt: isoDaysAgo(4, 12, 55),
  }),
];

export function buildSubscriptionList(
  filters: SubscriptionListFilters = {},
): AdminSubscriptionListResponse {
  return {
    subscriptions: filterSubscriptions(mockPendingSubscriptions, filters),
  };
}

export const emptySubscriptionList: AdminSubscriptionListResponse = {
  subscriptions: [],
};
