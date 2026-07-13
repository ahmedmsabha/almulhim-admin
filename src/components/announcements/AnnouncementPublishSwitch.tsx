"use client";

import { isApiError } from "@/lib/api/errors";
import { useAnnouncementPublish } from "@/lib/announcements/use-announcement-mutations";
import { Switch } from "@/components/ui/switch";

type AnnouncementPublishSwitchProps = {
  id: string;
  title: string;
  isPublished: boolean;
};

export function AnnouncementPublishSwitch({
  id,
  title,
  isPublished,
}: AnnouncementPublishSwitchProps) {
  const publish = useAnnouncementPublish();
  const pending = publish.isPending && publish.variables?.id === id;
  const failed = publish.isError && publish.variables?.id === id;
  const errorMessage = failed
    ? isApiError(publish.error)
      ? publish.error.message
      : "Could not update publish state."
    : null;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="font-label-md text-label-md text-on-surface-variant">
          Published
        </span>
        <Switch
          checked={isPublished}
          disabled={pending}
          size="sm"
          aria-label={`${isPublished ? "Unpublish" : "Publish"} ${title}`}
          onCheckedChange={(next) => {
            publish.mutate({ id, publish: next });
          }}
        />
      </div>
      {errorMessage ? (
        <p className="max-w-64 text-xs text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
