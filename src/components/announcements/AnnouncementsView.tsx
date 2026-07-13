"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AnnouncementsComposer } from "@/components/announcements/AnnouncementsComposer";
import { AnnouncementsList } from "@/components/announcements/AnnouncementsList";
import { PageHeader } from "@/components/layout/PageHeader";
import type { AdminAnnouncementListResponse } from "@/lib/announcements/types";

type AnnouncementsViewProps = {
  data: AdminAnnouncementListResponse;
  selectedId: string | null;
};

function buildHref(
  pathname: string,
  current: URLSearchParams,
  patch: Record<string, string | null>,
) {
  const next = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
  }
  const query = next.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function AnnouncementsView({
  data,
  selectedId,
}: AnnouncementsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return (
      data.announcements.find((item) => item.id === selectedId) ?? null
    );
  }, [data.announcements, selectedId]);

  const setSelectedId = useCallback(
    (id: string | null) => {
      router.replace(
        buildHref(pathname, searchParams, { id }),
        { scroll: false },
      );
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Announcements"
        title="Announcements"
        description="Create and manage regional broadcast messages."
        className="mb-0"
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <AnnouncementsComposer
            selected={selected}
            onCreated={(id) => setSelectedId(id)}
          />
        </div>
        <div className="lg:col-span-5">
          <AnnouncementsList
            announcements={data.announcements}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id)}
            onNew={() => setSelectedId(null)}
          />
        </div>
      </div>
    </div>
  );
}
