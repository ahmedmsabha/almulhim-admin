"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api/errors";
import {
  deactivateStudent,
  deleteStudent,
  reactivateStudent,
  studentDetailPath,
} from "@/lib/students/fetch-students";
import type { StudentListItem } from "@/lib/students/types";
import { adminKeys } from "@/lib/query/keys";
import { toastAdminError } from "@/lib/toast/admin-toast";

export type StudentLifecycleAction = "deactivate" | "reactivate" | "delete";

export function useStudentLifecycle(userId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const path = studentDetailPath(userId);

  return useMutation({
    mutationFn: async (action: StudentLifecycleAction) => {
      const token = await getToken();
      if (!token) {
        throw new ApiError({
          kind: "unauthorized",
          message: `[students] Clerk session has no token for ${path}`,
          path,
        });
      }
      if (action === "deactivate") {
        return { action, student: await deactivateStudent(token, userId) };
      }
      if (action === "reactivate") {
        return { action, student: await reactivateStudent(token, userId) };
      }
      return {
        action,
        deleted: await deleteStudent(token, userId),
      };
    },
    onSuccess: (result) => {
      if (result.action === "delete") {
        // Drop detail/device caches first so invalidate does not refetch a
        // deleted student (404 flash) while this page is still mounted.
        queryClient.removeQueries({
          queryKey: adminKeys.students.detail(userId),
        });
        queryClient.removeQueries({
          queryKey: adminKeys.devices.byUser(userId),
        });
        void queryClient.invalidateQueries({
          queryKey: [...adminKeys.students.all(), "list"],
        });
        // Nest cascades subscriptions; refresh pending/archived/AI logs.
        void queryClient.invalidateQueries({
          queryKey: adminKeys.subscriptions.all(),
        });
        router.push("/students");
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: adminKeys.students.all(),
      });
      void queryClient.invalidateQueries({
        queryKey: adminKeys.devices.byUser(userId),
      });
      queryClient.setQueryData<StudentListItem>(
        adminKeys.students.detail(userId),
        result.student,
      );
    },
    onError: (error) => {
      toastAdminError(error);
    },
  });
}
