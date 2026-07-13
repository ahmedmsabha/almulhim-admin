"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import {
  fetchStudentDetail,
  studentDetailPath,
} from "@/lib/students/fetch-students";
import { adminKeys } from "@/lib/query/keys";

export function useStudentDetail(
  studentUserId: string,
  options?: { enabled?: boolean },
) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const path = studentDetailPath(studentUserId);
  const enabled =
    (options?.enabled ?? true) &&
    isLoaded &&
    Boolean(isSignedIn) &&
    Boolean(userId) &&
    Boolean(studentUserId);

  return useQuery({
    queryKey: adminKeys.students.detail(studentUserId),
    enabled,
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new ApiError({
          kind: "unauthorized",
          message: `[students] Clerk session has no token for ${path}`,
          path,
        });
      }
      return fetchStudentDetail(token, studentUserId);
    },
  });
}
