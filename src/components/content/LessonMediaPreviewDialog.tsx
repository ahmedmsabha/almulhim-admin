"use client";

import { EyeIcon } from "@phosphor-icons/react";

import { LessonPdfViewer } from "@/components/content/LessonPdfViewer";
import { LessonVideoPlayer } from "@/components/content/LessonVideoPlayer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiError } from "@/lib/api/errors";
import {
  usePdfViewUrl,
  useVideoPlaybackUrl,
} from "@/lib/content/use-media-preview-urls";

type PreviewTarget =
  | { kind: "video"; id: string; title: string }
  | { kind: "pdf"; id: string; title: string }
  | null;

type LessonMediaPreviewDialogProps = {
  target: PreviewTarget;
  onClose: () => void;
};

export function LessonMediaPreviewDialog({
  target,
  onClose,
}: LessonMediaPreviewDialogProps) {
  const open = target !== null;
  const videoId = target?.kind === "video" ? target.id : "";
  const pdfId = target?.kind === "pdf" ? target.id : "";

  const videoUrl = useVideoPlaybackUrl(videoId, {
    enabled: open && target?.kind === "video",
  });
  const pdfUrl = usePdfViewUrl(pdfId, {
    enabled: open && target?.kind === "pdf",
  });

  const previewQuery = target?.kind === "video" ? videoUrl : pdfUrl;
  const previewError =
    previewQuery.isError ?
      isApiError(previewQuery.error) ?
        previewQuery.error.message
      : "Could not load preview URL."
    : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {target?.kind === "pdf" ? "PDF preview" : "Video preview"}
          </DialogTitle>
          <DialogDescription>
            Streams the uploaded file from private storage via a short-lived
            signed URL — use this to check buffering, network delay, and
            playback quality before students see the lesson.
          </DialogDescription>
        </DialogHeader>

        {target ? (
          <div className="flex flex-col gap-3">
            <p className="font-body-md text-on-surface">{target.title}</p>

            {previewQuery.isPending ? (
              <Skeleton className="aspect-video w-full rounded-lg" />
            ) : previewError ? (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-high p-8 text-center">
                <p className="font-body-sm text-destructive">{previewError}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void previewQuery.refetch()}
                >
                  Retry
                </Button>
              </div>
            ) : target.kind === "video" && videoUrl.data?.url ? (
              <LessonVideoPlayer
                src={videoUrl.data.url}
                title={target.title}
              />
            ) : target.kind === "pdf" && pdfUrl.data?.url ? (
              <LessonPdfViewer src={pdfUrl.data.url} title={target.title} />
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function LessonMediaPreviewButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      aria-label={label}
      onClick={onClick}
    >
      <EyeIcon />
    </Button>
  );
}
