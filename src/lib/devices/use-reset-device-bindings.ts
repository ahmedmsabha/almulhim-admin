"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import {
  deviceBindingsPath,
  resetAllDeviceBindings,
  resetDeviceBinding,
} from "@/lib/devices/fetch-devices";
import type { DeviceType } from "@/lib/devices/types";
import { captureAdminEvent } from "@/lib/posthog/capture";
import { adminKeys } from "@/lib/query/keys";
import { toastAdminError } from "@/lib/toast/admin-toast";

type ResetOneVars = { scope: "one"; deviceType: DeviceType };
type ResetAllVars = { scope: "all" };
export type ResetDeviceVars = ResetOneVars | ResetAllVars;

export function useResetDeviceBindings(studentUserId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const path = deviceBindingsPath(studentUserId);

  return useMutation({
    mutationFn: async (vars: ResetDeviceVars) => {
      const token = await getToken();
      if (!token) {
        throw new ApiError({
          kind: "unauthorized",
          message: `[devices] Clerk session has no token for ${path}`,
          path,
        });
      }
      if (vars.scope === "one") {
        return resetDeviceBinding(token, studentUserId, vars.deviceType);
      }
      return resetAllDeviceBindings(token, studentUserId);
    },
    onSuccess: (data, vars) => {
      queryClient.setQueryData(adminKeys.devices.byUser(studentUserId), data);
      void queryClient.invalidateQueries({
        queryKey: adminKeys.devices.byUser(studentUserId),
      });
      captureAdminEvent("admin_device_reset", {
        userId: studentUserId,
        scope: vars.scope,
        ...(vars.scope === "one" ? { deviceType: vars.deviceType } : {}),
      });
    },
    onError: (error) => {
      toastAdminError(error);
    },
  });
}
