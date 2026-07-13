"use client";

import { useEffect } from "react";
import { initPostHogClient } from "@/lib/posthog/init-client";

/**
 * Ensures PostHog init runs even when Turbopack's instrumentation-client
 * chunk list is stale (common after adding the file without a full restart).
 */
export function PostHogBootstrap() {
  useEffect(() => {
    initPostHogClient();
  }, []);

  return null;
}
