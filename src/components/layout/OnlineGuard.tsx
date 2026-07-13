"use client";

import { WifiSlashIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";

const NOT_CONNECTED_PATH = "/notconnected";

function isSafeInternalPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//");
}

function currentPath() {
  return `${window.location.pathname}${window.location.search}`;
}

function notConnectedHref(from: string) {
  return `${NOT_CONNECTED_PATH}?from=${encodeURIComponent(from)}`;
}

function readFromParam() {
  return new URLSearchParams(window.location.search).get("from");
}

function NotConnectedView({
  onRetry,
  stillOffline,
}: {
  onRetry: () => void;
  stillOffline: boolean;
}) {
  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant">
          <WifiSlashIcon aria-hidden className="size-6" weight="duotone" />
        </div>
        <p className="mt-5 font-display text-headline-sm font-bold text-on-surface">
          No internet connection
        </p>
        <p className="mt-3 text-body-md text-on-surface-variant">
          Mulhim Admin needs a network connection to sign in and load the
          dashboard. Check your connection, then try again.
        </p>
        {stillOffline ? (
          <p className="mt-3 text-body-sm text-error" role="status">
            Still offline. Reconnect and try again.
          </p>
        ) : null}
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-body-md font-semibold text-on-primary transition-colors hover:bg-primary-container"
          >
            Try again
          </button>
        </div>
      </div>
    </main>
  );
}

/**
 * When the browser goes offline, replace the app with the not-connected UI and
 * update the URL via history (no network). App Router soft navigations still
 * need the server, so they cannot open `/notconnected` while offline.
 */
export function OnlineGuard({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);
  const [stillOffline, setStillOffline] = useState(false);
  const returnToRef = useRef("/login");
  const isOfflineRef = useRef(false);

  const enterOffline = useCallback(() => {
    const path = currentPath();
    const from = path.startsWith(NOT_CONNECTED_PATH)
      ? (readFromParam() ?? "/login")
      : path;

    returnToRef.current = isSafeInternalPath(from) ? from : "/login";
    isOfflineRef.current = true;
    setIsOffline(true);
    setStillOffline(false);

    if (!window.location.pathname.startsWith(NOT_CONNECTED_PATH)) {
      window.history.replaceState(null, "", notConnectedHref(from));
    }
  }, []);

  const leaveOffline = useCallback(() => {
    const from = readFromParam() ?? returnToRef.current;
    const target = isSafeInternalPath(from) ? from : "/login";

    isOfflineRef.current = false;
    setIsOffline(false);
    setStillOffline(false);

    if (window.location.pathname.startsWith(NOT_CONNECTED_PATH)) {
      window.location.assign(target);
    }
  }, []);

  useEffect(() => {
    const onOffline = () => enterOffline();
    const onOnline = () => {
      if (
        isOfflineRef.current ||
        window.location.pathname.startsWith(NOT_CONNECTED_PATH)
      ) {
        leaveOffline();
      }
    };

    if (!navigator.onLine) {
      enterOffline();
    } else if (window.location.pathname.startsWith(NOT_CONNECTED_PATH)) {
      leaveOffline();
    }

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [enterOffline, leaveOffline]);

  const handleRetry = () => {
    if (!navigator.onLine) {
      setStillOffline(true);
      return;
    }
    leaveOffline();
  };

  if (isOffline) {
    return <NotConnectedView onRetry={handleRetry} stillOffline={stillOffline} />;
  }

  return children;
}
