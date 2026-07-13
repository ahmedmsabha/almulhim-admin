"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import type { SubscriptionsTab } from "@/lib/subscriptions/types";

type SubscriptionsTabsProps = {
  activeTab: SubscriptionsTab;
  /** `null` while that tab’s query is still loading or has failed. */
  pendingCount: number | null;
  archivedCount: number | null;
  aiLogsCount: number | null;
};

function tabHref(
  pathname: string,
  searchParams: URLSearchParams,
  tab: SubscriptionsTab,
) {
  const next = new URLSearchParams(searchParams.toString());
  next.delete("state");
  if (tab === "pending") next.delete("tab");
  else next.set("tab", tab);
  const qs = next.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

function tabClass(selected: boolean) {
  return selected
    ? "border-b-2 border-primary px-4 py-4 text-body-md font-bold text-primary"
    : "px-4 py-4 text-body-md text-on-surface-variant hover:text-on-surface";
}

function labelWithCount(label: string, count: number | null) {
  if (count === null) return label;
  return `${label} (${count})`;
}

export function SubscriptionsTabs({
  activeTab,
  pendingCount,
  archivedCount,
  aiLogsCount,
}: SubscriptionsTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div
      className="flex flex-wrap items-center gap-1 border-b border-outline-variant px-2 sm:px-4"
      role="tablist"
      aria-label="Subscription queues"
    >
      <Link
        href={tabHref(pathname, searchParams, "pending")}
        role="tab"
        aria-selected={activeTab === "pending"}
        className={tabClass(activeTab === "pending")}
      >
        {labelWithCount("Pending Queue", pendingCount)}
      </Link>
      <Link
        href={tabHref(pathname, searchParams, "archived")}
        role="tab"
        aria-selected={activeTab === "archived"}
        className={tabClass(activeTab === "archived")}
      >
        {labelWithCount("Archived Decisions", archivedCount)}
      </Link>
      <Link
        href={tabHref(pathname, searchParams, "ai_logs")}
        role="tab"
        aria-selected={activeTab === "ai_logs"}
        className={tabClass(activeTab === "ai_logs")}
      >
        {labelWithCount("AI Logs", aiLogsCount)}
      </Link>
    </div>
  );
}
