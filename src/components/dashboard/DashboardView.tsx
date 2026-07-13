import {
  HourglassIcon,
  SealCheckIcon,
  HeadsetIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr";

import { DashboardHeaderActions } from "@/components/dashboard/DashboardHeaderActions";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RecentActivityTable } from "@/components/dashboard/RecentActivityTable";
import { RegionDistribution } from "@/components/dashboard/RegionDistribution";
import { SubscriptionGrowthChart } from "@/components/dashboard/SubscriptionGrowthChart";
import { PageHeader } from "@/components/layout/PageHeader";
import type { DashboardStats } from "@/lib/dashboard/mock-data";

type DashboardViewProps = {
  stats: DashboardStats;
};

export function DashboardView({ stats }: DashboardViewProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          eyebrow="Overview"
          title="Analytics Dashboard"
          className="mb-0"
        />
        <DashboardHeaderActions rangeLabel="Last 30 Days" />
      </div>

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Students"
          value={stats.totalStudents}
          sparkline={stats.subscriptionGrowth.map((point) => point.count)}
          sparklineColor="var(--color-primary)"
          icon={<UsersThreeIcon />}
        />
        <KpiCard
          label="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={<SealCheckIcon />}
        />
        <KpiCard
          label="Pending Approvals"
          value={stats.pendingApprovals}
          urgent
          urgentHint="Requires immediate review"
          icon={<HourglassIcon />}
        />
        <KpiCard
          label="Open Support Tickets"
          value={stats.openSupportTickets}
          icon={<HeadsetIcon />}
        />
      </div>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        <SubscriptionGrowthChart data={stats.subscriptionGrowth} />
        <RegionDistribution data={stats.regionDistribution} />
      </div>

      <RecentActivityTable rows={stats.recentActivity} />
    </div>
  );
}
