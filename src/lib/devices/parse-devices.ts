import { ApiError } from "@/lib/api/errors";
import type {
  AdminDeviceBindingListResponse,
  AdminDeviceBindingResponse,
  DeviceType,
} from "@/lib/devices/types";

const DEVICE_TYPE_SET = new Set<DeviceType>(["web", "mobile"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDeviceType(value: unknown): value is DeviceType {
  return typeof value === "string" && DEVICE_TYPE_SET.has(value as DeviceType);
}

export function isAdminDeviceBindingResponse(
  value: unknown,
): value is AdminDeviceBindingResponse {
  if (!isRecord(value)) return false;
  if (!isDeviceType(value.deviceType)) return false;
  if (typeof value.boundAt !== "string") return false;
  if (value.lastSeenAt !== null && typeof value.lastSeenAt !== "string") {
    return false;
  }
  return true;
}

export function isAdminDeviceBindingListResponse(
  value: unknown,
): value is AdminDeviceBindingListResponse {
  if (!isRecord(value)) return false;
  if (typeof value.userId !== "string") return false;
  if (!Array.isArray(value.bindings)) return false;
  return value.bindings.every(isAdminDeviceBindingResponse);
}

export function parseAdminDeviceBindingListResponse(
  value: unknown,
  path: string,
): AdminDeviceBindingListResponse {
  if (!isAdminDeviceBindingListResponse(value)) {
    throw new ApiError({
      kind: "parse",
      message: `[devices] invalid AdminDeviceBindingListResponse from ${path}`,
      path,
    });
  }
  return value;
}
