"use client";

import type { ReactNode } from "react";

import { ContentErrorPanel } from "@/components/content/ContentErrorPanel";
import { ContentSkeleton } from "@/components/content/ContentSkeleton";
import { ContentView } from "@/components/content/ContentView";
import { PageHeader } from "@/components/layout/PageHeader";
import { isApiError } from "@/lib/api/errors";
import { useContentTree } from "@/lib/content/use-content-tree";

type ContentContainerProps = {
  lessonId: string | null;
  q: string;
};

function errorMessage(error: unknown): string | undefined {
  if (!isApiError(error)) return undefined;
  if (error.status === 404) {
    return "GET /content/admin/tree returned 404. Confirm the content module is deployed on this API.";
  }
  if (error.kind === "parse") {
    return "Content from the API did not match the expected AdminContentTreeResponse shape.";
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
        eyebrow={t("content.eyebrow")}
        title={t("content.title")}
        description={t("content.description")}
        className="mb-0"
      />
      {children}
    </div>
  );
}

export function ContentContainer({ lessonId, q }: ContentContainerProps) {
  const query = useContentTree();

  if (query.isPending) {
    return (
      <Frame>
        <ContentSkeleton />
      </Frame>
    );
  }

  if (query.isError) {
    return (
      <Frame>
        <ContentErrorPanel
          message={errorMessage(query.error)}
          onRetry={() => {
            void query.refetch();
          }}
        />
      </Frame>
    );
  }

  // Keep showing cached tree while background refetch runs (isFetching && !isPending).
  return <ContentView tree={query.data} lessonId={lessonId} q={q} />;
}
