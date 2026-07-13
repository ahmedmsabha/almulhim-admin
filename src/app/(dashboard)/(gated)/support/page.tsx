import { Suspense } from "react";

import { SupportContainer } from "@/components/support/SupportContainer";
import { SupportSkeleton } from "@/components/support/SupportSkeleton";
import { isSupportRequestStatus } from "@/lib/domain/support-request-status";
import type { SupportRequestStatus } from "@/lib/domain/support-request-status";

type SupportPageProps = {
  searchParams: Promise<{
    state?: string | string[];
    id?: string | string[];
    q?: string | string[];
    status?: string | string[];
  }>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function resolvePreviewState(value: string | string[] | undefined) {
  const raw = first(value);
  if (raw === "loading" || raw === "empty") return raw;
  return null;
}

function resolveStatus(
  value: string | string[] | undefined,
): SupportRequestStatus | "" {
  const raw = first(value);
  if (raw && isSupportRequestStatus(raw)) return raw;
  return "";
}

export default async function SupportPage({ searchParams }: SupportPageProps) {
  const params = await searchParams;
  const preview = resolvePreviewState(params.state);
  const selectedId = first(params.id)?.trim() || null;
  const q = first(params.q)?.trim() ?? "";
  const status = resolveStatus(params.status);

  if (preview === "loading") {
    return <SupportSkeleton />;
  }

  return (
    <Suspense fallback={<SupportSkeleton />}>
      <SupportContainer
        selectedId={selectedId}
        q={q}
        status={status}
        emptyPreview={preview === "empty"}
      />
    </Suspense>
  );
}
