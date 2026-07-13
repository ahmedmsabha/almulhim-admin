import posthog from "posthog-js";

let initialized = false;

/**
 * Idempotent browser PostHog init. Safe to call from instrumentation-client
 * and from a root client bootstrap.
 */
export function initPostHogClient(): void {
  if (typeof window === "undefined" || initialized) return;

  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!token || !host) return;

  posthog.init(token, {
    api_host: host,
    defaults: "2026-05-30",
  });
  // Expose for debugging and any global consumers; module import stays canonical.
  (window as Window & { posthog?: typeof posthog }).posthog = posthog;
  initialized = true;
}
