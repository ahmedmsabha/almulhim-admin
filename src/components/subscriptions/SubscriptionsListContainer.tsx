"use client";

import type { ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";

import { PageHeader } from "@/components/layout/PageHeader";
import { SubscriptionsErrorPanel } from "@/components/subscriptions/SubscriptionsErrorPanel";
import { SubscriptionsSkeleton } from "@/components/subscriptions/SubscriptionsSkeleton";
import { SubscriptionsView } from "@/components/subscriptions/SubscriptionsView";
import { isApiError } from "@/lib/api/errors";
import { buildFilteredSubscriptionList } from "@/lib/subscriptions/filter-subscriptions";
import type {
  AdminSubscriptionListResponse,
  AiVerificationLogListResponse,
  SubscriptionsTab,
} from "@/lib/subscriptions/types";
import { useAiVerificationLogs } from "@/lib/subscriptions/use-ai-verification-logs";
import { useArchivedSubscriptions } from "@/lib/subscriptions/use-archived-subscriptions";
import { usePendingSubscriptions } from "@/lib/subscriptions/use-pending-subscriptions";

type SubscriptionsListContainerProps = {
  tab: SubscriptionsTab;
  q: string;
};

function errorMessage(error: unknown, tab: SubscriptionsTab): string | undefined {
  if (!isApiError(error)) return undefined;
  const path =
    tab === "pending"
      ? "pending"
      : tab === "archived"
        ? "archived"
        : "ai-logs";
  if (error.status === 404) {
    return `GET /subscriptions/${path} returned 404. Confirm the subscriptions admin module is deployed on this API.`;
  }
  if (error.kind === "parse") {
    return `Subscriptions ${path} payload did not match the expected Nest shape.`;
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
        eyebrow="Subscriptions"
        title="Approval Queue"
        description="Review pending receipts before students unlock paid lessons."
        className="mb-0"
      />
      {children}
    </div>
  );
}

function filterAiLogs(
  data: AiVerificationLogListResponse,
  q: string,
): AiVerificationLogListResponse {
  const needle = q.trim().toLowerCase();
  if (!needle) return data;
  return {
    logs: data.logs.filter((row) => {
      const haystack =
        `${row.student.fullName} ${row.student.email}`.toLowerCase();
      return haystack.includes(needle);
    }),
  };
}

/** Known length only after success; hide fake `(0)` while loading/errored. */
function successCount<T>(
  query: UseQueryResult<T>,
  length: (data: T) => number,
): number | null {
  if (!query.isSuccess || query.data === undefined) return null;
  return length(query.data);
}

export function SubscriptionsListContainer({
  tab,
  q,
}: SubscriptionsListContainerProps) {
  const pending = usePendingSubscriptions({ enabled: true });
  const archived = useArchivedSubscriptions({ enabled: true });
  const aiLogs = useAiVerificationLogs({ enabled: true });

  const active =
    tab === "pending" ? pending : tab === "archived" ? archived : aiLogs;

  if (active.isPending) {
    return (
      <Frame>
        <SubscriptionsSkeleton />
      </Frame>
    );
  }

  if (active.isError) {
    return (
      <Frame>
        <SubscriptionsErrorPanel
          message={errorMessage(active.error, tab)}
          onRetry={() => {
            void active.refetch();
          }}
        />
      </Frame>
    );
  }

  const pendingRaw = successCount(
    pending,
    (data: AdminSubscriptionListResponse) => data.subscriptions.length,
  );
  const archivedRaw = successCount(
    archived,
    (data: AdminSubscriptionListResponse) => data.subscriptions.length,
  );
  const aiLogsRaw = successCount(
    aiLogs,
    (data: AiVerificationLogListResponse) => data.logs.length,
  );

  if (tab === "ai_logs") {
    const filtered = filterAiLogs(aiLogs.data ?? { logs: [] }, q);
    return (
      <SubscriptionsView
        tab={tab}
        q={q}
        pendingCount={pendingRaw}
        archivedCount={archivedRaw}
        aiLogsCount={filtered.logs.length}
        aiLogs={filtered}
      />
    );
  }

  const source =
    tab === "pending"
      ? (pending.data?.subscriptions ?? [])
      : (archived.data?.subscriptions ?? []);
  const data = buildFilteredSubscriptionList(source, { q: q || undefined });

  return (
    <SubscriptionsView
      tab={tab}
      q={q}
      pendingCount={
        tab === "pending" ? data.subscriptions.length : pendingRaw
      }
      archivedCount={
        tab === "archived" ? data.subscriptions.length : archivedRaw
      }
      aiLogsCount={aiLogsRaw}
      subscriptions={data}
    />
  );
}
