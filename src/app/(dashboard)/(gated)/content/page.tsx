import { Suspense } from "react";

import { ContentContainer } from "@/components/content/ContentContainer";
import { ContentSkeleton } from "@/components/content/ContentSkeleton";
import { PageHeader } from "@/components/layout/PageHeader";

type ContentPageProps = {
  searchParams: Promise<{
    lessonId?: string | string[];
    q?: string | string[];
  }>;
};

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function ContentPage({ searchParams }: ContentPageProps) {
  const params = await searchParams;
  const lessonIdRaw = firstParam(params.lessonId).trim();
  const lessonId = lessonIdRaw || null;
  const q = firstParam(params.q);

  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-8">
          <PageHeader
            eyebrow="Content"
            title="Course Structure"
            description="Browse the Unit → Chapter → Lesson tree, publish levels, and inspect lesson media."
            className="mb-0"
          />
          <ContentSkeleton />
        </div>
      }
    >
      <ContentContainer lessonId={lessonId} q={q} />
    </Suspense>
  );
}
