"use client";

import { useEffect } from "react";
import { SignOutButton } from "@clerk/nextjs";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("[dashboard/error]", error);
  }, [error]);

  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-sm">
        <p className="font-display text-headline-sm font-bold text-on-surface">
          Admin API unavailable
        </p>
        <p className="mt-3 text-body-md text-on-surface-variant">
          The Mulhim Backend could not be reached or returned an error. Check
          that the API is running, then try again.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-body-md font-semibold text-on-primary transition-colors hover:bg-primary-container"
          >
            Retry
          </button>
          <SignOutButton redirectUrl="/login">
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-outline-variant px-4 text-body-md font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
            >
              Sign out
            </button>
          </SignOutButton>
        </div>
      </div>
    </main>
  );
}

