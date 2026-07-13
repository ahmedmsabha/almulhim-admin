import type { Region } from "@/lib/domain/region";
import type { SubscriptionStatus } from "@/lib/domain/subscription-status";

/** Nest admin student row (`toStudentListItem`). */
export type StudentListItem = {
  id: string;
  clerkId: string;
  fullName: string;
  email: string;
  phone: string | null;
  telegram: string | null;
  region: Region;
  subscriptionStatus: SubscriptionStatus;
  deactivatedAt: string | null;
};

/** Nest `DELETE /users/:userId` success body. */
export type DeleteStudentResponse = {
  deleted: true;
  userId: string;
};

/** Nest `GET /users` paginated envelope. */
export type StudentListResponse = {
  students: StudentListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type StudentListQuery = {
  q?: string;
  region?: Region;
  status?: SubscriptionStatus;
  /** Nest default is false (hide soft-blocked). Pass true to include them. */
  includeDeactivated?: boolean;
  page?: number;
  pageSize?: number;
};

export const STUDENT_PAGE_SIZE = 10;
