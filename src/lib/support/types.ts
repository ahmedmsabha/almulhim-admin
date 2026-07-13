import type { Region } from "@/lib/domain/region";
import type { SupportRequestStatus } from "@/lib/domain/support-request-status";

/** Nest `AdminSupportStudentSummary`. */
export type AdminSupportStudentSummary = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  region: Region;
};

/** Nest `AdminSupportRequestResponse`. */
export type AdminSupportRequestResponse = {
  id: string;
  subject: string;
  message: string;
  status: SupportRequestStatus;
  adminReply: string | null;
  reviewedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  student: AdminSupportStudentSummary;
};

/** Nest `AdminSupportRequestListResponse`. */
export type AdminSupportRequestListResponse = {
  requests: AdminSupportRequestResponse[];
};

/** Nest `ReplySupportRequestInput`. */
export type ReplySupportRequestInput = {
  reply: string;
};

export type SupportListFilters = {
  q?: string;
  status?: SupportRequestStatus;
};
