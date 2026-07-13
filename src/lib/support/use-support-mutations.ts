"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import { captureAdminEvent } from "@/lib/posthog/capture";
import { adminKeys } from "@/lib/query/keys";
import {
  closeSupportRequest,
  replySupportRequest,
  supportClosePath,
  supportReplyPath,
} from "@/lib/support/fetch-support";
import type { ReplySupportRequestInput } from "@/lib/support/types";
import {
  toastAdminError,
  toastAdminSuccess,
} from "@/lib/toast/admin-toast";

/** Reply/close: invalidate only (no setQueriesData) so filtered lists never show a wrong-status row. */
function invalidateSupportCache(queryClient: QueryClient) {
  void queryClient.invalidateQueries({
    queryKey: adminKeys.support.all(),
  });
}

async function requireClerkToken(
  getToken: () => Promise<string | null>,
  path: string,
) {
  const token = await getToken();
  if (!token) {
    throw new ApiError({
      kind: "unauthorized",
      message: `[support] Clerk session has no token for ${path}`,
      path,
    });
  }
  return token;
}

export function useReplySupportRequest() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      requestId: string;
      body: ReplySupportRequestInput;
    }) => {
      const path = supportReplyPath(vars.requestId);
      const token = await requireClerkToken(getToken, path);
      return replySupportRequest(token, vars.requestId, vars.body);
    },
    onSuccess: (request) => {
      invalidateSupportCache(queryClient);
      captureAdminEvent("admin_support_replied", {
        requestId: request.id,
      });
      toastAdminSuccess("Reply sent");
    },
    onError: (error) => {
      toastAdminError(error);
    },
  });
}

export function useCloseSupportRequest() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { requestId: string }) => {
      const path = supportClosePath(vars.requestId);
      const token = await requireClerkToken(getToken, path);
      return closeSupportRequest(token, vars.requestId);
    },
    onSuccess: (request) => {
      invalidateSupportCache(queryClient);
      captureAdminEvent("admin_support_closed", {
        requestId: request.id,
      });
      toastAdminSuccess("Request closed");
    },
    onError: (error) => {
      toastAdminError(error);
    },
  });
}
