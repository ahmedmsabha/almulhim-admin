"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { WarningCircleIcon } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

const WEAK_BPS_THRESHOLD = 500 * 1000;
const MAX_NETWORK_RETRIES = 3;

type LessonVideoPlayerProps = {
  src: string;
  title: string;
  className?: string;
};

function readDownlinkMbps(): number | null {
  if (typeof navigator === "undefined") return null;
  const connection = (
    navigator as Navigator & {
      connection?: { downlink?: number; effectiveType?: string };
    }
  ).connection;
  if (!connection || typeof connection.downlink !== "number") return null;
  return connection.downlink;
}

export function LessonVideoPlayer({
  src,
  title,
  className,
}: LessonVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const networkRetriesRef = useRef(0);
  const reloadKeyRef = useRef(0);

  const [weakConnection, setWeakConnection] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [fatalMessage, setFatalMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const safeSrc = src.trim();

  const resetPlayback = useCallback(() => {
    networkRetriesRef.current = 0;
    setWeakConnection(false);
    setBuffering(false);
    setReconnecting(false);
    setFatalMessage(null);
  }, []);

  useEffect(() => {
    resetPlayback();
    reloadKeyRef.current += 1;
    setReloadKey(reloadKeyRef.current);
  }, [safeSrc, resetPlayback]);

  useEffect(() => {
    if (!safeSrc) return;

    const poll = window.setInterval(() => {
      const downlinkMbps = readDownlinkMbps();
      if (downlinkMbps != null) {
        setWeakConnection(downlinkMbps * 1_000_000 < WEAK_BPS_THRESHOLD);
      }
    }, 2000);

    return () => window.clearInterval(poll);
  }, [safeSrc]);

  const retryPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const next = networkRetriesRef.current + 1;
    networkRetriesRef.current = next;

    if (next > MAX_NETWORK_RETRIES) {
      setFatalMessage(
        "Could not connect to the video server. Check your network.",
      );
      setReconnecting(false);
      return;
    }

    const delayMs = Math.min(8000, 400 * Math.pow(2, next - 1));
    setReconnecting(true);
    setFatalMessage(null);

    window.setTimeout(() => {
      try {
        video.load();
        void video.play().catch(() => {
          /* user gesture may be required */
        });
      } catch {
        setFatalMessage("Unexpected playback error.");
      } finally {
        setReconnecting(false);
      }
    }, delayMs);
  }, []);

  const onWaiting = useCallback(() => {
    setBuffering(true);
    setWeakConnection(true);
  }, []);

  const onPlaying = useCallback(() => {
    setBuffering(false);
    setReconnecting(false);
    setFatalMessage(null);
    networkRetriesRef.current = 0;
  }, []);

  const onStalled = useCallback(() => {
    setBuffering(true);
    setWeakConnection(true);
  }, []);

  const onError = useCallback(() => {
    retryPlayback();
  }, [retryPlayback]);

  if (!safeSrc) {
    return (
      <div
        className={cn(
          "flex aspect-video items-center justify-center rounded-lg bg-surface-container-high px-6 text-center font-body-sm text-on-surface-variant",
          className,
        )}
      >
        Video URL is not available.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-black shadow-sm",
        className,
      )}
    >
      {weakConnection ? (
        <div className="absolute start-3 top-3 z-[2] max-w-[min(100%-1.5rem,20rem)] rounded-md bg-amber-600/96 px-2 py-1 font-label-md text-[11px] font-semibold text-amber-50 shadow-xl">
          Weak connection — quality may drop or playback may pause
        </div>
      ) : null}

      {buffering || reconnecting || fatalMessage ? (
        <div className="absolute inset-x-3 top-14 z-[2] flex justify-center">
          <div className="flex max-w-xl items-start gap-2 rounded-md bg-black/92 px-3 py-2 font-body-sm text-xs font-medium text-white shadow-xl">
            <WarningCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              {fatalMessage ??
                (reconnecting ? "Reconnecting…" : "Buffering video…")}
            </span>
          </div>
        </div>
      ) : null}

      <video
        key={`${safeSrc}-${reloadKey}`}
        ref={videoRef}
        className="aspect-video h-full w-full"
        playsInline
        controls
        preload="metadata"
        src={safeSrc}
        title={title}
        onWaiting={onWaiting}
        onPlaying={onPlaying}
        onStalled={onStalled}
        onError={onError}
      />
    </div>
  );
}
