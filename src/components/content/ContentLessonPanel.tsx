"use client";

import {
  BookOpenIcon,
  PencilSimpleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

import { LessonMediaSection } from "@/components/content/LessonMediaSection";
import { PublishSwitch } from "@/components/content/PublishSwitch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiError } from "@/lib/api/errors";
import { titleLooksArabic } from "@/lib/content/filter-tree";
import type { AdminLessonDetail } from "@/lib/content/types";
import { ACCESS_LEVEL_LABELS } from "@/lib/content/types";
import { cn } from "@/lib/utils";

type ContentLessonPanelProps = {
  lessonId: string | null;
  lessonInTree: boolean;
  detail: AdminLessonDetail | undefined;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  onEditLesson?: () => void;
};

export function ContentLessonPanel({
  lessonId,
  lessonInTree,
  detail,
  isPending,
  isError,
  error,
  onEditLesson,
}: ContentLessonPanelProps) {
  if (!lessonId) {
    return (
      <Empty className="min-h-72 rounded-xl border border-outline-variant bg-surface-container-lowest">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BookOpenIcon />
          </EmptyMedia>
          <EmptyTitle className="text-on-surface">Select a lesson</EmptyTitle>
          <EmptyDescription>
            Choose a lesson from the tree to review publish state and media.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (!lessonInTree) {
    return (
      <Empty className="min-h-72 rounded-xl border border-outline-variant bg-surface-container-lowest">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <WarningCircleIcon />
          </EmptyMedia>
          <EmptyTitle className="text-on-surface">Lesson not found</EmptyTitle>
          <EmptyDescription>
            This lessonId is not in the current tree. The tree is unchanged;
            pick another lesson.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (isPending && !detail) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (isError || !detail) {
    const notFound = isApiError(error) && error.status === 404;
    return (
      <Empty className="min-h-72 rounded-xl border border-outline-variant bg-surface-container-lowest">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <WarningCircleIcon />
          </EmptyMedia>
          <EmptyTitle className="text-on-surface">
            {notFound ? "Lesson not found" : "Could not load lesson"}
          </EmptyTitle>
          <EmptyDescription>
            {notFound
              ? "The API returned 404 for this lesson. The tree is still available."
              : isApiError(error)
                ? error.message
                : "Retry by selecting the lesson again."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const arabic = titleLooksArabic(detail.title);

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="mb-1 font-label-md text-label-md text-on-surface-variant uppercase">
              Lesson detail
            </p>
            <h3
              className={cn(
                "font-headline-sm text-headline-sm text-on-surface",
                arabic && "text-end",
              )}
              dir={arabic ? "rtl" : undefined}
              lang={arabic ? "ar" : undefined}
            >
              {detail.title}
            </h3>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {onEditLesson ? (
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label="Edit lesson"
                onClick={onEditLesson}
              >
                <PencilSimpleIcon />
              </Button>
            ) : null}
            <PublishSwitch
              entityType="lesson"
              id={detail.id}
              title={detail.title}
              isPublished={detail.isPublished}
            />
          </div>
        </div>
        <Badge variant="outline" className="w-fit">
          {ACCESS_LEVEL_LABELS[detail.accessLevel]}
        </Badge>
      </div>

      <LessonMediaSection detail={detail} />
    </div>
  );
}
