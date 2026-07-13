import { AdminAnalytics } from "@/components/layout/AdminAnalytics";
import { DashboardProviders } from "@/components/layout/DashboardProviders";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireAdmin } from "@/lib/auth";

/**
 * Admin gate + shell. Technical failures rethrow into the parent
 * `(dashboard)/error.tsx` boundary.
 */
export default async function GatedDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await requireAdmin();

  return (
    <DashboardProviders>
      <AdminAnalytics
        adminId={admin.id}
        email={admin.email}
        name={admin.name}
      />
      <DashboardShell>{children}</DashboardShell>
    </DashboardProviders>
  );
}
