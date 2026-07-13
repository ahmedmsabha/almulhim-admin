"use client";

import { MegaphoneIcon, PlusIcon } from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { CONTENT_REGION_LABELS } from "@/lib/content/types";
import type { AdminAnnouncementSummary } from "@/lib/announcements/types";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { cn } from "@/lib/utils";

type AnnouncementsListProps = {
  announcements: AdminAnnouncementSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
};

function formatDate(iso: string, lang: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function regionShort(region: AdminAnnouncementSummary["region"], lang: string) {
  if (lang === "ar") {
    if (region === "gaza") return "غزة";
    if (region === "west_bank") return "الضفة";
    if (region === "both") return "الكل";
    return region;
  }
  if (region === "gaza") return "GAZA";
  if (region === "west_bank") return "WB";
  return "BOTH";
}

export function AnnouncementsList({
  announcements,
  selectedId,
  onSelect,
  onNew,
}: AnnouncementsListProps) {
  const { t, lang } = useTranslation();

  return (
    <div className="flex max-h-[820px] flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
      <div className="flex items-center justify-between gap-3 border-b border-outline-variant px-6 py-4">
        <h3 className="font-display text-headline-sm font-semibold text-on-surface">
          {lang === "ar" ? "السجل الأخير" : "Recent history"}
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-icon="leading"
          onClick={onNew}
        >
          <PlusIcon className="size-4" aria-hidden />
          {lang === "ar" ? "جديد" : "New"}
        </Button>
      </div>

      {announcements.length === 0 ? (
        <Empty className="min-h-56 flex-1 rounded-none border-0 px-6">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MegaphoneIcon />
            </EmptyMedia>
            <EmptyTitle className="text-on-surface">
              {lang === "ar" ? "لا توجد إعلانات بعد" : "No announcements yet"}
            </EmptyTitle>
            <EmptyDescription>
              {lang === "ar"
                ? "قم بإنشاء إعلان على اليسار واحفظه. سيظهر هنا كمسودة حتى تقوم بنشره."
                : "Compose one on the left and save. It will appear here as a draft until you publish."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex-1 overflow-auto">
          <table
            className="w-full border-collapse text-left rtl:text-right"
            aria-label="Announcement history"
          >
            <thead className="sticky top-0 z-10 bg-surface-container-low">
              <tr>
                <th className="px-4 py-3 font-label-md text-label-md uppercase text-on-surface-variant">
                  {lang === "ar" ? "الموضوع" : "Subject"}
                </th>
                <th className="px-4 py-3 font-label-md text-label-md uppercase text-on-surface-variant">
                  {lang === "ar" ? "المنطقة" : "Region"}
                </th>
                <th className="px-4 py-3 text-right rtl:text-left font-label-md text-label-md uppercase text-on-surface-variant">
                  {lang === "ar" ? "الحالة" : "Status"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {announcements.map((item) => {
                const selected = item.id === selectedId;
                return (
                  <tr
                    key={item.id}
                    className={cn(
                      "transition-colors hover:bg-surface-container",
                      selected && "bg-surface-container-low",
                    )}
                  >
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        className="w-full text-start rtl:text-right"
                        onClick={() => onSelect(item.id)}
                        aria-current={selected ? "true" : undefined}
                      >
                        <p
                          className="font-body-md text-body-md font-semibold text-on-surface text-start rtl:text-right"
                          dir="auto"
                        >
                          {item.title}
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant text-start rtl:text-right">
                          {formatDate(item.createdAt, lang)}
                        </p>
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant="secondary"
                        className="text-[11px] font-bold"
                        title={t(`common.regions.${item.region}`)}
                      >
                        {regionShort(item.region, lang)}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right rtl:text-left">
                      {item.isPublished ? (
                        <Badge className="bg-status-active-bg text-[10px] font-bold uppercase tracking-wider text-status-active">
                          {lang === "ar" ? "منشور" : "Published"}
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-bold uppercase tracking-wider"
                        >
                          {lang === "ar" ? "مسودة" : "Draft"}
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
