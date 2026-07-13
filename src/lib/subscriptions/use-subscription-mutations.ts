"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api/errors";
import { captureAdminEvent } from "@/lib/posthog/capture";
import { adminKeys } from "@/lib/query/keys";
import {
  approveSubscription,
  rejectSubscription,
  subscriptionPath,
  suspendSubscription,
} from "@/lib/subscriptions/fetch-subscriptions";
import type {
  RejectSubscriptionInput,
  SubscriptionReviewDecision,
} from "@/lib/subscriptions/types";
import {
  toastAdminError,
  toastAdminSuccess,
} from "@/lib/toast/admin-toast";

type ApproveVars = { decision: "approve" };
type RejectVars = { decision: "reject"; body: RejectSubscriptionInput };
type SuspendVars = { decision: "suspend" };
export type SubscriptionReviewVars = ApproveVars | RejectVars | SuspendVars;

export function useSubscriptionReview(subscriptionId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const path = subscriptionPath(subscriptionId);

  return useMutation({
    mutationFn: async (vars: SubscriptionReviewVars) => {
      const token = await getToken();
      if (!token) {
        throw new ApiError({
          kind: "unauthorized",
          message: `[subscriptions] Clerk session has no token for ${path}`,
          path,
        });
      }
      if (vars.decision === "approve") {
        return approveSubscription(token, subscriptionId);
      }
      if (vars.decision === "reject") {
        return rejectSubscription(token, subscriptionId, vars.body);
      }
      return suspendSubscription(token, subscriptionId);
    },
    onSuccess: (_data, vars) => {
      const decision: SubscriptionReviewDecision = vars.decision;
      void queryClient.invalidateQueries({
        queryKey: adminKeys.subscriptions.all(),
      });
      captureAdminEvent("admin_subscription_reviewed", {
        subscriptionId,
        decision,
      });
      const successMessage =
        decision === "approve"
          ? "Subscription approved"
          : decision === "reject"
            ? "Subscription rejected"
            : "Subscription suspended";
      toastAdminSuccess(successMessage);
      router.push("/subscriptions");
    },
    onError: (error) => {
      toastAdminError(error);
    },
  });
}
