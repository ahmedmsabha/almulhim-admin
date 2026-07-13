import { apiFetch } from "@/lib/api/api-fetch";
import { ApiError } from "@/lib/api/errors";
import { parseAdminDeviceBindingListResponse } from "@/lib/devices/parse-devices";
import type {
  AdminDeviceBindingListResponse,
  DeviceType,
} from "@/lib/devices/types";

export function deviceBindingsPath(userId: string) {
  return `/devices/admin/users/${userId}/bindings`;
}

export function deviceBindingTypePath(userId: string, deviceType: DeviceType) {
  return `${deviceBindingsPath(userId)}/${deviceType}`;
}

export async function fetchDeviceBindings(
  token: string,
  userId: string,
): Promise<AdminDeviceBindingListResponse> {
  const path = deviceBindingsPath(userId);
  if (!token) {
    throw new ApiError({
      kind: "unauthorized",
      message: `[devices] missing Bearer token for ${path}`,
      path,
    });
  }
  const payload = await apiFetch<unknown>(path, { token });
  return parseAdminDeviceBindingListResponse(payload, path);
}

export async function resetDeviceBinding(
  token: string,
  userId: string,
  deviceType: DeviceType,
): Promise<AdminDeviceBindingListResponse> {
  const path = deviceBindingTypePath(userId, deviceType);
  if (!token) {
    throw new ApiError({
      kind: "unauthorized",
      message: `[devices] missing Bearer token for ${path}`,
      path,
    });
  }
  const payload = await apiFetch<unknown>(path, {
    token,
    method: "DELETE",
  });
  return parseAdminDeviceBindingListResponse(payload, path);
}

export async function resetAllDeviceBindings(
  token: string,
  userId: string,
): Promise<AdminDeviceBindingListResponse> {
  const path = deviceBindingsPath(userId);
  if (!token) {
    throw new ApiError({
      kind: "unauthorized",
      message: `[devices] missing Bearer token for ${path}`,
      path,
    });
  }
  const payload = await apiFetch<unknown>(path, {
    token,
    method: "DELETE",
  });
  return parseAdminDeviceBindingListResponse(payload, path);
}
