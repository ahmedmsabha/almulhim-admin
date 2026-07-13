import { filterSupportRequests } from "@/lib/support/filter-support";
import type {
  AdminSupportRequestListResponse,
  AdminSupportRequestResponse,
  SupportListFilters,
} from "@/lib/support/types";

export type {
  AdminSupportRequestListResponse,
  AdminSupportRequestResponse,
  AdminSupportStudentSummary,
  SupportListFilters,
} from "@/lib/support/types";

export { filterSupportRequests } from "@/lib/support/filter-support";

function isoDaysAgo(days: number, hour = 12, minute = 0): string {
  const date = new Date("2026-07-13T12:00:00.000Z");
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(hour, minute, 0, 0);
  return date.toISOString();
}

function row(
  partial: AdminSupportRequestResponse,
): AdminSupportRequestResponse {
  return partial;
}

/** Seed across open / reviewed / closed for filter + thread demos. */
export const mockSupportRequests: AdminSupportRequestResponse[] = [
  row({
    id: "sup_open_001",
    subject: "Subscription not activated",
    message:
      "مرحباً، لدي مشكلة في تفعيل الاشتراك الخاص بي. قمت بالدفع منذ ساعتين ولكن الحساب لا يزال مجانياً.",
    status: "open",
    adminReply: null,
    reviewedAt: null,
    closedAt: null,
    createdAt: isoDaysAgo(0, 12, 45),
    student: {
      id: "user_ahmed_201",
      fullName: "Ahmed Al-Farsi",
      email: "ahmed.farsi@student.ps",
      phoneNumber: "+970 59 100 2201",
      region: "gaza",
    },
  }),
  row({
    id: "sup_open_002",
    subject: "Cannot download lesson files",
    message:
      "لا أستطيع تحميل ملفات الدرس الرابع، تظهر لي رسالة خطأ دائماً.",
    status: "open",
    adminReply: null,
    reviewedAt: null,
    closedAt: null,
    createdAt: isoDaysAgo(0, 10, 12),
    student: {
      id: "user_layla_202",
      fullName: "Layla Hassan",
      email: "layla.hassan@student.ps",
      phoneNumber: "+970 56 200 3302",
      region: "west_bank",
    },
  }),
  row({
    id: "sup_open_003",
    subject: "Change password on mobile",
    message: "كيف يمكنني تغيير كلمة المرور الخاصة بي من التطبيق؟",
    status: "open",
    adminReply: null,
    reviewedAt: null,
    closedAt: null,
    createdAt: isoDaysAgo(1, 16, 0),
    student: {
      id: "user_omar_203",
      fullName: "Omar Zaid",
      email: "omar.zaid@student.ps",
      phoneNumber: "+970 59 300 4403",
      region: "gaza",
    },
  }),
  row({
    id: "sup_reviewed_001",
    subject: "Receipt upload failed",
    message:
      "حاولت رفع إيصال الدفع ثلاث مرات ولم ينجح. هل يمكنكم المساعدة؟",
    status: "reviewed",
    adminReply:
      "Hello Sara. Please try again from a stable connection and use a JPG under 5 MB. We are watching for your next upload.",
    reviewedAt: isoDaysAgo(0, 11, 30),
    closedAt: null,
    createdAt: isoDaysAgo(1, 9, 15),
    student: {
      id: "user_sara_204",
      fullName: "Sara Nabulsi",
      email: "sara.nabulsi@student.ps",
      phoneNumber: "+970 56 400 5504",
      region: "west_bank",
    },
  }),
  row({
    id: "sup_reviewed_002",
    subject: "Wrong region on account",
    message:
      "حسابي يظهر غزة بينما أنا في الضفة. أحتاج تصحيح المنطقة للوصول للمحتوى الصحيح.",
    status: "reviewed",
    adminReply:
      "We updated your region to West Bank. Sign out and back in, then refresh the content tree.",
    reviewedAt: isoDaysAgo(2, 14, 0),
    closedAt: null,
    createdAt: isoDaysAgo(3, 8, 20),
    student: {
      id: "user_yousef_205",
      fullName: "Yousef Khalil",
      email: "yousef.khalil@student.ps",
      phoneNumber: "+970 59 500 6605",
      region: "west_bank",
    },
  }),
  row({
    id: "sup_reviewed_003",
    subject: "Video playback stuttering",
    message:
      "درس الوحدة الثانية يتقطع أثناء المشاهدة على الويب. هل المشكلة من عندكم؟",
    status: "reviewed",
    adminReply:
      "Thanks for the report. Try lowering quality once, and clear the browser cache. Reply if it continues.",
    reviewedAt: isoDaysAgo(1, 18, 40),
    closedAt: null,
    createdAt: isoDaysAgo(2, 11, 5),
    student: {
      id: "user_nour_206",
      fullName: "Nour Abu Hanna",
      email: "nour.abuhanna@student.ps",
      phoneNumber: "+970 56 600 7706",
      region: "gaza",
    },
  }),
  row({
    id: "sup_closed_001",
    subject: "Plan duration question",
    message: "هل باقة الترم تشمل امتحانات تجريبية؟",
    status: "closed",
    adminReply:
      "Yes. The term pass includes published practice exams for your region while the subscription is active.",
    reviewedAt: isoDaysAgo(4, 10, 0),
    closedAt: isoDaysAgo(3, 16, 0),
    createdAt: isoDaysAgo(5, 13, 30),
    student: {
      id: "user_hala_207",
      fullName: "Hala Qasem",
      email: "hala.qasem@student.ps",
      phoneNumber: "+970 59 700 8807",
      region: "west_bank",
    },
  }),
  row({
    id: "sup_closed_002",
    subject: "Device reset request",
    message:
      "غيرت جهازي وأحتاج إعادة ربط الحساب. الرجاء المساعدة.",
    status: "closed",
    adminReply:
      "Your mobile binding was reset. Open the app, sign in, and complete bind again.",
    reviewedAt: isoDaysAgo(6, 9, 0),
    closedAt: isoDaysAgo(6, 9, 45),
    createdAt: isoDaysAgo(7, 15, 10),
    student: {
      id: "user_rami_208",
      fullName: "Rami Odeh",
      email: "rami.odeh@student.ps",
      phoneNumber: "+970 56 800 9908",
      region: "gaza",
    },
  }),
  row({
    id: "sup_closed_003",
    subject: "Announcement image not loading",
    message: "صورة الإعلان الأخير لا تظهر في التطبيق.",
    status: "closed",
    adminReply:
      "The image CDN cache was cleared. Force-close the app and reopen the announcements feed.",
    reviewedAt: isoDaysAgo(8, 12, 0),
    closedAt: isoDaysAgo(8, 12, 20),
    createdAt: isoDaysAgo(9, 10, 0),
    student: {
      id: "user_maya_209",
      fullName: "Maya Barakat",
      email: "maya.barakat@student.ps",
      phoneNumber: "+970 59 900 1010",
      region: "west_bank",
    },
  }),
  row({
    id: "sup_open_004",
    subject: "Telegram contact update",
    message: "أريد تحديث رقم التليجرام المرتبط بحسابي.",
    status: "open",
    adminReply: null,
    reviewedAt: null,
    closedAt: null,
    createdAt: isoDaysAgo(0, 8, 5),
    student: {
      id: "user_kareem_210",
      fullName: "Kareem Saleh",
      email: "kareem.saleh@student.ps",
      phoneNumber: "+970 56 110 1111",
      region: "gaza",
    },
  }),
];

export function buildSupportList(
  filters: SupportListFilters = {},
): AdminSupportRequestListResponse {
  return {
    requests: filterSupportRequests(mockSupportRequests, filters),
  };
}

export const emptySupportList: AdminSupportRequestListResponse = {
  requests: [],
};
