import { Suspense } from "react";

import { SubscriptionDetailContainer } from "@/components/subscriptions/SubscriptionDetailContainer";
import { SubscriptionDetailSkeleton } from "@/components/subscriptions/SubscriptionDetailSkeleton";

type SubscriptionDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SubscriptionDetailPage({
  params,
}: SubscriptionDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<SubscriptionDetailSkeleton />}>
      <SubscriptionDetailContainer subscriptionId={id} />
    </Suspense>
  );
}
