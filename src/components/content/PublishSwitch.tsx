"use client";

import { isApiError } from "@/lib/api/errors";
import { useContentPublish } from "@/lib/content/use-content-publish";
import type { ContentEntityType } from "@/lib/content/types";
import { Switch } from "@/components/ui/switch";

type PublishSwitchProps = {
  entityType: ContentEntityType;
  id: string;
  title: string;
  isPublished: boolean;
};

export function PublishSwitch({
  entityType,
  id,
  title,
  isPublished,
}: PublishSwitchProps) {
  const publish = useContentPublish();
  const pending =
    publish.isPending &&
    publish.variables?.id === id &&
    publish.variables?.entityType === entityType;
  const failed =
    publish.isError &&
    publish.variables?.id === id &&
    publish.variables?.entityType === entityType;
  const errorMessage = failed
    ? isApiError(publish.error)
      ? publish.error.message
      : "Could not update publish state."
    : null;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="font-label-md text-label-md text-on-surface-variant">
          Publish
        </span>
        <Switch
          checked={isPublished}
          disabled={pending}
          size="sm"
          aria-label={`${isPublished ? "Unpublish" : "Publish"} ${title}`}
          onCheckedChange={(next) => {
            publish.mutate({ entityType, id, publish: next });
          }}
        />
      </div>
      {errorMessage ? (
        <p className="max-w-48 text-xs text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
