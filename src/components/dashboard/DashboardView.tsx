"use client";

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
import { useTranslation } from "@/lib/i18n/LanguageContext";

type DashboardViewProps = {
  stats: DashboardStats;
};

export function DashboardView({ stats }: DashboardViewProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          eyebrow={t("dashboard.eyebrow")}
          title={t("dashboard.title")}
          className="mb-0"
        />
        <DashboardHeaderActions rangeLabel={t("dashboard.range30Days")} />
      </div>

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t("dashboard.kpis.totalStudents")}
          value={stats.totalStudents}
          sparkline={stats.subscriptionGrowth.map((point) => point.count)}
          sparklineColor="var(--color-primary)"
          icon={<UsersThreeIcon />}
        />
        <KpiCard
          label={t("dashboard.kpis.activeSubscriptions")}
          value={stats.activeSubscriptions}
          icon={<SealCheckIcon />}
        />
        <KpiCard
          label={t("dashboard.kpis.pendingApprovals")}
          value={stats.pendingApprovals}
          urgent
          urgentHint={t("dashboard.kpis.urgentHint")}
          icon={<HourglassIcon />}
        />
        <KpiCard
          label={t("dashboard.kpis.openSupport")}
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
