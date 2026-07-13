"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import {
  createPlan,
  PLANS_PATH,
  planPath,
  updatePlan,
} from "@/lib/plans/fetch-plans";
import type {
  AdminPlan,
  AdminPlanListResponse,
  CreatePlanInput,
  UpdatePlanInput,
} from "@/lib/plans/types";
import { adminKeys } from "@/lib/query/keys";
import { toastAdminError } from "@/lib/toast/admin-toast";

function upsertPlanInList(
  current: AdminPlanListResponse | undefined,
  plan: AdminPlan,
): AdminPlanListResponse {
  if (!current) {
    return { plans: [plan] };
  }
  const index = current.plans.findIndex((item) => item.id === plan.id);
  if (index === -1) {
    return { plans: [plan, ...current.plans] };
  }
  const plans = [...current.plans];
  plans[index] = plan;
  return { plans };
}

export function useCreatePlan() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreatePlanInput) => {
      const token = await getToken();
      if (!token) {
        throw new ApiError({
          kind: "unauthorized",
          message: `[plans] Clerk session has no token for ${PLANS_PATH}`,
          path: PLANS_PATH,
        });
      }
      return createPlan(token, body);
    },
    onSuccess: (plan) => {
      queryClient.setQueryData<AdminPlanListResponse>(
        adminKeys.plans.list(),
        (current) => upsertPlanInList(current, plan),
      );
      void queryClient.invalidateQueries({ queryKey: adminKeys.plans.all() });
    },
    onError: (error) => {
      toastAdminError(error);
    },
  });
}

export function useUpdatePlan() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { planId: string; body: UpdatePlanInput }) => {
      const path = planPath(vars.planId);
      const token = await getToken();
      if (!token) {
        throw new ApiError({
          kind: "unauthorized",
          message: `[plans] Clerk session has no token for ${path}`,
          path,
        });
      }
      return updatePlan(token, vars.planId, vars.body);
    },
    onSuccess: (plan) => {
      queryClient.setQueryData<AdminPlanListResponse>(
        adminKeys.plans.list(),
        (current) => upsertPlanInList(current, plan),
      );
      void queryClient.invalidateQueries({ queryKey: adminKeys.plans.all() });
    },
    onError: (error) => {
      toastAdminError(error);
    },
  });
}
