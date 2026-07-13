import { apiFetch } from "@/lib/api/api-fetch";
import { ApiError } from "@/lib/api/errors";
import {
  parseAdminPlan,
  parseAdminPlanListResponse,
} from "@/lib/plans/parse-plans";
import type {
  AdminPlan,
  AdminPlanListResponse,
  CreatePlanInput,
  UpdatePlanInput,
} from "@/lib/plans/types";

export const PLANS_ALL_PATH = "/plans/all";
export const PLANS_PATH = "/plans";

export function planPath(planId: string) {
  return `/plans/${planId}`;
}

function requireToken(token: string, path: string) {
  if (!token) {
    throw new ApiError({
      kind: "unauthorized",
      message: `[plans] missing Bearer token for ${path}`,
      path,
    });
  }
}

export async function fetchAllPlans(
  token: string,
): Promise<AdminPlanListResponse> {
  requireToken(token, PLANS_ALL_PATH);
  const payload = await apiFetch<unknown>(PLANS_ALL_PATH, { token });
  return parseAdminPlanListResponse(payload, PLANS_ALL_PATH);
}

export async function createPlan(
  token: string,
  body: CreatePlanInput,
): Promise<AdminPlan> {
  requireToken(token, PLANS_PATH);
  const payload = await apiFetch<unknown>(PLANS_PATH, {
    token,
    method: "POST",
    body,
  });
  return parseAdminPlan(payload, PLANS_PATH);
}

export async function updatePlan(
  token: string,
  planId: string,
  body: UpdatePlanInput,
): Promise<AdminPlan> {
  const path = planPath(planId);
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, {
    token,
    method: "PATCH",
    body,
  });
  return parseAdminPlan(payload, path);
}
