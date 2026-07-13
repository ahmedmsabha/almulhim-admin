"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import {
  deviceBindingsPath,
  fetchDeviceBindings,
} from "@/lib/devices/fetch-devices";
import { adminKeys } from "@/lib/query/keys";

export function useDeviceBindings(
  studentUserId: string,
  options?: { enabled?: boolean },
) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const path = deviceBindingsPath(studentUserId);
  const enabled =
    (options?.enabled ?? true) &&
    isLoaded &&
    Boolean(isSignedIn) &&
    Boolean(userId) &&
    Boolean(studentUserId);

  return useQuery({
    queryKey: adminKeys.devices.byUser(studentUserId),
    enabled,
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new ApiError({
          kind: "unauthorized",
          message: `[devices] Clerk session has no token for ${path}`,
          path,
        });
      }
      return fetchDeviceBindings(token, studentUserId);
    },
  });
}
