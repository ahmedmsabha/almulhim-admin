"use client";

import type { ReactNode } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { StudentsErrorPanel } from "@/components/students/StudentsErrorPanel";
import { StudentsHeaderActions } from "@/components/students/StudentsHeaderActions";
import { StudentsSkeleton } from "@/components/students/StudentsSkeleton";
import { StudentsView } from "@/components/students/StudentsView";
import { isApiError } from "@/lib/api/errors";
import type { Region } from "@/lib/domain/region";
import type { SubscriptionStatus } from "@/lib/domain/subscription-status";
import { useStudentsList } from "@/lib/students/use-students-list";

type StudentsListContainerProps = {
  q: string;
  region: Region | "";
  status: SubscriptionStatus | "";
  page: number;
  includeDeactivated: boolean;
};

function errorMessage(error: unknown): string | undefined {
  if (!isApiError(error)) return undefined;
  if (error.status === 404) {
    return "GET /users returned 404. Confirm the users module is deployed on this API.";
  }
  if (error.kind === "parse") {
    return "Students list from the API did not match the expected shape. Check the Nest StudentListResponse contract.";
  }
  if (error.kind === "unauthorized") {
    return "Your session token was missing. Sign in again, then retry.";
  }
  if (error.kind === "network" || error.kind === "config") {
    return "Could not reach the Mulhim Backend. Check NEXT_PUBLIC_API_URL and that the API is running.";
  }
  return error.message;
}

import { useTranslation } from "@/lib/i18n/LanguageContext";

function Frame({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          eyebrow={t("students.eyebrow")}
          title={t("students.title")}
          description={t("students.description")}
          className="mb-0"
        />
        <StudentsHeaderActions />
      </div>
      {children}
    </div>
  );
}

export function StudentsListContainer({
  q,
  region,
  status,
  page,
  includeDeactivated,
}: StudentsListContainerProps) {
  const query = useStudentsList({
    q: q || undefined,
    region: region || undefined,
    status: status || undefined,
    includeDeactivated,
    page,
  });

  if (query.isPending) {
    return (
      <Frame>
        <StudentsSkeleton />
      </Frame>
    );
  }

  if (query.isError) {
    return (
      <Frame>
        <StudentsErrorPanel
          message={errorMessage(query.error)}
          onRetry={() => {
            void query.refetch();
          }}
        />
      </Frame>
    );
  }

  return (
    <StudentsView
      data={query.data}
      q={q}
      region={region}
      status={status}
      includeDeactivated={includeDeactivated}
    />
  );
}
