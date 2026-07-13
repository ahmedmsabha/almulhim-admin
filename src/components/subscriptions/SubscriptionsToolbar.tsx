"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

import { Input } from "@/components/ui/input";

type SubscriptionsToolbarProps = {
  q: string;
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

export function SubscriptionsToolbar({ q }: SubscriptionsToolbarProps) {
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
      data-pending={pending ? "" : undefined}
    >
      <div className="relative w-full max-w-sm">
        <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-on-surface-variant" />
        <Input
          value={draftQ}
          onChange={(event) => setDraftQ(event.target.value)}
          placeholder="Search student name or email…"
          aria-label="Search pending subscriptions"
          className="h-9 rounded-lg border-outline-variant bg-surface-container-lowest pl-9 text-body-sm"
        />
      </div>
    </div>
  );
}
