"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ChapterFormDialog } from "@/components/content/ChapterFormDialog";
import { ContentLessonPanel } from "@/components/content/ContentLessonPanel";
import { ContentTreeSearchSkeleton } from "@/components/content/ContentSkeleton";
import { ContentToolbar } from "@/components/content/ContentToolbar";
import { ContentTree } from "@/components/content/ContentTree";
import { LessonFormDialog } from "@/components/content/LessonFormDialog";
import { UnitFormDialog } from "@/components/content/UnitFormDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  filterTreeByMatchingIds,
  findLessonAncestors,
  lessonExistsInTree,
} from "@/lib/content/filter-tree";
import type {
  AdminContentTreeChapter,
  AdminContentTreeLesson,
  AdminContentTreeResponse,
  AdminContentTreeUnit,
} from "@/lib/content/types";
import { useContentLesson } from "@/lib/content/use-content-lesson";
import { useContentSearch } from "@/lib/content/use-content-search";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type ContentViewProps = {
  tree: AdminContentTreeResponse;
  lessonId: string | null;
  q: string;
};

type DialogState =
  | { kind: "unit-create" }
  | { kind: "unit-edit"; unit: AdminContentTreeUnit }
  | { kind: "chapter-create"; unit: AdminContentTreeUnit }
  | {
      kind: "chapter-edit";
      unit: AdminContentTreeUnit;
      chapter: AdminContentTreeChapter;
    }
  | {
      kind: "lesson-create";
      unit: AdminContentTreeUnit;
      chapter: AdminContentTreeChapter;
    }
  | {
      kind: "lesson-edit";
      unit: AdminContentTreeUnit;
      chapter: AdminContentTreeChapter;
      lesson: AdminContentTreeLesson;
    }
  | null;

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

export function ContentView({ tree, lessonId, q }: ContentViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [draftQ, setDraftQ] = useState(q);
  const [dialog, setDialog] = useState<DialogState>(null);
  const { t, lang } = useTranslation();

  useEffect(() => {
    setDraftQ(q);
  }, [q]);

  const { matchingIds, isSearching } = useContentSearch({ tree, q: draftQ });

  const showSearchLoading = isSearching && matchingIds === null;
  const hasSearchQuery = Boolean(draftQ.trim());

  const displayTree = useMemo(() => {
    if (matchingIds === null) return tree;
    return filterTreeByMatchingIds(tree, matchingIds);
  }, [tree, matchingIds]);

  const expandSearchHits =
    hasSearchQuery && matchingIds !== null && matchingIds.length > 0;

  const lessonInTree = lessonId ? lessonExistsInTree(tree, lessonId) : false;
  const lessonQuery = useContentLesson(lessonInTree ? lessonId : null);

  const onSelectLesson = useCallback(
    (id: string) => {
      router.push(
        buildHref(pathname, searchParams, {
          lessonId: id,
        }),
      );
    },
    [pathname, router, searchParams],
  );

  const closeDialog = useCallback(() => setDialog(null), []);

  const treeActions = useMemo(
    () => ({
      onEditUnit: (unit: AdminContentTreeUnit) =>
        setDialog({ kind: "unit-edit", unit }),
      onAddChapter: (unit: AdminContentTreeUnit) =>
        setDialog({ kind: "chapter-create", unit }),
      onEditChapter: (
        unit: AdminContentTreeUnit,
        chapter: AdminContentTreeChapter,
      ) => setDialog({ kind: "chapter-edit", unit, chapter }),
      onAddLesson: (
        unit: AdminContentTreeUnit,
        chapter: AdminContentTreeChapter,
      ) => setDialog({ kind: "lesson-create", unit, chapter }),
      onEditLesson: (
        unit: AdminContentTreeUnit,
        chapter: AdminContentTreeChapter,
        lesson: AdminContentTreeLesson,
      ) => setDialog({ kind: "lesson-edit", unit, chapter, lesson }),
    }),
    [],
  );

  const editSelectedLesson = useCallback(() => {
    if (!lessonId) return;
    const ancestors = findLessonAncestors(tree, lessonId);
    if (!ancestors) return;
    const unit = tree.units.find((item) => item.id === ancestors.unitId);
    const chapter = unit?.chapters.find(
      (item) => item.id === ancestors.chapterId,
    );
    const lesson = chapter?.lessons.find((item) => item.id === lessonId);
    if (!unit || !chapter || !lesson) return;
    setDialog({ kind: "lesson-edit", unit, chapter, lesson });
  }, [lessonId, tree]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow={t("content.eyebrow")}
        title={t("content.title")}
        description={t("content.description")}
        className="mb-0"
      />
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        <ContentToolbar
          q={q}
          draftQ={draftQ}
          onDraftQChange={setDraftQ}
          isSearching={isSearching}
          onNewUnit={() => setDialog({ kind: "unit-create" })}
        />
        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-8">
            {showSearchLoading ? (
              <ContentTreeSearchSkeleton />
            ) : (
              <ContentTree
                tree={displayTree}
                selectedLessonId={lessonId}
                onSelectLesson={onSelectLesson}
                expandAll={expandSearchHits}
                actions={treeActions}
                emptyMessage={
                  hasSearchQuery
                    ? (lang === "ar" ? "لم تطابق أي وحدات أو فصول أو دروس هذا البحث." : "No units, chapters, or lessons matched this search.")
                    : (lang === "ar" ? "لا توجد وحدات في المنهج بعد." : "No units in the curriculum yet.")
                }
              />
            )}
          </div>
          <div className="lg:col-span-4">
            <ContentLessonPanel
              lessonId={lessonId}
              lessonInTree={lessonInTree}
              detail={lessonQuery.data}
              isPending={lessonQuery.isPending}
              isError={lessonQuery.isError}
              error={lessonQuery.error}
              onEditLesson={
                lessonInTree && lessonId ? editSelectedLesson : undefined
              }
            />
          </div>
        </div>
      </div>

      <UnitFormDialog
        open={dialog?.kind === "unit-create" || dialog?.kind === "unit-edit"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        unit={dialog?.kind === "unit-edit" ? dialog.unit : null}
        siblingSortOrders={tree.units.map((unit) => unit.sortOrder)}
      />

      <ChapterFormDialog
        open={
          dialog?.kind === "chapter-create" || dialog?.kind === "chapter-edit"
        }
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        unitId={
          dialog?.kind === "chapter-create" || dialog?.kind === "chapter-edit"
            ? dialog.unit.id
            : ""
        }
        chapter={dialog?.kind === "chapter-edit" ? dialog.chapter : null}
        siblingSortOrders={
          dialog?.kind === "chapter-create" || dialog?.kind === "chapter-edit"
            ? dialog.unit.chapters.map((chapter) => chapter.sortOrder)
            : []
        }
      />

      <LessonFormDialog
        open={
          dialog?.kind === "lesson-create" || dialog?.kind === "lesson-edit"
        }
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        chapterId={
          dialog?.kind === "lesson-create" || dialog?.kind === "lesson-edit"
            ? dialog.chapter.id
            : ""
        }
        lesson={dialog?.kind === "lesson-edit" ? dialog.lesson : null}
        siblingSortOrders={
          dialog?.kind === "lesson-create" || dialog?.kind === "lesson-edit"
            ? dialog.chapter.lessons.map((lesson) => lesson.sortOrder)
            : []
        }
        onCreated={onSelectLesson}
      />
    </div>
  );
}
