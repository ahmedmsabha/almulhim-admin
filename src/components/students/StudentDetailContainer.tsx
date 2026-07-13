"use client";

import Link from "next/link";

import { StudentDetailSkeleton } from "@/components/students/StudentDetailSkeleton";
import { StudentDetailView } from "@/components/students/StudentDetailView";
import { StudentsErrorPanel } from "@/components/students/StudentsErrorPanel";
import { isApiError } from "@/lib/api/errors";
import { useDeviceBindings } from "@/lib/devices/use-device-bindings";
import { useStudentDetail } from "@/lib/students/use-student-detail";

type StudentDetailContainerProps = {
  userId: string;
};

function profileErrorMessage(error: unknown): string | undefined {
  if (!isApiError(error)) return undefined;
  if (error.status === 404) {
    return "No student exists for this id, or the id is not a student account.";
  }
  if (error.status === 400) {
    return "That student id is not a valid UUID.";
  }
  if (error.kind === "parse") {
    return "Student profile from the API did not match the expected shape.";
  }
  if (error.kind === "unauthorized") {
    return "Your session token was missing. Sign in again, then retry.";
  }
  if (error.kind === "network" || error.kind === "config") {
    return "Could not reach the Mulhim Backend. Check NEXT_PUBLIC_API_URL and that the API is running.";
  }
  return error.message;
}

function devicesErrorMessage(error: unknown): string | undefined {
  if (!isApiError(error)) return undefined;
  if (error.status === 404) {
    return "Device bindings endpoint returned 404 for this student.";
  }
  if (error.kind === "parse") {
    return "Device bindings from the API did not match the expected shape.";
  }
  if (error.kind === "unauthorized") {
    return "Your session token was missing. Sign in again, then retry.";
  }
  if (error.kind === "network" || error.kind === "config") {
    return "Could not reach the Mulhim Backend. Check NEXT_PUBLIC_API_URL and that the API is running.";
  }
  return error.message;
}

export function StudentDetailContainer({
  userId,
}: StudentDetailContainerProps) {
  const profile = useStudentDetail(userId);
  const devices = useDeviceBindings(userId, {
    enabled: profile.isSuccess,
  });

  if (profile.isPending) {
    return <StudentDetailSkeleton />;
  }

  if (profile.isError) {
    const notFound = isApiError(profile.error) && profile.error.status === 404;
    return (
      <div className="flex flex-col gap-6">
        <Link
          href="/students"
          className="inline-flex w-fit items-center gap-1.5 text-body-sm text-on-surface-variant hover:text-on-surface"
        >
          Back to students
        </Link>
        <StudentsErrorPanel
          title={notFound ? "Student not found" : "Student profile unavailable"}
          message={profileErrorMessage(profile.error)}
          onRetry={() => {
            void profile.refetch();
          }}
        />
      </div>
    );
  }

  if (devices.isPending) {
    return <StudentDetailSkeleton />;
  }

  if (devices.isError) {
    return (
      <div className="flex flex-col gap-6">
        <StudentsErrorPanel
          title="Device bindings unavailable"
          message={devicesErrorMessage(devices.error)}
          onRetry={() => {
            void devices.refetch();
          }}
        />
      </div>
    );
  }

  return (
    <StudentDetailView student={profile.data} bindings={devices.data} />
  );
}
