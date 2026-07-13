"use client";

import type { ReactNode } from "react";

import { DashboardErrorPanel } from "@/components/dashboard/DashboardErrorPanel";
import { DashboardHeaderActions } from "@/components/dashboard/DashboardHeaderActions";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { PageHeader } from "@/components/layout/PageHeader";
import { isApiError } from "@/lib/api/errors";
import {
  emptyDashboardStats,
  type DashboardStats,
} from "@/lib/dashboard/mock-data";
import { isDashboardStats } from "@/lib/dashboard/parse-dashboard-stats";
import { useDashboardStats } from "@/lib/dashboard/use-dashboard-stats";

function isEmptyStats(stats: DashboardStats): boolean {
  return (
    stats.totalStudents === 0 &&
    stats.activeSubscriptions === 0 &&
    stats.pendingApprovals === 0 &&
    stats.openSupportTickets === 0 &&
    stats.recentActivity.length === 0 &&
    stats.subscriptionGrowth.every((point) => point.count === 0)
  );
}

function errorMessage(error: unknown): string | undefined {
  if (!isApiError(error)) return undefined;
  if (error.status === 404) {
    return "GET /analytics/admin/dashboard returned 404. Confirm the analytics module is deployed on this API.";
  }
  if (error.kind === "parse") {
    return "Dashboard stats from the API did not match the expected shape. Check the Nest DashboardStats contract.";
  }
  if (error.kind === "unauthorized") {
    return "Your session token was missing. Sign in again, then retry.";
  }
  if (error.kind === "network" || error.kind === "config") {
    return "Could not reach the Mulhim Backend. Check NEXT_PUBLIC_API_URL and that the API is running.";
  }
  return error.message;
}

function DashboardFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          eyebrow="Overview"
          title="Analytics Dashboard"
          className="mb-0"
        />
        <DashboardHeaderActions />
      </div>
      {children}
    </div>
  );
}

export function DashboardContainer() {
  const query = useDashboardStats();

  if (query.isPending) {
    return (
      <DashboardFrame>
        <DashboardSkeleton />
      </DashboardFrame>
    );
  }

  if (query.isError) {
    return (
      <DashboardFrame>
        <DashboardErrorPanel
          message={errorMessage(query.error)}
          onRetry={() => {
            void query.refetch();
          }}
        />
      </DashboardFrame>
    );
  }

  if (query.data == null || !isDashboardStats(query.data)) {
    return (
      <DashboardFrame>
        <DashboardErrorPanel
          message="The API returned no usable dashboard stats. Retry, or confirm GET /analytics/admin/dashboard returns DashboardStats."
          onRetry={() => {
            void query.refetch();
          }}
        />
      </DashboardFrame>
    );
  }

  const viewStats = isEmptyStats(query.data)
    ? emptyDashboardStats
    : query.data;

  return <DashboardView stats={viewStats} />;
}
