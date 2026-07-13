import { Suspense } from "react";

import { AnnouncementsContainer } from "@/components/announcements/AnnouncementsContainer";
import { AnnouncementsSkeleton } from "@/components/announcements/AnnouncementsSkeleton";
import { PageHeader } from "@/components/layout/PageHeader";

type AnnouncementsPageProps = {
  searchParams: Promise<{
    id?: string | string[];
  }>;
};

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function AnnouncementsPage({
  searchParams,
}: AnnouncementsPageProps) {
  const params = await searchParams;
  const idRaw = firstParam(params.id).trim();
  const selectedId = idRaw || null;

  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-8">
          <PageHeader
            eyebrow="Announcements"
            title="Announcements"
            description="Create and manage regional broadcast messages."
            className="mb-0"
          />
          <AnnouncementsSkeleton />
        </div>
      }
    >
      <AnnouncementsContainer selectedId={selectedId} />
    </Suspense>
  );
}
