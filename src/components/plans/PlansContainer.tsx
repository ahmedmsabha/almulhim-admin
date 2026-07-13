"use client";

import type { ReactNode } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { PlansErrorPanel } from "@/components/plans/PlansErrorPanel";
import { PlansSkeleton } from "@/components/plans/PlansSkeleton";
import { PlansView } from "@/components/plans/PlansView";
import { isApiError } from "@/lib/api/errors";
import { usePlansList } from "@/lib/plans/use-plans-list";

function errorMessage(error: unknown): string | undefined {
  if (!isApiError(error)) return undefined;
  if (error.status === 404) {
    return "GET /plans/all returned 404. Confirm the plans module is deployed on this API.";
  }
  if (error.kind === "parse") {
    return "Plans from the API did not match the expected AdminPlanListResponse shape.";
  }
  if (error.kind === "unauthorized") {
    return "Your session token was missing. Sign in again, then retry.";
  }
  if (error.kind === "network" || error.kind === "config") {
    return "Could not reach the Mulhim Backend. Check NEXT_PUBLIC_API_URL and that the API is running.";
  }
  return error.message;
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Plans"
        title="Subscription Plans"
        description="Manage pricing tiers students can subscribe to."
        className="mb-0"
      />
      {children}
    </div>
  );
}

export function PlansContainer() {
  const query = usePlansList();

  if (query.isPending) {
    return (
      <Frame>
        <PlansSkeleton />
      </Frame>
    );
  }

  if (query.isError) {
    return (
      <Frame>
        <PlansErrorPanel
          message={errorMessage(query.error)}
          onRetry={() => {
            void query.refetch();
          }}
        />
      </Frame>
    );
  }

  return <PlansView data={query.data} />;
}
