"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import {
  STUDENTS_LIST_PATH,
  fetchStudentsList,
} from "@/lib/students/fetch-students";
import type { StudentListQuery } from "@/lib/students/types";
import { STUDENT_PAGE_SIZE } from "@/lib/students/types";
import { adminKeys } from "@/lib/query/keys";

export function useStudentsList(
  query: StudentListQuery,
  options?: { enabled?: boolean },
) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const filters = {
    q: query.q?.trim() || undefined,
    region: query.region,
    status: query.status,
    includeDeactivated: query.includeDeactivated ? "true" : undefined,
    page: query.page ?? 1,
    pageSize: query.pageSize ?? STUDENT_PAGE_SIZE,
  };
  const enabled =
    (options?.enabled ?? true) &&
    isLoaded &&
    Boolean(isSignedIn) &&
    Boolean(userId);

  return useQuery({
    queryKey: adminKeys.students.list(filters),
    enabled,
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new ApiError({
          kind: "unauthorized",
          message: `[students] Clerk session has no token for ${STUDENTS_LIST_PATH}`,
          path: STUDENTS_LIST_PATH,
        });
      }
      return fetchStudentsList(token, {
        q: query.q,
        region: query.region,
        status: query.status,
        includeDeactivated: query.includeDeactivated,
        page: query.page,
        pageSize: query.pageSize,
      });
    },
  });
}
