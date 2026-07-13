"use client";

import type { ReactNode } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { SupportErrorPanel } from "@/components/support/SupportErrorPanel";
import { SupportSkeleton } from "@/components/support/SupportSkeleton";
import { SupportView } from "@/components/support/SupportView";
import { isApiError } from "@/lib/api/errors";
import type { SupportRequestStatus } from "@/lib/domain/support-request-status";
import { emptySupportList } from "@/lib/support/mock-data";
import { useSupportList } from "@/lib/support/use-support-list";

type SupportContainerProps = {
  selectedId: string | null;
  q: string;
  status: SupportRequestStatus | "";
  emptyPreview?: boolean;
};

function errorMessage(error: unknown): string | undefined {
  if (!isApiError(error)) return undefined;
  if (error.status === 404) {
    return "GET /support/admin/requests returned 404. Confirm the support module is deployed on this API.";
  }
  if (error.kind === "parse") {
    return "Support requests from the API did not match the expected AdminSupportRequestListResponse shape.";
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
        eyebrow={t("support.eyebrow")}
        title={t("support.title")}
        description={t("support.description")}
        className="mb-0"
      />
      {children}
    </div>
  );
}

export function SupportContainer({
  selectedId,
  q,
  status,
  emptyPreview = false,
}: SupportContainerProps) {
  const filters = {
    q: q || undefined,
    status: status || undefined,
  };

  const query = useSupportList(filters, { enabled: !emptyPreview });

  if (emptyPreview) {
    return (
      <SupportView
        data={emptySupportList}
        selectedId={selectedId}
        q={q}
        status={status}
      />
    );
  }

  if (query.isPending) {
    return (
      <Frame>
        <SupportSkeleton />
      </Frame>
    );
  }

  if (query.isError) {
    return (
      <Frame>
        <SupportErrorPanel
          message={errorMessage(query.error)}
          onRetry={() => {
            void query.refetch();
          }}
        />
      </Frame>
    );
  }

  // Keep cached rows while invalidate refetch runs; dim via isFetching.
  return (
    <SupportView
      data={query.data}
      selectedId={selectedId}
      q={q}
      status={status}
      isRefreshing={query.isFetching}
    />
  );
}
