"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { CircleNotchIcon, MinusIcon, PlusIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PdfJsLite = Pick<
  typeof import("pdfjs-dist"),
  "getDocument" | "GlobalWorkerOptions"
>;

let pdfjsPromise: Promise<PdfJsLite> | null = null;

async function ensurePdfJs(): Promise<PdfJsLite> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.mjs`;
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

type PdfPageCanvasProps = {
  doc: PDFDocumentProxy;
  pageNumber: number;
  maxWidthPx: number;
  zoomMultiplier: number;
};

function PdfPageCanvas({
  doc,
  pageNumber,
  maxWidthPx,
  zoomMultiplier,
}: PdfPageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const taskRef = useRef<{ cancel: () => void } | null>(null);

  useEffect(() => {
    let alive = true;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    async function paint() {
      if (!canvas || !ctx || maxWidthPx < 64) return;
      const page = await doc.getPage(pageNumber);
      if (!alive) {
        page.cleanup();
        return;
      }
      const base = page.getViewport({ scale: 1 });
      const fit = maxWidthPx / base.width;
      const scale = fit * zoomMultiplier;
      const viewport = page.getViewport({ scale });

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      const renderTask = page.render({
        canvas,
        canvasContext: ctx,
        viewport,
        transform: [dpr, 0, 0, dpr, 0, 0],
      });

      taskRef.current = renderTask;

      try {
        await renderTask.promise;
      } finally {
        page.cleanup();
        if (taskRef.current === renderTask) {
          taskRef.current = null;
        }
      }
    }

    void paint().catch(() => {
      /* handled by parent */
    });

    return () => {
      alive = false;
      taskRef.current?.cancel();
      taskRef.current = null;
    };
  }, [doc, pageNumber, maxWidthPx, zoomMultiplier]);

  return (
    <div className="flex w-full justify-center bg-white">
      <canvas ref={canvasRef} className="block max-w-full shadow-sm" />
    </div>
  );
}

type LessonPdfViewerProps = {
  src: string;
  title?: string;
  className?: string;
  frameClassName?: string;
};

export function LessonPdfViewer({
  src,
  title,
  className,
  frameClassName,
}: LessonPdfViewerProps) {
  const safeSrc = src.trim();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [maxW, setMaxW] = useState(600);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (typeof w === "number" && w > 0) {
        setMaxW(Math.floor(w - 8));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!safeSrc) return;
    let cancelled = false;
    let proxy: PDFDocumentProxy | null = null;

    async function load() {
      setLoading(true);
      setLoadError(null);
      setDoc(null);
      setNumPages(0);

      try {
        const pdfjs = await ensurePdfJs();
        const task = pdfjs.getDocument({
          url: safeSrc,
          withCredentials: false,
        });
        proxy = await task.promise;
        if (cancelled) {
          await proxy.destroy();
          return;
        }
        setDoc(proxy);
        setNumPages(proxy.numPages);
      } catch {
        if (!cancelled) {
          setLoadError("Could not open the PDF in the browser.");
        }
        if (proxy && !cancelled) {
          try {
            await proxy.destroy();
          } catch {
            /* ignore */
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
      if (proxy) {
        void proxy.destroy();
      }
    };
  }, [safeSrc]);

  const zoomIn = useCallback(
    () => setZoom((z) => Math.min(2.75, +(z + 0.15).toFixed(2))),
    [],
  );
  const zoomOut = useCallback(
    () => setZoom((z) => Math.max(0.65, +(z - 0.15).toFixed(2))),
    [],
  );

  if (!safeSrc) {
    return (
      <div
        className={cn(
          "flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-xl border border-outline-variant bg-surface-container-high p-8",
          className,
        )}
      >
        <p className="text-center font-body-sm text-on-surface-variant">
          PDF URL is not available.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-outline-variant bg-surface-container-high px-2 py-1.5 font-body-sm text-on-surface-variant">
        <span className="truncate ps-1" dir="ltr">
          {title ?? "PDF"}
          {!loading && numPages > 0 ? ` · ${numPages} pages` : null}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={zoomOut}
            aria-label="Zoom out"
          >
            <MinusIcon />
          </Button>
          <span className="min-w-12 text-center tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={zoomIn}
            aria-label="Zoom in"
          >
            <PlusIcon />
          </Button>
        </div>
      </div>

      <div
        ref={wrapRef}
        dir="ltr"
        onContextMenu={(event) => {
          event.preventDefault();
        }}
        className={cn(
          "relative max-h-[70vh] min-h-[50vh] w-full select-none overflow-y-auto rounded-xl border border-outline-variant bg-surface-container-high shadow-inner",
          frameClassName,
        )}
      >
        {loading ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2">
            <CircleNotchIcon
              className="size-10 animate-spin text-on-surface-variant"
              aria-hidden
            />
            <p className="font-body-sm text-on-surface-variant">
              Opening PDF…
            </p>
          </div>
        ) : loadError ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 p-6 text-center font-body-sm text-on-surface-variant">
            {loadError}
          </div>
        ) : doc ? (
          <div className="flex flex-col gap-3 p-3">
            {Array.from({ length: numPages }, (_, index) => (
              <PdfPageCanvas
                key={`${safeSrc}-p${index + 1}`}
                doc={doc}
                pageNumber={index + 1}
                maxWidthPx={maxW}
                zoomMultiplier={zoom}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
