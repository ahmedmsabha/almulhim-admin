import { PageHeader } from "@/components/layout/PageHeader";
import { SubscriptionsAiLogsTable } from "@/components/subscriptions/SubscriptionsAiLogsTable";
import { SubscriptionsTabs } from "@/components/subscriptions/SubscriptionsTabs";
import { SubscriptionsTable } from "@/components/subscriptions/SubscriptionsTable";
import { SubscriptionsToolbar } from "@/components/subscriptions/SubscriptionsToolbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  AdminSubscriptionListResponse,
  AiVerificationLogListResponse,
  SubscriptionsTab,
} from "@/lib/subscriptions/types";

type SubscriptionsViewProps = {
  tab: SubscriptionsTab;
  q: string;
  pendingCount: number | null;
  archivedCount: number | null;
  aiLogsCount: number | null;
  subscriptions?: AdminSubscriptionListResponse;
  aiLogs?: AiVerificationLogListResponse;
};

export function SubscriptionsView({
  tab,
  q,
  pendingCount,
  archivedCount,
  aiLogsCount,
  subscriptions,
  aiLogs,
}: SubscriptionsViewProps) {
  const title =
    tab === "pending"
      ? "Receipt review"
      : tab === "archived"
        ? "Archived decisions"
        : "AI verification logs";

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Subscriptions"
        title="Approval Queue"
        description="Review pending receipts before students unlock paid lessons."
        className="mb-0"
      />
      <Card className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest py-0 ring-0">
        <CardHeader className="gap-0 border-b border-outline-variant px-0 py-0">
          <div className="flex items-center justify-between px-6 py-4">
            <CardTitle className="text-headline-sm font-display text-on-surface">
              {title}
            </CardTitle>
          </div>
          <SubscriptionsTabs
            activeTab={tab}
            pendingCount={pendingCount}
            archivedCount={archivedCount}
            aiLogsCount={aiLogsCount}
          />
          <SubscriptionsToolbar q={q} />
        </CardHeader>
        <CardContent className="px-0">
          {tab === "ai_logs" ? (
            <SubscriptionsAiLogsTable
              data={aiLogs ?? { logs: [] }}
            />
          ) : (
            <SubscriptionsTable
              data={subscriptions ?? { subscriptions: [] }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
