import { notFound } from "next/navigation";

import { SubscriptionTestCheckoutView } from "@/components/subscriptions/SubscriptionTestCheckoutView";

export default function SubscriptionTestCheckoutPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <SubscriptionTestCheckoutView />;
}
