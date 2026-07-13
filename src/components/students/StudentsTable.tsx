"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CaretLeftIcon, CaretRightIcon, UsersThreeIcon } from "@phosphor-icons/react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import type { StudentListResponse } from "@/lib/students/mock-data";

type StudentsTableProps = {
  data: StudentListResponse;
};

function initials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function shortId(id: string) {
  const tail = id.replace(/^user_/, "").slice(-6).toUpperCase();
  return `ST-${tail}`;
}

export function StudentsTable({ data }: StudentsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { students, total, page, pageSize } = data;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const maxPage = Math.max(1, Math.ceil(total / pageSize) || 1);
  const { t, lang } = useTranslation();

  function goToPage(nextPage: number) {
    const next = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) next.delete("page");
    else next.set("page", String(nextPage));
    next.delete("state");
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <>
      {students.length === 0 ? (
        <Empty className="min-h-56 rounded-none border-0 px-6">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersThreeIcon />
            </EmptyMedia>
            <EmptyTitle className="text-on-surface">{t("students.table.noStudents")}</EmptyTitle>
            <EmptyDescription>
              {t("students.table.noStudentsHint")}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Table aria-label="Students directory">
          <TableHeader>
            <TableRow className="border-outline-variant bg-surface-container-low/50 hover:bg-surface-container-low/50">
              <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                {t("students.table.student")}
              </TableHead>
              <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                {lang === "ar" ? "التواصل" : "Contact"}
              </TableHead>
              <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                {lang === "ar" ? "تيليجرام" : "Telegram"}
              </TableHead>
              <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                {t("students.table.region")}
              </TableHead>
              <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                {t("students.table.status")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow
                key={student.id}
                className="h-12 border-outline-variant hover:bg-surface-container-low"
              >
                <TableCell className="px-6 py-4">
                  <Link
                    href={`/students/${student.id}`}
                    className="flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-primary-container text-xs font-bold text-on-primary-container">
                        {initials(student.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex flex-col gap-0.5">
                      <span className="font-bold text-on-surface">
                        {student.fullName}
                      </span>
                      <span className="font-mono text-[11px] text-on-surface-variant">
                        ID: {shortId(student.id)}
                      </span>
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-body-md text-on-surface">
                      {student.email}
                    </span>
                    <span className="font-mono text-[11px] text-on-surface-variant">
                      {student.phone ?? (lang === "ar" ? "لا يوجد هاتف" : "No phone")}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  {student.telegram ? (
                    <span className="text-body-md text-primary">
                      {student.telegram}
                    </span>
                  ) : (
                    <span className="text-body-sm text-on-surface-variant">
                      {lang === "ar" ? "لا يوجد" : "None"}
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-6 py-4 text-on-surface-variant">
                  {t(`common.regions.${student.region}`)}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex flex-col items-start gap-1">
                    <StatusBadge status={student.subscriptionStatus} />
                    {student.deactivatedAt ? (
                      <span className="text-[11px] font-medium text-status-suspended">
                        {t("students.deactivatedLabel")}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <div className="flex flex-col gap-3 border-t border-outline-variant px-6 py-4 text-body-sm text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
        <span>
          {lang === "ar"
            ? `عرض ${from}-${to} من أصل ${total.toLocaleString("ar-EG")} من الطلاب`
            : `Showing ${from}-${to} of ${total.toLocaleString("en-US")} students`}
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            className="rounded-lg border-outline-variant"
            onClick={() => goToPage(page - 1)}
            aria-label="Previous page"
          >
            <CaretLeftIcon data-icon="inline-start" />
            {lang === "ar" ? "السابق" : "Prev"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= maxPage}
            className="rounded-lg border-outline-variant"
            onClick={() => goToPage(page + 1)}
            aria-label="Next page"
          >
            {lang === "ar" ? "التالي" : "Next"}
            <CaretRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </>
  );
}
