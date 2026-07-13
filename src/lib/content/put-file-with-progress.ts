import { ApiError } from "@/lib/api/errors";

/**
 * Presigned R2 PUT with upload progress. fetch() cannot report upload progress;
 * only this step uses XMLHttpRequest.
 */
export function putFileWithProgress(
  uploadUrl: string,
  file: File,
  contentType: string,
  onProgress: (percent: number) => void,
  signal?: AbortSignal,
  /** Prefix for ApiError messages (e.g. content, announcements). */
  scope = "content",
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    const abort = () => {
      xhr.abort();
    };

    if (signal) {
      if (signal.aborted) {
        reject(
          new ApiError({
            kind: "network",
            message: `[${scope}] upload aborted before start`,
            path: uploadUrl,
          }),
        );
        return;
      }
      signal.addEventListener("abort", abort, { once: true });
    }

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || event.total <= 0) return;
      onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    };

    xhr.onload = () => {
      signal?.removeEventListener("abort", abort);
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
        return;
      }
      reject(
        new ApiError({
          kind: "client",
          message: `[${scope}] upload PUT failed with status ${xhr.status}`,
          path: uploadUrl,
          status: xhr.status,
        }),
      );
    };

    xhr.onerror = () => {
      signal?.removeEventListener("abort", abort);
      reject(
        new ApiError({
          kind: "network",
          message: `[${scope}] upload PUT network error`,
          path: uploadUrl,
        }),
      );
    };

    xhr.onabort = () => {
      signal?.removeEventListener("abort", abort);
      reject(
        new ApiError({
          kind: "network",
          message: `[${scope}] upload PUT aborted`,
          path: uploadUrl,
        }),
      );
    };

    xhr.send(file);
  });
}
