/**
 * Nest admin dashboard contract (GET /analytics/admin/dashboard).
 * Matches Mulhim Backend AdminAnalyticsService / admin-dashboard.response.
 * Query key: ['admin', 'dashboard', 'stats', userId]
 */

import type { Region } from "@/lib/domain/region";

export type { Region } from "@/lib/domain/region";
export { REGION_LABELS } from "@/lib/domain/region";

export type DashboardStats = {
  totalStudents: number;
  activeSubscriptions: number;
  pendingApprovals: number;
  openSupportTickets: number;
  subscriptionGrowth: Array<{
    date: string;
    count: number;
  }>;
  regionDistribution: Array<{
    region: Region;
    count: number;
  }>;
  recentActivity: Array<{
    id: string;
    studentName: string;
    action: string;
    timestamp: string;
  }>;
};

export const mockDashboardStats: DashboardStats = {
  totalStudents: 14285,
  activeSubscriptions: 8920,
  pendingApprovals: 142,
  openSupportTickets: 56,
  subscriptionGrowth: [
    { date: "2026-01-01", count: 42 },
    { date: "2026-01-04", count: 55 },
    { date: "2026-01-08", count: 48 },
    { date: "2026-01-12", count: 72 },
    { date: "2026-01-16", count: 68 },
    { date: "2026-01-20", count: 90 },
    { date: "2026-01-24", count: 84 },
    { date: "2026-01-28", count: 110 },
    { date: "2026-01-30", count: 98 },
  ],
  regionDistribution: [
    { region: "gaza", count: 5842 },
    { region: "west_bank", count: 8443 },
  ],
  recentActivity: [
    {
      id: "subscription:sub_001",
      studentName: "Ahmed Al-Sayed",
      action: "Subscription approved",
      timestamp: "2026-01-30T14:28:00.000Z",
    },
    {
      id: "subscription:sub_002",
      studentName: "Leila Mansour",
      action: "Submitted subscription",
      timestamp: "2026-01-30T14:15:00.000Z",
    },
    {
      id: "support:sup_003",
      studentName: "Yousef Qassim",
      action: "Opened support ticket",
      timestamp: "2026-01-30T13:30:00.000Z",
    },
    {
      id: "subscription:sub_004",
      studentName: "Mariam Khalil",
      action: "Subscription expired",
      timestamp: "2026-01-28T10:00:00.000Z",
    },
  ],
};

/** Empty payload for `?state=empty` preview (same Nest shape). */
export const emptyDashboardStats: DashboardStats = {
  totalStudents: 0,
  activeSubscriptions: 0,
  pendingApprovals: 0,
  openSupportTickets: 0,
  subscriptionGrowth: [],
  regionDistribution: [
    { region: "gaza", count: 0 },
    { region: "west_bank", count: 0 },
  ],
  recentActivity: [],
};
