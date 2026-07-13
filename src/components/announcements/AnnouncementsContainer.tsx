"use client";

import type { ReactNode } from "react";

import { AnnouncementsErrorPanel } from "@/components/announcements/AnnouncementsErrorPanel";
import { AnnouncementsSkeleton } from "@/components/announcements/AnnouncementsSkeleton";
import { AnnouncementsView } from "@/components/announcements/AnnouncementsView";
import { PageHeader } from "@/components/layout/PageHeader";
import { isApiError } from "@/lib/api/errors";
import { useAnnouncementsList } from "@/lib/announcements/use-announcements-list";

type AnnouncementsContainerProps = {
  selectedId: string | null;
};

function errorMessage(error: unknown): string | undefined {
  if (!isApiError(error)) return undefined;
  if (error.status === 404) {
    return "GET /announcements/admin returned 404. Confirm the announcements module is deployed on this API.";
  }
  if (error.kind === "parse") {
    return "Announcements from the API did not match the expected AdminAnnouncementListResponse shape.";
  }
  if (error.kind === "unauthorized") {
    return "Your session token was missing. Sign in again, then retry.";
  }
  if (error.kind === "network" || error.kind === "config") {
    return "Could not reach the Mulhim Backend. Check NEXT_PUBLIC_API_URL and that the API is running.";
  }
  return error.message;
}

import { useTranslation } from "@/lib/i18n/LanguageContext";

function Frame({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow={t("announcements.eyebrow")}
        title={t("announcements.title")}
        description={t("announcements.description")}
        className="mb-0"
      />
      {children}
    </div>
  );
}

export function AnnouncementsContainer({
  selectedId,
}: AnnouncementsContainerProps) {
  const query = useAnnouncementsList();

  if (query.isPending) {
    return (
      <Frame>
        <AnnouncementsSkeleton />
      </Frame>
    );
  }

  if (query.isError) {
    return (
      <Frame>
        <AnnouncementsErrorPanel
          message={errorMessage(query.error)}
          onRetry={() => {
            void query.refetch();
          }}
        />
      </Frame>
    );
  }

  return <AnnouncementsView data={query.data} selectedId={selectedId} />;
}
