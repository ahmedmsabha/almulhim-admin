import { cookies } from "next/headers";
import { AdminAnalytics } from "@/components/layout/AdminAnalytics";
import { DashboardProviders } from "@/components/layout/DashboardProviders";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireAdmin } from "@/lib/auth";
import type { Language } from "@/lib/i18n/translations";

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
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "en") as Language;

  return (
    <DashboardProviders initialLang={lang}>
      <AdminAnalytics
        adminId={admin.id}
        email={admin.email}
        name={admin.name}
      />
      <DashboardShell>{children}</DashboardShell>
    </DashboardProviders>
  );
}
