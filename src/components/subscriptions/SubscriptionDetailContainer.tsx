"use client";

import Link from "next/link";

import { SubscriptionDetailSkeleton } from "@/components/subscriptions/SubscriptionDetailSkeleton";
import { SubscriptionDetailView } from "@/components/subscriptions/SubscriptionDetailView";
import { SubscriptionsErrorPanel } from "@/components/subscriptions/SubscriptionsErrorPanel";
import { isApiError } from "@/lib/api/errors";
import { useSubscriptionDetail } from "@/lib/subscriptions/use-subscription-detail";
import { useSubscriptionReceiptUrl } from "@/lib/subscriptions/use-subscription-receipt-url";

type SubscriptionDetailContainerProps = {
  subscriptionId: string;
};

function detailErrorMessage(error: unknown): string | undefined {
  if (!isApiError(error)) return undefined;
  if (error.status === 404) {
    return "No subscription exists for this id.";
  }
  if (error.status === 400) {
    return "That subscription id is not a valid UUID.";
  }
  if (error.kind === "parse") {
    return "Subscription from the API did not match the expected shape.";
  }
  if (error.kind === "unauthorized") {
    return "Your session token was missing. Sign in again, then retry.";
  }
  if (error.kind === "network" || error.kind === "config") {
    return "Could not reach the Mulhim Backend. Check NEXT_PUBLIC_API_URL and that the API is running.";
  }
  return error.message;
}

function receiptErrorMessage(error: unknown): string {
  if (!isApiError(error)) return "Could not load the signed receipt URL.";
  // Nest returns 404 when the subscription id is unknown; 400 when
  // `receiptStorageKey` is absent (no receipt uploaded yet).
  if (error.status === 404 || error.status === 400) {
    return "Nest could not find a receipt for this subscription.";
  }
  if (error.kind === "parse") {
    return "Receipt URL response did not match the expected shape.";
  }
  if (error.kind === "unauthorized") {
    return "Your session token was missing. Sign in again, then retry.";
  }
  if (error.kind === "network" || error.kind === "config") {
    return "Could not reach the Mulhim Backend for the receipt URL.";
  }
  return error.message;
}

export function SubscriptionDetailContainer({
  subscriptionId,
}: SubscriptionDetailContainerProps) {
  const detail = useSubscriptionDetail(subscriptionId);
  const receipt = useSubscriptionReceiptUrl(subscriptionId, {
    enabled: detail.isSuccess,
  });

  if (detail.isPending) {
    return <SubscriptionDetailSkeleton />;
  }

  if (detail.isError) {
    const notFound = isApiError(detail.error) && detail.error.status === 404;
    return (
      <div className="flex flex-col gap-6">
        <Link
          href="/subscriptions"
          className="inline-flex w-fit items-center gap-1.5 text-body-sm text-on-surface-variant hover:text-on-surface"
        >
          Back to queue
        </Link>
        <SubscriptionsErrorPanel
          title={notFound ? "Subscription not found" : "Subscription unavailable"}
          message={detailErrorMessage(detail.error)}
          onRetry={() => {
            void detail.refetch();
          }}
        />
      </div>
    );
  }

  if (receipt.isPending) {
    return <SubscriptionDetailSkeleton />;
  }

  return (
    <SubscriptionDetailView
      subscription={detail.data}
      receiptUrl={receipt.isSuccess ? receipt.data.url : null}
      receiptError={
        receipt.isError ? receiptErrorMessage(receipt.error) : undefined
      }
      onRetryReceipt={
        receipt.isError
          ? () => {
              void receipt.refetch();
            }
          : undefined
      }
    />
  );
}
