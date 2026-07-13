"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import { publishContentEntity } from "@/lib/content/fetch-content";
import type {
  AdminChapterSummary,
  AdminContentTreeResponse,
  AdminLessonDetail,
  AdminUnitSummary,
  ContentEntityType,
} from "@/lib/content/types";
import { captureAdminEvent } from "@/lib/posthog/capture";
import { adminKeys } from "@/lib/query/keys";
import { toastAdminError } from "@/lib/toast/admin-toast";

type PublishVars = {
  entityType: ContentEntityType;
  id: string;
  publish: boolean;
};

function patchTreePublished(
  tree: AdminContentTreeResponse | undefined,
  entityType: ContentEntityType,
  id: string,
  isPublished: boolean,
  publishedAt: string | null,
): AdminContentTreeResponse | undefined {
  if (!tree) return tree;

  return {
    units: tree.units.map((unit) => {
      if (entityType === "unit" && unit.id === id) {
        return { ...unit, isPublished, publishedAt };
      }
      return {
        ...unit,
        chapters: unit.chapters.map((chapter) => {
          if (entityType === "chapter" && chapter.id === id) {
            return { ...chapter, isPublished, publishedAt };
          }
          return {
            ...chapter,
            lessons: chapter.lessons.map((lesson) => {
              if (entityType === "lesson" && lesson.id === id) {
                return { ...lesson, isPublished, publishedAt };
              }
              return lesson;
            }),
          };
        }),
      };
    }),
  };
}

function publishedAtFromResponse(
  entity: AdminUnitSummary | AdminChapterSummary | AdminLessonDetail,
): string | null {
  return entity.publishedAt;
}

export function useContentPublish() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: PublishVars) => {
      const token = await getToken();
      if (!token) {
        throw new ApiError({
          kind: "unauthorized",
          message: "[content] Clerk session has no token for publish",
          path: `/content/admin/${vars.entityType}s/${vars.id}`,
        });
      }
      const entity = await publishContentEntity(
        token,
        vars.entityType,
        vars.id,
        vars.publish,
      );
      return { vars, entity };
    },
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: adminKeys.content.tree() });
      if (vars.entityType === "lesson") {
        await queryClient.cancelQueries({
          queryKey: adminKeys.content.lesson(vars.id),
        });
      }

      const previousTree = queryClient.getQueryData<AdminContentTreeResponse>(
        adminKeys.content.tree(),
      );
      const previousLesson =
        vars.entityType === "lesson"
          ? queryClient.getQueryData<AdminLessonDetail>(
              adminKeys.content.lesson(vars.id),
            )
          : undefined;

      const optimisticAt = vars.publish ? new Date().toISOString() : null;
      queryClient.setQueryData(
        adminKeys.content.tree(),
        patchTreePublished(
          previousTree,
          vars.entityType,
          vars.id,
          vars.publish,
          optimisticAt,
        ),
      );

      if (vars.entityType === "lesson" && previousLesson) {
        queryClient.setQueryData<AdminLessonDetail>(
          adminKeys.content.lesson(vars.id),
          {
            ...previousLesson,
            isPublished: vars.publish,
            publishedAt: optimisticAt,
          },
        );
      }

      return { previousTree, previousLesson };
    },
    onError: (error, vars, context) => {
      if (context?.previousTree) {
        queryClient.setQueryData(
          adminKeys.content.tree(),
          context.previousTree,
        );
      }
      if (vars.entityType === "lesson" && context?.previousLesson) {
        queryClient.setQueryData(
          adminKeys.content.lesson(vars.id),
          context.previousLesson,
        );
      }
      toastAdminError(error);
    },
    onSuccess: ({ vars, entity }) => {
      const publishedAt = publishedAtFromResponse(entity);
      queryClient.setQueryData<AdminContentTreeResponse>(
        adminKeys.content.tree(),
        (current) =>
          patchTreePublished(
            current,
            vars.entityType,
            vars.id,
            entity.isPublished,
            publishedAt,
          ),
      );

      if (vars.entityType === "lesson") {
        queryClient.setQueryData(
          adminKeys.content.lesson(vars.id),
          entity as AdminLessonDetail,
        );
      }

      if (vars.publish) {
        captureAdminEvent("admin_content_published", {
          entityType: vars.entityType,
          entityId: vars.id,
        });
      }

      void queryClient.invalidateQueries({
        queryKey: adminKeys.content.tree(),
      });
      void queryClient.invalidateQueries({
        queryKey: [...adminKeys.content.all(), "search"],
      });
      if (vars.entityType === "lesson") {
        void queryClient.invalidateQueries({
          queryKey: adminKeys.content.lesson(vars.id),
        });
      }
    },
  });
}
