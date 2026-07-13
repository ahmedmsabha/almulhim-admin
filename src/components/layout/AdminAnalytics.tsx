"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

type AdminAnalyticsProps = {
  adminId: string;
  email?: string;
  name?: string;
};

/**
 * Identifies the confirmed admin in PostHog.
 * Sign-out reset lives in root PostHogSessionReset (survives dashboard unmount).
 */
export function AdminAnalytics({ adminId, email, name }: AdminAnalyticsProps) {
  useEffect(() => {
    if (!adminId) return;

    posthog.identify(adminId, {
      ...(email ? { email } : {}),
      ...(name ? { name } : {}),
      role: "admin",
    });
  }, [adminId, email, name]);

  return null;
}
