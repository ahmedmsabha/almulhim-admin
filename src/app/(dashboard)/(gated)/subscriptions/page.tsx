import { Suspense } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { SubscriptionsListContainer } from "@/components/subscriptions/SubscriptionsListContainer";
import { SubscriptionsSkeleton } from "@/components/subscriptions/SubscriptionsSkeleton";
import { SubscriptionsView } from "@/components/subscriptions/SubscriptionsView";
import { emptySubscriptionList } from "@/lib/subscriptions/mock-data";
import type { SubscriptionsTab } from "@/lib/subscriptions/types";

type SubscriptionsPageProps = {
  searchParams: Promise<{
    state?: string | string[];
    q?: string | string[];
    tab?: string | string[];
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

function resolveTab(value: string | string[] | undefined): SubscriptionsTab {
  const raw = first(value);
  if (raw === "archived" || raw === "ai_logs") return raw;
  return "pending";
}

export default async function SubscriptionsPage({
  searchParams,
}: SubscriptionsPageProps) {
  const params = await searchParams;
  const preview = resolvePreviewState(params.state);
  const q = first(params.q)?.trim() ?? "";
  const tab = resolveTab(params.tab);

  if (preview === "loading") {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          eyebrow="Subscriptions"
          title="Approval Queue"
          description="Review pending receipts before students unlock paid lessons."
          className="mb-0"
        />
        <SubscriptionsSkeleton />
      </div>
    );
  }

  if (preview === "empty") {
    return (
      <SubscriptionsView
        tab={tab}
        q={q}
        pendingCount={0}
        archivedCount={0}
        aiLogsCount={0}
        subscriptions={emptySubscriptionList}
        aiLogs={{ logs: [] }}
      />
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-8">
          <PageHeader
            eyebrow="Subscriptions"
            title="Approval Queue"
            className="mb-0"
          />
          <SubscriptionsSkeleton />
        </div>
      }
    >
      <SubscriptionsListContainer tab={tab} q={q} />
    </Suspense>
  );
}
