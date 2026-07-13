"use client";

import { useEffect, useState } from "react";
import {
  BookOpenIcon,
  CaretRightIcon,
  DotsThreeIcon,
  FolderOpenIcon,
  PencilSimpleIcon,
  PlusIcon,
} from "@phosphor-icons/react";

import { PublishSwitch } from "@/components/content/PublishSwitch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  findLessonAncestors,
  titleLooksArabic,
} from "@/lib/content/filter-tree";
import type {
  AdminContentTreeChapter,
  AdminContentTreeLesson,
  AdminContentTreeResponse,
  AdminContentTreeUnit,
} from "@/lib/content/types";
import {
  ACCESS_LEVEL_LABELS,
  CONTENT_REGION_LABELS,
} from "@/lib/content/types";
import { cn } from "@/lib/utils";

export type ContentTreeActions = {
  onEditUnit: (unit: AdminContentTreeUnit) => void;
  onAddChapter: (unit: AdminContentTreeUnit) => void;
  onEditChapter: (
    unit: AdminContentTreeUnit,
    chapter: AdminContentTreeChapter,
  ) => void;
  onAddLesson: (
    unit: AdminContentTreeUnit,
    chapter: AdminContentTreeChapter,
  ) => void;
  onEditLesson: (
    unit: AdminContentTreeUnit,
    chapter: AdminContentTreeChapter,
    lesson: AdminContentTreeLesson,
  ) => void;
};

type ContentTreeProps = {
  tree: AdminContentTreeResponse;
  selectedLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
  emptyMessage?: string;
  expandAll?: boolean;
  actions?: ContentTreeActions;
};

function UnitBlock({
  unit,
  selectedLessonId,
  onSelectLesson,
  forcedOpen,
  expandAll,
  actions,
}: {
  unit: AdminContentTreeUnit;
  selectedLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
  forcedOpen: boolean;
  expandAll: boolean;
  actions?: ContentTreeActions;
}) {
  const shouldOpen = forcedOpen || expandAll;
  const [open, setOpen] = useState(() => Boolean(shouldOpen));
  const chapterCount = unit.chapters.length;
  const lessonCount = unit.chapters.reduce(
    (sum, chapter) => sum + chapter.lessons.length,
    0,
  );

  useEffect(() => {
    if (shouldOpen) setOpen(true);
  }, [shouldOpen]);

  return (
    <Collapsible open={open} onOpenChange={(next) => setOpen(next)}>
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        <div className="flex flex-col gap-3 border-b border-outline-variant p-4 sm:flex-row sm:items-center sm:justify-between">
          <CollapsibleTrigger className="flex min-w-0 flex-1 items-center gap-3 text-start">
            <CaretRightIcon
              className={cn(
                "size-5 shrink-0 text-on-surface-variant transition-transform",
                open && "rotate-90",
              )}
            />
            <Badge variant="secondary" className="shrink-0 uppercase">
              Unit
            </Badge>
            <div className="min-w-0">
              <h3
                className={cn(
                  "font-headline-sm text-headline-sm text-on-surface",
                  titleLooksArabic(unit.title) && "text-end",
                )}
                dir={titleLooksArabic(unit.title) ? "rtl" : undefined}
                lang={titleLooksArabic(unit.title) ? "ar" : undefined}
              >
                {unit.title}
              </h3>
              <p className="font-body-sm text-on-surface-variant">
                {CONTENT_REGION_LABELS[unit.region]} · {chapterCount} chapters ·{" "}
                {lessonCount} lessons
              </p>
            </div>
          </CollapsibleTrigger>
          <div className="flex shrink-0 items-center gap-2">
            {actions ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={`Unit actions for ${unit.title}`}
                  className="inline-flex size-7 items-center justify-center rounded-none text-on-surface-variant transition-colors hover:bg-muted hover:text-on-surface"
                >
                  <DotsThreeIcon className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => actions.onEditUnit(unit)}>
                    <PencilSimpleIcon />
                    Edit unit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => actions.onAddChapter(unit)}>
                    <PlusIcon />
                    Add chapter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
            <PublishSwitch
              entityType="unit"
              id={unit.id}
              title={unit.title}
              isPublished={unit.isPublished}
            />
          </div>
        </div>
        <CollapsibleContent>
          <div className="flex flex-col gap-6 p-6 pl-10">
            {unit.chapters.map((chapter) => (
              <ChapterBlock
                key={chapter.id}
                unit={unit}
                chapter={chapter}
                selectedLessonId={selectedLessonId}
                onSelectLesson={onSelectLesson}
                forcedOpen={
                  expandAll ||
                  (forcedOpen &&
                    chapter.lessons.some(
                      (lesson) => lesson.id === selectedLessonId,
                    ))
                }
                actions={actions}
              />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function ChapterBlock({
  unit,
  chapter,
  selectedLessonId,
  onSelectLesson,
  forcedOpen,
  actions,
}: {
  unit: AdminContentTreeUnit;
  chapter: AdminContentTreeChapter;
  selectedLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
  forcedOpen: boolean;
  actions?: ContentTreeActions;
}) {
  const shouldOpen =
    forcedOpen ||
    chapter.lessons.some((lesson) => lesson.id === selectedLessonId);
  const [open, setOpen] = useState(() => Boolean(shouldOpen));

  useEffect(() => {
    if (shouldOpen) setOpen(true);
  }, [shouldOpen]);

  return (
    <Collapsible open={open} onOpenChange={(next) => setOpen(next)}>
      <div className="relative flex flex-col gap-3 before:absolute before:top-0 before:bottom-0 before:-left-4 before:w-px before:bg-outline-variant">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CollapsibleTrigger className="flex min-w-0 flex-1 items-center gap-3 text-start">
            <CaretRightIcon
              className={cn(
                "size-4 shrink-0 text-on-surface-variant transition-transform",
                open && "rotate-90",
              )}
            />
            <FolderOpenIcon className="size-5 shrink-0 text-on-surface-variant" />
            <h4
              className={cn(
                "font-body-lg font-semibold text-on-surface",
                titleLooksArabic(chapter.title) && "text-end",
              )}
              dir={titleLooksArabic(chapter.title) ? "rtl" : undefined}
              lang={titleLooksArabic(chapter.title) ? "ar" : undefined}
            >
              {chapter.title}
            </h4>
          </CollapsibleTrigger>
          <div className="flex shrink-0 items-center gap-2">
            {actions ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={`Chapter actions for ${chapter.title}`}
                  className="inline-flex size-7 items-center justify-center rounded-none text-on-surface-variant transition-colors hover:bg-muted hover:text-on-surface"
                >
                  <DotsThreeIcon className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => actions.onEditChapter(unit, chapter)}
                  >
                    <PencilSimpleIcon />
                    Edit chapter
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => actions.onAddLesson(unit, chapter)}
                  >
                    <PlusIcon />
                    Add lesson
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
            <PublishSwitch
              entityType="chapter"
              id={chapter.id}
              title={chapter.title}
              isPublished={chapter.isPublished}
            />
          </div>
        </div>
        <CollapsibleContent>
          <div className="flex flex-col gap-3 pl-5">
            {chapter.lessons.map((lesson) => {
              const selected = lesson.id === selectedLessonId;
              const arabic = titleLooksArabic(lesson.title);
              return (
                <div
                  key={lesson.id}
                  className={cn(
                    "flex flex-col gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-3 sm:flex-row sm:items-center sm:justify-between",
                    selected && "border-primary ring-1 ring-primary/30",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelectLesson(lesson.id)}
                    className="flex min-w-0 flex-1 items-center gap-4 text-start transition-colors hover:opacity-90"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded bg-primary-fixed text-primary">
                      <BookOpenIcon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "font-body-md font-medium text-on-surface",
                          arabic && "text-end",
                        )}
                        dir={arabic ? "rtl" : undefined}
                        lang={arabic ? "ar" : undefined}
                      >
                        {lesson.title}
                      </p>
                      <p className="font-body-sm text-on-surface-variant">
                        {ACCESS_LEVEL_LABELS[lesson.accessLevel]}
                      </p>
                    </div>
                  </button>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline">
                      {ACCESS_LEVEL_LABELS[lesson.accessLevel]}
                    </Badge>
                    {actions ? (
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Edit ${lesson.title}`}
                        onClick={() =>
                          actions.onEditLesson(unit, chapter, lesson)
                        }
                      >
                        <PencilSimpleIcon />
                      </Button>
                    ) : null}
                    <PublishSwitch
                      entityType="lesson"
                      id={lesson.id}
                      title={lesson.title}
                      isPublished={lesson.isPublished}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function ContentTree({
  tree,
  selectedLessonId,
  onSelectLesson,
  emptyMessage = "No units in the curriculum yet.",
  expandAll = false,
  actions,
}: ContentTreeProps) {
  const ancestors = selectedLessonId
    ? findLessonAncestors(tree, selectedLessonId)
    : null;

  if (tree.units.length === 0) {
    return (
      <Empty className="min-h-56 rounded-xl border border-dashed border-outline-variant">
        <EmptyHeader>
          <EmptyTitle className="text-on-surface">No content</EmptyTitle>
          <EmptyDescription>{emptyMessage}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {tree.units.map((unit) => (
        <UnitBlock
          key={unit.id}
          unit={unit}
          selectedLessonId={selectedLessonId}
          onSelectLesson={onSelectLesson}
          forcedOpen={ancestors?.unitId === unit.id}
          expandAll={expandAll}
          actions={actions}
        />
      ))}
    </div>
  );
}
