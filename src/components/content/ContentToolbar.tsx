"use client";

import { useEffect, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CircleNotchIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type ContentToolbarProps = {
  /** Canonical URL `q` (for sync / shareable links). */
  q: string;
  /** Live input value — drives instant client search fallback. */
  draftQ: string;
  onDraftQChange: (value: string) => void;
  isSearching?: boolean;
  onNewUnit?: () => void;
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

export function ContentToolbar({
  q,
  draftQ,
  onDraftQChange,
  isSearching,
  onNewUnit,
}: ContentToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const busy = pending || Boolean(isSearching);
  const { t, lang } = useTranslation();

  useEffect(() => {
    if (draftQ === q) return;
    const handle = window.setTimeout(() => {
      startTransition(() => {
        router.push(
          buildHref(pathname, searchParams, {
            q: draftQ.trim() || null,
          }),
        );
      });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [draftQ, q, pathname, router, searchParams]);

  return (
    <div
      className="flex flex-col gap-3 border-b border-outline-variant bg-surface-container-low/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
      data-pending={busy ? "" : undefined}
    >
      <div className="relative w-full max-w-sm">
        <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 rtl:right-3 rtl:left-auto size-4 -translate-y-1/2 text-on-surface-variant" />
        <Input
          value={draftQ}
          onChange={(event) => onDraftQChange(event.target.value)}
          placeholder={t("content.toolbar.search")}
          aria-label={t("content.toolbar.search")}
          aria-busy={busy}
          className="h-9 rounded-lg border-outline-variant bg-surface-container-lowest pl-9 rtl:pl-4 rtl:pr-9 text-body-sm"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {isSearching ? (
          <p className="flex items-center gap-2 font-body-sm text-on-surface-variant">
            <CircleNotchIcon className="size-4 animate-spin" aria-hidden />
            {lang === "ar" ? "جاري البحث…" : "Matching…"}
          </p>
        ) : null}
        {onNewUnit ? (
          <Button
            type="button"
            size="sm"
            data-icon="inline-start"
            onClick={onNewUnit}
          >
            <PlusIcon />
            {lang === "ar" ? "وحدة جديدة" : "New unit"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
