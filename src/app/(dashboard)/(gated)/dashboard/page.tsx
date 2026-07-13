import { DashboardContainer } from "@/components/dashboard/DashboardContainer";
import { DashboardHeaderActions } from "@/components/dashboard/DashboardHeaderActions";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { PageHeader } from "@/components/layout/PageHeader";
import { emptyDashboardStats } from "@/lib/dashboard/mock-data";

type DashboardPageProps = {
  searchParams: Promise<{ state?: string | string[] }>;
};

function resolvePreviewState(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "loading" || raw === "empty") return raw;
  return null;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const preview = resolvePreviewState(params.state);

  if (preview === "loading") {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <PageHeader
            eyebrow="Overview"
            title="Analytics Dashboard"
            className="mb-0"
          />
          <DashboardHeaderActions />
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  if (preview === "empty") {
    return <DashboardView stats={emptyDashboardStats} />;
  }

  return <DashboardContainer />;
}
