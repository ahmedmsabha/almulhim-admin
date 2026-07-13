"use server";

import { runDevSubscriptionCheckout } from "@/lib/subscriptions/dev-seed-checkout";

export type SeedTestCheckoutState =
  | { ok: true; subscriptionId: string; studentEmail: string }
  | { ok: false; error: string };

export async function seedTestCheckoutAction(
  _prev: SeedTestCheckoutState | null,
  formData: FormData,
): Promise<SeedTestCheckoutState> {
  if (process.env.NODE_ENV === "production") {
    return { ok: false, error: "Test checkout is disabled in production." };
  }

  try {
    const planId = String(formData.get("planId") ?? "");
    const senderName = String(formData.get("senderName") ?? "");
    const receipt = formData.get("receipt");
    if (!(receipt instanceof File) || receipt.size === 0) {
      return { ok: false, error: "Choose a receipt image (JPEG, PNG, or WebP)." };
    }

    const result = await runDevSubscriptionCheckout({
      planId,
      senderName,
      receipt,
    });
    return {
      ok: true,
      subscriptionId: result.subscriptionId,
      studentEmail: result.studentEmail,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Test checkout failed.";
    return { ok: false, error: message };
  }
}
