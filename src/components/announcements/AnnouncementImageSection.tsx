"use client";

import { useEffect, useRef, useState } from "react";
import { CloudArrowUpIcon, ImageIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { isApiError } from "@/lib/api/errors";
import { useUploadAnnouncementImage } from "@/lib/announcements/use-announcement-mutations";
import { MAX_ANNOUNCEMENT_IMAGE_SIZE_BYTES } from "@/lib/announcements/upload-constants";

type AnnouncementImageSectionProps = {
  announcementId: string | null;
  imageStorageKey: string | null;
};

export function AnnouncementImageSection({
  announcementId,
  imageStorageKey,
}: AnnouncementImageSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const upload = useUploadAnnouncementImage();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const disabled = !announcementId || upload.isPending;

  async function handleFile(file: File | undefined) {
    if (!file || !announcementId) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setUploadError(null);
    setUploadProgress(0);
    try {
      await upload.mutateAsync({
        announcementId,
        file,
        onProgress: setUploadProgress,
        signal: controller.signal,
      });
    } catch (error) {
      if (controller.signal.aborted) return;
      setUploadError(
        isApiError(error) ? error.message : "Image upload failed.",
      );
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      setUploadProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Featured image
        </p>
        {imageStorageKey ? (
          <span className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-on-surface">
            <ImageIcon className="size-4" aria-hidden />
            Image attached
          </span>
        ) : (
          <span className="text-body-sm text-on-surface-variant">
            No image yet
          </span>
        )}
      </div>

      {!announcementId ? (
        <p className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low px-4 py-6 text-center text-body-sm text-on-surface-variant">
          Save the announcement first, then upload an image (JPEG, PNG, or WebP,
          max {MAX_ANNOUNCEMENT_IMAGE_SIZE_BYTES / (1024 * 1024)} MB).
        </p>
      ) : (
        <label
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low px-6 py-8 transition-colors hover:border-primary hover:bg-surface-container ${
            disabled ? "pointer-events-none opacity-60" : ""
          }`}
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-surface-container-lowest">
            <CloudArrowUpIcon className="size-6 text-primary" aria-hidden />
          </div>
          <div className="text-center">
            <p className="font-body-md text-body-md font-semibold text-on-surface">
              {imageStorageKey ? "Replace image" : "Click to upload"}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              PNG, JPG or WEBP (Max.{" "}
              {MAX_ANNOUNCEMENT_IMAGE_SIZE_BYTES / (1024 * 1024)} MB)
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={disabled}
            onChange={(event) => {
              void handleFile(event.target.files?.[0]);
            }}
          />
        </label>
      )}

      {uploadProgress != null ? (
        <div className="space-y-2">
          <Progress value={uploadProgress} aria-label="Upload progress" />
          <p className="text-body-sm text-on-surface-variant">
            Uploading… {uploadProgress}%
          </p>
        </div>
      ) : null}

      {uploadError ? (
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-destructive" role="alert">
            {uploadError}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setUploadError(null)}
          >
            Dismiss
          </Button>
        </div>
      ) : null}
    </div>
  );
}
