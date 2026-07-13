"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REGIONS, type Region } from "@/lib/domain/region";
import {
  SUBSCRIPTION_STATUS_LABELS,
  type SubscriptionStatus,
} from "@/lib/domain/subscription-status";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const STATUS_OPTIONS = Object.keys(
  SUBSCRIPTION_STATUS_LABELS
) as SubscriptionStatus[];

type StudentsToolbarProps = {
  q: string;
  region: Region | "";
  status: SubscriptionStatus | "";
  includeDeactivated: boolean;
};

function buildHref(
  pathname: string,
  current: URLSearchParams,
  patch: Record<string, string | null>
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

export function StudentsToolbar({
  q,
  region,
  status,
  includeDeactivated,
}: StudentsToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [draftQ, setDraftQ] = useState(q);
  const { t } = useTranslation();

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
            page: "1",
          })
        );
      });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [draftQ, q, pathname, router, searchParams]);

  function updateFilter(patch: Record<string, string | null>) {
    startTransition(() => {
      router.push(buildHref(pathname, searchParams, { ...patch, page: "1" }));
    });
  }

  return (
    <div
      className="flex flex-col gap-3 border-b border-outline-variant bg-surface-container-low/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
      data-pending={pending ? "" : undefined}
    >
      <div className="relative w-full max-w-sm">
        <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 rtl:right-3 rtl:left-auto size-4 -translate-y-1/2 text-on-surface-variant" />
        <Input
          value={draftQ}
          onChange={(event) => setDraftQ(event.target.value)}
          placeholder={t("students.searchPlaceholder")}
          aria-label={t("students.searchPlaceholder")}
          className="h-9 rounded-lg border-outline-variant bg-surface-container-lowest pl-9 rtl:pl-4 rtl:pr-9 text-body-sm"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Select
          value={region || "all"}
          onValueChange={(value) =>
            updateFilter({
              region: value === "all" || value == null ? null : String(value),
            })
          }
        >
          <SelectTrigger
            className="h-9 min-w-40 rounded-lg border-outline-variant bg-surface-container-lowest text-body-sm"
            aria-label="Filter by region"
          >
            <SelectValue placeholder={t("students.allRegions")}>
              {(value) => (value === "all" || !value ? t("students.allRegions") : t(`common.regions.${value}`))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">{t("students.allRegions")}</SelectItem>
              {REGIONS.map((item) => (
                <SelectItem key={item} value={item}>
                  {t(`common.regions.${item}`)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          value={status || "all"}
          onValueChange={(value) =>
            updateFilter({
              status: value === "all" || value == null ? null : String(value),
            })
          }
        >
          <SelectTrigger
            className="h-9 min-w-44 rounded-lg border-outline-variant bg-surface-container-lowest text-body-sm"
            aria-label="Filter by subscription status"
          >
            <SelectValue placeholder={t("students.allStatuses")}>
              {(value) => (value === "all" || !value ? t("students.allStatuses") : t(`common.subscriptionStatuses.${value}`))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">{t("students.allStatuses")}</SelectItem>
              {STATUS_OPTIONS.map((item) => (
                <SelectItem key={item} value={item}>
                  {t(`common.subscriptionStatuses.${item}`)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <label className="flex h-9 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm text-on-surface-variant">
          <input
            type="checkbox"
            className="size-3.5 accent-primary"
            checked={includeDeactivated}
            onChange={(event) =>
              updateFilter({
                includeDeactivated: event.target.checked ? "true" : null,
              })
            }
          />
          {t("students.includeDeactivated")}
        </label>
      </div>
    </div>
  );
}
