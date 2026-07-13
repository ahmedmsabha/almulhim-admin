"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

import { PageHeader } from "@/components/layout/PageHeader";
import { SupportList } from "@/components/support/SupportList";
import { SupportThread } from "@/components/support/SupportThread";
import { Input } from "@/components/ui/input";
import {
  SUPPORT_REQUEST_STATUS_LABELS,
  SUPPORT_REQUEST_STATUSES,
  type SupportRequestStatus,
} from "@/lib/domain/support-request-status";
import type { AdminSupportRequestListResponse } from "@/lib/support/types";
import { cn } from "@/lib/utils";

type SupportViewProps = {
  data: AdminSupportRequestListResponse;
  selectedId: string | null;
  q: string;
  status: SupportRequestStatus | "";
  /** Background list refetch after reply/close (or filter change). */
  isRefreshing?: boolean;
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
  next.delete("state");
  const query = next.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function SupportView({
  data,
  selectedId,
  q,
  status,
  isRefreshing = false,
}: SupportViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [draftQ, setDraftQ] = useState(q);

  useEffect(() => {
    setDraftQ(q);
  }, [q]);

  useEffect(() => {
    if (draftQ === q) return;
    const handle = window.setTimeout(() => {
      startTransition(() => {
        router.replace(
          buildHref(pathname, searchParams, {
            q: draftQ.trim() || null,
          }),
          { scroll: false },
        );
      });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [draftQ, q, pathname, router, searchParams]);

  const patchUrl = useCallback(
    (patch: Record<string, string | null>) => {
      startTransition(() => {
        router.replace(buildHref(pathname, searchParams, patch), {
          scroll: false,
        });
      });
    },
    [pathname, router, searchParams],
  );

  const requests = data.requests;

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return requests.find((item) => item.id === selectedId) ?? null;
  }, [requests, selectedId]);

  useEffect(() => {
    const firstId = requests[0]?.id ?? null;
    const visible =
      selectedId !== null && requests.some((item) => item.id === selectedId);

    if (requests.length === 0) {
      if (selectedId !== null) {
        patchUrl({ id: null });
      }
      return;
    }

    if (!visible) {
      if (firstId !== selectedId) {
        patchUrl({ id: firstId });
      }
    }
  }, [requests, selectedId, patchUrl]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Support"
        title="Support Inbox"
        description="Review student tickets, read the thread, and prepare replies."
        className="mb-0"
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by status"
        >
          <FilterChip
            label="All"
            active={status === ""}
            onClick={() => patchUrl({ status: null })}
          />
          {SUPPORT_REQUEST_STATUSES.map((value) => (
            <FilterChip
              key={value}
              label={SUPPORT_REQUEST_STATUS_LABELS[value]}
              active={status === value}
              onClick={() => patchUrl({ status: value })}
            />
          ))}
        </div>

        <div className="relative w-full max-w-sm">
          <MagnifyingGlassIcon
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant"
            aria-hidden
          />
          <Input
            value={draftQ}
            onChange={(event) => setDraftQ(event.target.value)}
            placeholder="Search name, email, or subject"
            className="ps-9"
            aria-label="Search support requests"
            disabled={pending}
          />
        </div>
      </div>

      <div className="flex min-h-[32rem] flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest md:flex-row md:h-[min(70vh,44rem)]">
        <div className="flex max-h-80 flex-col border-outline-variant md:max-h-none md:w-1/3 md:border-e">
          <SupportList
            requests={requests}
            selectedId={selected?.id ?? null}
            onSelect={(id) => patchUrl({ id })}
            isRefreshing={isRefreshing}
          />
        </div>
        <div className="flex min-h-[24rem] flex-1 flex-col md:min-h-0">
          <SupportThread request={selected} />
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full px-4 py-1.5 text-body-sm font-semibold transition-colors",
        active
          ? "bg-primary text-on-primary"
          : "text-on-surface-variant hover:bg-surface-container-low",
      )}
    >
      {label}
    </button>
  );
}
