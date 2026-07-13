"use client";

import { useState } from "react";
import {
  ArrowLeftIcon,
  DesktopIcon,
  DeviceMobileIcon,
  DevicesIcon,
  ArrowClockwiseIcon,
} from "@phosphor-icons/react";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isApiError } from "@/lib/api/errors";
import { REGION_LABELS } from "@/lib/domain/region";
import type {
  AdminDeviceBindingListResponse,
  AdminDeviceBindingResponse,
  DeviceType,
} from "@/lib/devices/types";
import { DEVICE_TYPES } from "@/lib/devices/types";
import type { StudentListItem } from "@/lib/students/types";
import {
  useResetDeviceBindings,
  type ResetDeviceVars,
} from "@/lib/devices/use-reset-device-bindings";
import {
  useStudentLifecycle,
  type StudentLifecycleAction,
} from "@/lib/students/use-student-mutations";

type StudentDetailViewProps = {
  student: StudentListItem;
  bindings: AdminDeviceBindingListResponse;
};

const DEVICE_LABELS: Record<DeviceType, string> = {
  web: "Web Platform",
  mobile: "Mobile App",
};

type ConfirmState =
  | { kind: "device"; vars: ResetDeviceVars }
  | { kind: "lifecycle"; action: StudentLifecycleAction };

function formatTimestamp(value: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function bindingForType(
  bindings: AdminDeviceBindingResponse[],
  deviceType: DeviceType,
) {
  return bindings.find((row) => row.deviceType === deviceType) ?? null;
}

function lifecycleErrorMessage(
  action: StudentLifecycleAction,
  error: unknown,
): string {
  if (!isApiError(error)) {
    return action === "delete"
      ? "Delete failed. Try again."
      : `${action === "deactivate" ? "Deactivate" : "Reactivate"} failed. Try again.`;
  }
  if (error.status === 404) {
    return "This student no longer exists (or is not a student).";
  }
  if (error.status === 502) {
    return "Nest deleted the student but Clerk cleanup failed. Check Nest logs for the clerkId.";
  }
  if (error.status === 403) {
    return "You are not allowed to change this student.";
  }
  return error.message;
}

export function StudentDetailView({
  student,
  bindings,
}: StudentDetailViewProps) {
  const reset = useResetDeviceBindings(student.id);
  const lifecycle = useStudentLifecycle(student.id);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const hasAnyBinding = bindings.bindings.length > 0;
  const isDeactivated = Boolean(student.deactivatedAt);
  const busy = reset.isPending || lifecycle.isPending;

  function confirmTitle() {
    if (!confirm) return "";
    if (confirm.kind === "lifecycle") {
      if (confirm.action === "deactivate") return "Deactivate this student?";
      if (confirm.action === "reactivate") return "Reactivate this student?";
      return "Delete this student permanently?";
    }
    if (confirm.vars.scope === "all") return "Reset all bindings";
    return `Reset ${DEVICE_LABELS[confirm.vars.deviceType]}`;
  }

  function confirmDescription() {
    if (!confirm) return "";
    if (confirm.kind === "lifecycle") {
      if (confirm.action === "deactivate") {
        return `Soft-block ${student.fullName} in Nest and ban their Clerk user (${student.clerkId}). They cannot use student routes until reactivated.`;
      }
      if (confirm.action === "reactivate") {
        return `Clear the Nest soft-block for ${student.fullName} and unban Clerk user ${student.clerkId}.`;
      }
      return `Hard-delete ${student.fullName} from Nest (subscriptions, devices, support, downloads cascade) and delete Clerk user ${student.clerkId}. This cannot be undone.`;
    }
    if (confirm.vars.scope === "all") {
      return `This unbinds every device for ${student.fullName}. They must rebind web and mobile before using protected content.`;
    }
    return `This unbinds the ${DEVICE_LABELS[confirm.vars.deviceType]} device for ${student.fullName}. They must rebind that device to continue.`;
  }

  const dialogPending =
    confirm?.kind === "device" ? reset.isPending : lifecycle.isPending;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link
          href="/students"
          className="inline-flex w-fit items-center gap-1.5 text-body-sm text-on-surface-variant hover:text-on-surface"
        >
          <ArrowLeftIcon className="size-4" />
          Back to students
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-label-md uppercase tracking-wider text-on-surface-variant">
              Students
            </p>
            <h1 className="font-display text-display-lg text-on-surface">
              {student.fullName}
            </h1>
            <p className="mt-1 text-body-md text-on-surface-variant">
              {student.email}
            </p>
            {isDeactivated ? (
              <p className="mt-2 text-body-sm font-medium text-status-suspended">
                Deactivated {formatTimestamp(student.deactivatedAt)}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <StatusBadge status={student.subscriptionStatus} />
            <div className="flex flex-wrap gap-2">
              {isDeactivated ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() =>
                    setConfirm({ kind: "lifecycle", action: "reactivate" })
                  }
                >
                  Reactivate
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() =>
                    setConfirm({ kind: "lifecycle", action: "deactivate" })
                  }
                >
                  Deactivate
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                className="border-error text-error hover:bg-error hover:text-on-error"
                onClick={() =>
                  setConfirm({ kind: "lifecycle", action: "delete" })
                }
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
        {lifecycle.isError && confirm?.kind !== "lifecycle" ? (
          <p className="text-body-sm text-error" role="alert">
            {lifecycleErrorMessage(
              (lifecycle.variables as StudentLifecycleAction) ?? "deactivate",
              lifecycle.error,
            )}
          </p>
        ) : null}
      </div>

      <Card className="rounded-xl border border-outline-variant bg-surface-container-lowest ring-0">
        <CardHeader>
          <CardTitle className="text-headline-sm font-display text-on-surface">
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-label-md uppercase tracking-wider text-on-surface-variant">
                Phone
              </dt>
              <dd className="mt-1 text-body-md text-on-surface">
                {student.phone ?? "None"}
              </dd>
            </div>
            <div>
              <dt className="text-label-md uppercase tracking-wider text-on-surface-variant">
                Telegram
              </dt>
              <dd className="mt-1 text-body-md text-on-surface">
                {student.telegram ?? "None"}
              </dd>
            </div>
            <div>
              <dt className="text-label-md uppercase tracking-wider text-on-surface-variant">
                Region
              </dt>
              <dd className="mt-1 text-body-md text-on-surface">
                {REGION_LABELS[student.region]}
              </dd>
            </div>
            <div>
              <dt className="text-label-md uppercase tracking-wider text-on-surface-variant">
                Nest user ID
              </dt>
              <dd className="mt-1 break-all font-mono text-body-sm text-on-surface-variant">
                {student.id}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-label-md uppercase tracking-wider text-on-surface-variant">
                Clerk user ID
              </dt>
              <dd className="mt-1 break-all font-mono text-body-sm text-on-surface-variant">
                {student.clerkId}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-outline-variant bg-surface-container-lowest ring-0">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-headline-sm font-display text-on-surface">
            <DevicesIcon className="text-primary" />
            Active Device Bindings
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!hasAnyBinding || busy}
            className="rounded-lg border-error text-error hover:bg-error hover:text-on-error"
            onClick={() =>
              setConfirm({ kind: "device", vars: { scope: "all" } })
            }
          >
            Reset all bindings
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {DEVICE_TYPES.map((deviceType) => {
              const binding = bindingForType(bindings.bindings, deviceType);
              const Icon =
                deviceType === "web" ? DesktopIcon : DeviceMobileIcon;

              if (!binding) {
                return (
                  <div
                    key={deviceType}
                    className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-outline-variant p-4 text-body-sm text-on-surface-variant italic"
                  >
                    No {DEVICE_LABELS[deviceType].toLowerCase()} registered
                  </div>
                );
              }

              return (
                <div
                  key={deviceType}
                  className="flex justify-between gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-4"
                >
                  <div className="flex items-start gap-4">
                    <Icon className="mt-1 text-secondary" />
                    <div>
                      <p className="font-bold text-body-md text-on-surface">
                        {DEVICE_LABELS[deviceType]}
                      </p>
                      <p className="mt-2 text-[10px] text-on-surface-variant">
                        Bound: {formatTimestamp(binding.boundAt)}
                      </p>
                      <p className="mt-1 text-[10px] text-on-surface-variant">
                        Last seen: {formatTimestamp(binding.lastSeenAt)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={busy}
                    className="text-error hover:bg-error-container"
                    title={`Reset ${DEVICE_LABELS[deviceType]}`}
                    aria-label={`Reset ${DEVICE_LABELS[deviceType]}`}
                    onClick={() =>
                      setConfirm({
                        kind: "device",
                        vars: { scope: "one", deviceType },
                      })
                    }
                  >
                    <ArrowClockwiseIcon />
                  </Button>
                </div>
              );
            })}
          </div>
          {reset.isError ? (
            <p className="mt-4 text-body-sm text-error" role="alert">
              Reset failed. Try again.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <AlertDialog
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open && !dialogPending) setConfirm(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle()}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDescription()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {confirm?.kind === "lifecycle" && lifecycle.isError ? (
            <p className="text-body-sm text-error" role="alert">
              {lifecycleErrorMessage(confirm.action, lifecycle.error)}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={dialogPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={dialogPending || !confirm}
              onClick={(event) => {
                event.preventDefault();
                if (!confirm) return;
                if (confirm.kind === "device") {
                  reset.mutate(confirm.vars, {
                    onSuccess: () => setConfirm(null),
                  });
                  return;
                }
                lifecycle.mutate(confirm.action, {
                  onSuccess: () => setConfirm(null),
                });
              }}
            >
              {dialogPending
                ? confirm?.kind === "lifecycle" && confirm.action === "delete"
                  ? "Deleting…"
                  : confirm?.kind === "lifecycle"
                    ? "Saving…"
                    : "Resetting…"
                : confirm?.kind === "lifecycle" && confirm.action === "delete"
                  ? "Delete permanently"
                  : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
