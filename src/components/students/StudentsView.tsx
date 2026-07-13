import { PageHeader } from "@/components/layout/PageHeader";
import { StudentsHeaderActions } from "@/components/students/StudentsHeaderActions";
import { StudentsTable } from "@/components/students/StudentsTable";
import { StudentsToolbar } from "@/components/students/StudentsToolbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Region } from "@/lib/domain/region";
import type { SubscriptionStatus } from "@/lib/domain/subscription-status";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import type { StudentListResponse } from "@/lib/students/mock-data";

type StudentsViewProps = {
  data: StudentListResponse;
  q: string;
  region: Region | "";
  status: SubscriptionStatus | "";
  includeDeactivated: boolean;
};

export function StudentsView({
  data,
  q,
  region,
  status,
  includeDeactivated,
}: StudentsViewProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          eyebrow={t("students.eyebrow")}
          title={t("students.title")}
          description={t("students.description")}
          className="mb-0"
        />
        <StudentsHeaderActions />
      </div>
      <Card className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest py-0 ring-0">
        <CardHeader className="gap-0 border-b border-outline-variant px-0 py-0">
          <div className="flex items-center justify-between px-6 py-4">
            <CardTitle className="text-headline-sm font-display text-on-surface">
              {t("students.enrollmentDirectory")}
            </CardTitle>
          </div>
          <StudentsToolbar
            q={q}
            region={region}
            status={status}
            includeDeactivated={includeDeactivated}
          />
        </CardHeader>
        <CardContent className="px-0">
          <StudentsTable data={data} />
        </CardContent>
      </Card>
    </div>
  );
}
