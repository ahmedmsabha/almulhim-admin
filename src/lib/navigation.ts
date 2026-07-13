import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  FlaskConical,
  Headphones,
  LayoutDashboard,
  Megaphone,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Students", href: "/students", icon: Users },
  { label: "Plans", href: "/plans", icon: Wallet },
  { label: "Subscriptions", href: "/subscriptions", icon: RefreshCw },
  { label: "Content", href: "/content", icon: BookOpen },
  { label: "Announcements", href: "/announcements", icon: Megaphone },
  { label: "Support", href: "/support", icon: Headphones },
  ...(process.env.NODE_ENV === "development"
    ? ([
        {
          label: "Test checkout",
          href: "/dev/subscriptions",
          icon: FlaskConical,
        },
      ] satisfies DashboardNavItem[])
    : []),
];
