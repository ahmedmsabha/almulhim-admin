import posthog from "posthog-js";

/** UI analytics helpers. Prefer admin_* names; do not mirror backend lifecycle events. */
export function captureAdminEvent(
  event: string,
  properties?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  posthog.capture(event, properties);
}
