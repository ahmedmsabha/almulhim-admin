"use client";

import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FilePdfIcon,
  PencilSimpleIcon,
  PlayCircleIcon,
  TrashIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { useForm } from "react-hook-form";

import {
  LessonMediaPreviewButton,
  LessonMediaPreviewDialog,
} from "@/components/content/LessonMediaPreviewDialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { isApiError } from "@/lib/api/errors";
import { formatDuration } from "@/lib/content/filter-tree";
import {
  pdfMetaFormSchema,
  pdfMetaToUpdateBody,
  videoMetaFormSchema,
  videoMetaToUpdateBody,
  type PdfMetaFormInput,
  type PdfMetaFormValues,
  type VideoMetaFormInput,
  type VideoMetaFormValues,
} from "@/lib/content/form-schema";
import { nextSortOrder } from "@/lib/content/next-sort-order";
import type { AdminLessonDetail, AdminPdf, AdminVideo } from "@/lib/content/types";
import {
  useDeletePdf,
  useDeleteVideo,
  useUpdatePdf,
  useUpdateVideo,
  useUploadLessonPdf,
  useUploadLessonVideo,
} from "@/lib/content/use-content-mutations";
import {
  MAX_PDF_SIZE_BYTES,
  PDF_CONTENT_TYPE,
  VIDEO_CONTENT_TYPE,
} from "@/lib/content/upload-constants";
import { nestFieldErrorsFromApiError } from "@/lib/plans/nest-field-errors";

type LessonMediaSectionProps = {
  detail: AdminLessonDetail;
};

type DeleteTarget =
  | { kind: "video"; item: AdminVideo }
  | { kind: "pdf"; item: AdminPdf }
  | null;

type EditTarget =
  | { kind: "video"; item: AdminVideo }
  | { kind: "pdf"; item: AdminPdf }
  | null;

type PreviewTarget =
  | { kind: "video"; id: string; title: string }
  | { kind: "pdf"; id: string; title: string }
  | null;

export function LessonMediaSection({ detail }: LessonMediaSectionProps) {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingKind, setUploadingKind] = useState<"video" | "pdf" | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [previewTarget, setPreviewTarget] = useState<PreviewTarget>(null);

  const uploadVideo = useUploadLessonVideo();
  const uploadPdf = useUploadLessonPdf();
  const deleteVideo = useDeleteVideo();
  const deletePdf = useDeletePdf();
  const updateVideo = useUpdateVideo();
  const updatePdf = useUpdatePdf();

  const videoForm = useForm<VideoMetaFormInput, unknown, VideoMetaFormValues>({
    resolver: zodResolver(videoMetaFormSchema),
    defaultValues: { title: "", sortOrder: 0, durationSeconds: "" },
  });

  const pdfForm = useForm<PdfMetaFormInput, unknown, PdfMetaFormValues>({
    resolver: zodResolver(pdfMetaFormSchema),
    defaultValues: { title: "", sortOrder: 0 },
  });

  const uploading = uploadVideo.isPending || uploadPdf.isPending;
  const deleting = deleteVideo.isPending || deletePdf.isPending;

  async function handleVideoFile(file: File | undefined) {
    if (!file) return;
    setUploadError(null);
    setUploadingKind("video");
    setUploadProgress(0);
    try {
      await uploadVideo.mutateAsync({
        lessonId: detail.id,
        file,
        title: file.name.replace(/\.mp4$/i, ""),
        sortOrder: nextSortOrder(detail.videos.map((item) => item.sortOrder)),
        onProgress: setUploadProgress,
      });
    } catch (error) {
      setUploadError(
        isApiError(error) ? error.message : "Video upload failed.",
      );
    } finally {
      setUploadingKind(null);
      setUploadProgress(null);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  }

  async function handlePdfFile(file: File | undefined) {
    if (!file) return;
    setUploadError(null);
    setUploadingKind("pdf");
    setUploadProgress(0);
    try {
      await uploadPdf.mutateAsync({
        lessonId: detail.id,
        file,
        title: file.name.replace(/\.pdf$/i, ""),
        sortOrder: nextSortOrder(detail.pdfs.map((item) => item.sortOrder)),
        onProgress: setUploadProgress,
      });
    } catch (error) {
      setUploadError(isApiError(error) ? error.message : "PDF upload failed.");
    } finally {
      setUploadingKind(null);
      setUploadProgress(null);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  }

  function openEdit(target: EditTarget) {
    if (!target) return;
    setEditTarget(target);
    if (target.kind === "video") {
      videoForm.reset({
        title: target.item.title ?? "",
        sortOrder: target.item.sortOrder,
        durationSeconds:
          target.item.durationSeconds != null
            ? String(target.item.durationSeconds)
            : "",
      });
    } else {
      pdfForm.reset({
        title: target.item.title ?? "",
        sortOrder: target.item.sortOrder,
      });
    }
  }

  async function onSaveVideoMeta(values: VideoMetaFormValues) {
    if (!editTarget || editTarget.kind !== "video") return;
    videoForm.clearErrors();
    try {
      await updateVideo.mutateAsync({
        videoId: editTarget.item.id,
        lessonId: detail.id,
        body: videoMetaToUpdateBody(values),
      });
      setEditTarget(null);
    } catch (error) {
      const mapped = nestFieldErrorsFromApiError(error);
      for (const [key, message] of Object.entries(mapped)) {
        videoForm.setError(key as keyof VideoMetaFormValues, { message });
      }
      if (Object.keys(mapped).length === 0) {
        videoForm.setError("root", {
          message: isApiError(error) ? error.message : "Could not update video.",
        });
      }
    }
  }

  async function onSavePdfMeta(values: PdfMetaFormValues) {
    if (!editTarget || editTarget.kind !== "pdf") return;
    pdfForm.clearErrors();
    try {
      await updatePdf.mutateAsync({
        pdfId: editTarget.item.id,
        lessonId: detail.id,
        body: pdfMetaToUpdateBody(values),
      });
      setEditTarget(null);
    } catch (error) {
      const mapped = nestFieldErrorsFromApiError(error);
      for (const [key, message] of Object.entries(mapped)) {
        pdfForm.setError(key as keyof PdfMetaFormValues, { message });
      }
      if (Object.keys(mapped).length === 0) {
        pdfForm.setError("root", {
          message: isApiError(error) ? error.message : "Could not update PDF.",
        });
      }
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.kind === "video") {
        await deleteVideo.mutateAsync({
          videoId: deleteTarget.item.id,
          lessonId: detail.id,
        });
      } else {
        await deletePdf.mutateAsync({
          pdfId: deleteTarget.item.id,
          lessonId: detail.id,
        });
      }
      setDeleteTarget(null);
    } catch {
      // Keep dialog open; surface via mutation error below if needed.
    }
  }

  return (
    <>
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="font-label-md text-label-md text-on-surface-variant uppercase">
            Videos
          </h4>
          <div>
            <input
              ref={videoInputRef}
              type="file"
              accept={VIDEO_CONTENT_TYPE}
              className="sr-only"
              onChange={(event) =>
                void handleVideoFile(event.target.files?.[0])
              }
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={uploading}
              data-icon="inline-start"
              onClick={() => videoInputRef.current?.click()}
            >
              <UploadSimpleIcon />
              Add video
            </Button>
          </div>
        </div>
        <p className="font-body-sm text-on-surface-variant">
          MP4 only, up to 1 GB.
        </p>
        {detail.videos.length === 0 ? (
          <p className="font-body-sm text-on-surface-variant">No videos yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {detail.videos.map((video) => (
              <li
                key={video.id}
                className="flex flex-col gap-2 rounded-lg border border-outline-variant p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <PlayCircleIcon className="size-4 shrink-0 text-primary" />
                      <span className="font-body-md text-on-surface">
                        {video.title ?? "Untitled video"}
                      </span>
                    </div>
                    <p className="font-body-sm text-on-surface-variant">
                      {formatDuration(video.durationSeconds) ??
                        "Duration unknown"}{" "}
                      · order {video.sortOrder}
                    </p>
                    <p className="truncate font-label-md text-label-md text-on-surface-variant/80">
                      {video.storageKey}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <LessonMediaPreviewButton
                      label="Preview video"
                      onClick={() =>
                        setPreviewTarget({
                          kind: "video",
                          id: video.id,
                          title: video.title ?? "Untitled video",
                        })
                      }
                    />
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Edit video"
                      onClick={() => openEdit({ kind: "video", item: video })}
                    >
                      <PencilSimpleIcon />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Delete video"
                      onClick={() =>
                        setDeleteTarget({ kind: "video", item: video })
                      }
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="font-label-md text-label-md text-on-surface-variant uppercase">
            PDFs
          </h4>
          <div>
            <input
              ref={pdfInputRef}
              type="file"
              accept={PDF_CONTENT_TYPE}
              className="sr-only"
              onChange={(event) => void handlePdfFile(event.target.files?.[0])}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={uploading}
              data-icon="inline-start"
              onClick={() => pdfInputRef.current?.click()}
            >
              <UploadSimpleIcon />
              Add PDF
            </Button>
          </div>
        </div>
        <p className="font-body-sm text-on-surface-variant">
          PDF only, up to {Math.round(MAX_PDF_SIZE_BYTES / (1024 * 1024))} MB.
        </p>
        {detail.pdfs.length === 0 ? (
          <p className="font-body-sm text-on-surface-variant">No PDFs yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {detail.pdfs.map((pdf) => (
              <li
                key={pdf.id}
                className="flex flex-col gap-2 rounded-lg border border-outline-variant p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <FilePdfIcon className="size-4 shrink-0 text-tertiary" />
                      <span className="font-body-md text-on-surface">
                        {pdf.title ?? "Untitled PDF"}
                      </span>
                    </div>
                    <p className="font-body-sm text-on-surface-variant">
                      Order {pdf.sortOrder}
                    </p>
                    <p className="truncate font-label-md text-label-md text-on-surface-variant/80">
                      {pdf.storageKey}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <LessonMediaPreviewButton
                      label="Preview PDF"
                      onClick={() =>
                        setPreviewTarget({
                          kind: "pdf",
                          id: pdf.id,
                          title: pdf.title ?? "Untitled PDF",
                        })
                      }
                    />
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Edit PDF"
                      onClick={() => openEdit({ kind: "pdf", item: pdf })}
                    >
                      <PencilSimpleIcon />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Delete PDF"
                      onClick={() =>
                        setDeleteTarget({ kind: "pdf", item: pdf })
                      }
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {uploadProgress !== null ? (
        <div className="flex flex-col gap-2 rounded-lg border border-outline-variant p-3">
          <p className="font-body-sm text-on-surface">
            Uploading {uploadingKind === "pdf" ? "PDF" : "video"}…{" "}
            {uploadProgress}%
          </p>
          <Progress value={uploadProgress} />
        </div>
      ) : null}

      {uploadError ? (
        <p className="font-body-sm text-destructive">{uploadError}</p>
      ) : null}

      <Dialog
        open={editTarget?.kind === "video"}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit video</DialogTitle>
            <DialogDescription>
              Update title, sort order, and duration. Replace the file by
              deleting and uploading again.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={videoForm.handleSubmit(onSaveVideoMeta)}
            className="flex flex-col gap-4"
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="video-title">Title</FieldLabel>
                <Input id="video-title" {...videoForm.register("title")} />
                <FieldError>
                  {videoForm.formState.errors.title?.message}
                </FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="video-sort">Sort order</FieldLabel>
                <Input
                  id="video-sort"
                  type="number"
                  min={0}
                  step={1}
                  {...videoForm.register("sortOrder")}
                />
                <FieldError>
                  {videoForm.formState.errors.sortOrder?.message}
                </FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="video-duration">
                  Duration (seconds)
                </FieldLabel>
                <Input
                  id="video-duration"
                  type="number"
                  min={1}
                  step={1}
                  {...videoForm.register("durationSeconds")}
                />
                <FieldError>
                  {videoForm.formState.errors.durationSeconds?.message}
                </FieldError>
              </Field>
            </FieldGroup>
            {videoForm.formState.errors.root?.message ? (
              <p className="font-body-sm text-destructive">
                {videoForm.formState.errors.root.message}
              </p>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTarget(null)}
                disabled={updateVideo.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateVideo.isPending}>
                {updateVideo.isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editTarget?.kind === "pdf"}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit PDF</DialogTitle>
            <DialogDescription>
              Update title and sort order. Replace the file by deleting and
              uploading again.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={pdfForm.handleSubmit(onSavePdfMeta)}
            className="flex flex-col gap-4"
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="pdf-title">Title</FieldLabel>
                <Input id="pdf-title" {...pdfForm.register("title")} />
                <FieldError>
                  {pdfForm.formState.errors.title?.message}
                </FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="pdf-sort">Sort order</FieldLabel>
                <Input
                  id="pdf-sort"
                  type="number"
                  min={0}
                  step={1}
                  {...pdfForm.register("sortOrder")}
                />
                <FieldError>
                  {pdfForm.formState.errors.sortOrder?.message}
                </FieldError>
              </Field>
            </FieldGroup>
            {pdfForm.formState.errors.root?.message ? (
              <p className="font-body-sm text-destructive">
                {pdfForm.formState.errors.root.message}
              </p>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTarget(null)}
                disabled={updatePdf.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updatePdf.isPending}>
                {updatePdf.isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <LessonMediaPreviewDialog
        target={previewTarget}
        onClose={() => setPreviewTarget(null)}
      />

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete{" "}
              {deleteTarget?.kind === "pdf" ? "PDF" : "video"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This removes the file from the lesson permanently. Replace a wrong
              upload by deleting then uploading again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
