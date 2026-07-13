"use client";

import { useAuth } from "@clerk/nextjs";
import posthog from "posthog-js";
import { useEffect, useRef } from "react";

import { clearBrowserQueryClient } from "@/lib/query/get-query-client";

/**
 * Resets PostHog and admin Query cache when the Clerk session ends.
 * Lives at the root so it still runs after the dashboard (and AdminAnalytics) unmounts.
 */
export function PostHogSessionReset() {
  const { isLoaded, isSignedIn } = useAuth();
  const wasSignedInRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (wasSignedInRef.current && isSignedIn === false) {
      posthog.reset();
      clearBrowserQueryClient();
    }

    wasSignedInRef.current = Boolean(isSignedIn);
  }, [isLoaded, isSignedIn]);

  return null;
}
