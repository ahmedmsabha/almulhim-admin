export type DeviceType = "web" | "mobile";

export type AdminDeviceBindingResponse = {
  deviceType: DeviceType;
  boundAt: string;
  lastSeenAt: string | null;
};

export type AdminDeviceBindingListResponse = {
  userId: string;
  bindings: AdminDeviceBindingResponse[];
};

export const DEVICE_TYPES: DeviceType[] = ["web", "mobile"];
