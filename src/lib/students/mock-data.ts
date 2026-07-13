/**
 * Preview / design fixtures for students list.
 * Live path: `fetchStudentsList` + Nest GET /users (ADR 0006).
 */

import type { Region } from "@/lib/domain/region";
import type { SubscriptionStatus } from "@/lib/domain/subscription-status";
import type {
  StudentListItem,
  StudentListResponse,
} from "@/lib/students/types";
import { STUDENT_PAGE_SIZE } from "@/lib/students/types";

export type {
  StudentListItem,
  StudentListQuery,
  StudentListResponse,
} from "@/lib/students/types";
export { STUDENT_PAGE_SIZE } from "@/lib/students/types";

export const mockStudents: StudentListItem[] = [
  {
    id: "user_sara_001",
    clerkId: "clerk_user_sara_001",
    fullName: "Sara Abu Khader",
    email: "sara.abukhader@student.ps",
    phone: "+970 59 902 4412",
    telegram: "@sara_abukhader",
    region: "gaza",
    subscriptionStatus: "active",
    deactivatedAt: null,
  },
  {
    id: "user_ahmed_002",
    clerkId: "clerk_user_ahmed_002",
    fullName: "Ahmed Al-Sayed",
    email: "ahmed.alsayed@student.ps",
    phone: "+970 56 441 2201",
    telegram: "@ahmed_alsayed",
    region: "west_bank",
    subscriptionStatus: "pending_approval",
    deactivatedAt: null,
  },
  {
    id: "user_leila_003",
    clerkId: "clerk_user_leila_003",
    fullName: "Leila Mansour",
    email: "leila.mansour@student.ps",
    phone: "+970 59 118 3340",
    telegram: "@leila_m",
    region: "gaza",
    subscriptionStatus: "pending_review",
    deactivatedAt: null,
  },
  {
    id: "user_yousef_004",
    clerkId: "clerk_user_yousef_004",
    fullName: "Yousef Qassim",
    email: "yousef.qassim@student.ps",
    phone: "+970 56 778 9012",
    telegram: null,
    region: "west_bank",
    subscriptionStatus: "expired",
    deactivatedAt: null,
  },
  {
    id: "user_mariam_005",
    clerkId: "clerk_user_mariam_005",
    fullName: "Mariam Khalil",
    email: "mariam.khalil@student.ps",
    phone: "+970 59 334 5566",
    telegram: "@mariam_k",
    region: "gaza",
    subscriptionStatus: "free",
    deactivatedAt: null,
  },
  {
    id: "user_omar_006",
    clerkId: "clerk_user_omar_006",
    fullName: "Omar Nasser",
    email: "omar.nasser@student.ps",
    phone: "+970 56 220 1188",
    telegram: "@omar_nasser",
    region: "west_bank",
    subscriptionStatus: "rejected",
    deactivatedAt: null,
  },
  {
    id: "user_hala_007",
    clerkId: "clerk_user_hala_007",
    fullName: "Hala Barghouti",
    email: "hala.barghouti@student.ps",
    phone: null,
    telegram: "@hala_b",
    region: "west_bank",
    subscriptionStatus: "suspended",
    deactivatedAt: null,
  },
  {
    id: "user_rami_008",
    clerkId: "clerk_user_rami_008",
    fullName: "Rami Hijazi",
    email: "rami.hijazi@student.ps",
    phone: "+970 59 667 8890",
    telegram: "@rami_hijazi",
    region: "gaza",
    subscriptionStatus: "active",
    deactivatedAt: null,
  },
  {
    id: "user_nour_009",
    clerkId: "clerk_user_nour_009",
    fullName: "Nour El-Din",
    email: "nour.eldin@student.ps",
    phone: "+970 56 101 2233",
    telegram: "@nour_eldin",
    region: "gaza",
    subscriptionStatus: "pending_approval",
    deactivatedAt: null,
  },
  {
    id: "user_dina_010",
    clerkId: "clerk_user_dina_010",
    fullName: "Dina Shaer",
    email: "dina.shaer@student.ps",
    phone: "+970 59 445 6677",
    telegram: null,
    region: "west_bank",
    subscriptionStatus: "active",
    deactivatedAt: null,
  },
  {
    id: "user_kareem_011",
    clerkId: "clerk_user_kareem_011",
    fullName: "Kareem Taha",
    email: "kareem.taha@student.ps",
    phone: "+970 56 889 0011",
    telegram: "@kareem_t",
    region: "gaza",
    subscriptionStatus: "expired",
    deactivatedAt: null,
  },
  {
    id: "user_lina_012",
    clerkId: "clerk_user_lina_012",
    fullName: "Lina Awad",
    email: "lina.awad@student.ps",
    phone: "+970 59 212 3434",
    telegram: "@lina_awad",
    region: "west_bank",
    subscriptionStatus: "free",
    deactivatedAt: null,
  },
];

export type StudentListFilters = {
  q?: string;
  region?: Region;
  status?: SubscriptionStatus;
  page?: number;
};

export function filterStudents(
  students: StudentListItem[],
  filters: StudentListFilters,
): StudentListItem[] {
  const q = filters.q?.trim().toLowerCase();
  return students.filter((student) => {
    if (filters.region && student.region !== filters.region) return false;
    if (filters.status && student.subscriptionStatus !== filters.status) {
      return false;
    }
    if (!q) return true;
    const haystack = [
      student.fullName,
      student.email,
      student.phone ?? "",
      student.telegram ?? "",
      student.id,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function paginateStudents(
  students: StudentListItem[],
  page: number,
  pageSize: number = STUDENT_PAGE_SIZE,
): StudentListResponse {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const total = students.length;
  const maxPage = Math.max(1, Math.ceil(total / pageSize) || 1);
  const currentPage = Math.min(safePage, maxPage);
  const start = (currentPage - 1) * pageSize;
  return {
    students: students.slice(start, start + pageSize),
    total,
    page: currentPage,
    pageSize,
  };
}

/** Preview only (`?state=`). Live list uses Nest pagination. */
export function buildStudentList(
  filters: StudentListFilters = {},
): StudentListResponse {
  const filtered = filterStudents(mockStudents, filters);
  return paginateStudents(filtered, filters.page ?? 1);
}

export const emptyStudentList: StudentListResponse = {
  students: [],
  total: 0,
  page: 1,
  pageSize: STUDENT_PAGE_SIZE,
};

export const mockDeviceBindingsEmpty = {
  userId: "preview",
  bindings: [],
};
