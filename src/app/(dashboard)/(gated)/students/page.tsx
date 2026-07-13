import { Suspense } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { StudentsHeaderActions } from "@/components/students/StudentsHeaderActions";
import { StudentsListContainer } from "@/components/students/StudentsListContainer";
import { StudentsSkeleton } from "@/components/students/StudentsSkeleton";
import { StudentsView } from "@/components/students/StudentsView";
import { REGIONS, type Region } from "@/lib/domain/region";
import {
  SUBSCRIPTION_STATUS_LABELS,
  type SubscriptionStatus,
} from "@/lib/domain/subscription-status";
import { emptyStudentList } from "@/lib/students/mock-data";

type StudentsPageProps = {
  searchParams: Promise<{
    state?: string | string[];
    q?: string | string[];
    region?: string | string[];
    status?: string | string[];
    page?: string | string[];
    includeDeactivated?: string | string[];
  }>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function resolvePreviewState(value: string | string[] | undefined) {
  const raw = first(value);
  if (raw === "loading" || raw === "empty") return raw;
  return null;
}

function resolveRegion(value: string | string[] | undefined): Region | "" {
  const raw = first(value);
  if (raw && (REGIONS as string[]).includes(raw)) return raw as Region;
  return "";
}

function resolveStatus(
  value: string | string[] | undefined,
): SubscriptionStatus | "" {
  const raw = first(value);
  if (raw && raw in SUBSCRIPTION_STATUS_LABELS) {
    return raw as SubscriptionStatus;
  }
  return "";
}

function resolvePage(value: string | string[] | undefined) {
  const raw = first(value);
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  const params = await searchParams;
  const preview = resolvePreviewState(params.state);
  const q = first(params.q)?.trim() ?? "";
  const region = resolveRegion(params.region);
  const status = resolveStatus(params.status);
  const page = resolvePage(params.page);
  const includeDeactivated = first(params.includeDeactivated) === "true";

  if (preview === "loading") {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <PageHeader
            eyebrow="Students"
            title="Students & Devices"
            description="Manage enrollment and open a student for device bindings."
            className="mb-0"
          />
          <StudentsHeaderActions />
        </div>
        <StudentsSkeleton />
      </div>
    );
  }

  if (preview === "empty") {
    return (
      <StudentsView
        data={emptyStudentList}
        q={q}
        region={region}
        status={status}
        includeDeactivated={includeDeactivated}
      />
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <PageHeader
              eyebrow="Students"
              title="Students & Devices"
              className="mb-0"
            />
            <StudentsHeaderActions />
          </div>
          <StudentsSkeleton />
        </div>
      }
    >
      <StudentsListContainer
        q={q}
        region={region}
        status={status}
        page={page}
        includeDeactivated={includeDeactivated}
      />
    </Suspense>
  );
}
