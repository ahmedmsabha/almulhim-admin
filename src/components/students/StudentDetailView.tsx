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
import { useTranslation } from "@/lib/i18n/LanguageContext";

type StudentDetailViewProps = {
  student: StudentListItem;
  bindings: AdminDeviceBindingListResponse;
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
  const { t, lang } = useTranslation();

  const DEVICE_LABELS: Record<DeviceType, string> = {
    web: lang === "ar" ? "منصة الويب" : "Web Platform",
    mobile: lang === "ar" ? "تطبيق الهاتف" : "Mobile App",
  };

  function confirmTitle() {
    if (!confirm) return "";
    if (confirm.kind === "lifecycle") {
      if (confirm.action === "deactivate") return t("students.confirmDeactivateTitle");
      if (confirm.action === "reactivate") return t("students.confirmReactivateTitle");
      return t("students.confirmDeleteTitle");
    }
    if (confirm.vars.scope === "all") return t("students.resetAllBindings");
    return `${lang === "ar" ? "إعادة تعيين" : "Reset"} ${DEVICE_LABELS[confirm.vars.deviceType]}`;
  }

  function confirmDescription() {
    if (!confirm) return "";
    if (confirm.kind === "lifecycle") {
      if (confirm.action === "deactivate") {
        return lang === "ar"
          ? `حظر مؤقت لـ ${student.fullName} في Nest وحظر مستخدم Clerk الخاص بهم (${student.clerkId}). لن يتمكنوا من استخدام مسارات الطلاب حتى يتم إعادة تفعيلهم.`
          : `Soft-block ${student.fullName} in Nest and ban their Clerk user (${student.clerkId}). They cannot use student routes until reactivated.`;
      }
      if (confirm.action === "reactivate") {
        return lang === "ar"
          ? `إلغاء الحظر المؤقت في Nest لـ ${student.fullName} وإلغاء حظر مستخدم Clerk ${student.clerkId}.`
          : `Clear the Nest soft-block for ${student.fullName} and unban Clerk user ${student.clerkId}.`;
      }
      return lang === "ar"
        ? `حذف نهائي لـ ${student.fullName} من Nest (حذف الاشتراكات والأجهزة والدعم والتحميلات) وحذف مستخدم Clerk ${student.clerkId}. لا يمكن التراجع عن هذا الإجراء.`
        : `Hard-delete ${student.fullName} from Nest (subscriptions, devices, support, downloads cascade) and delete Clerk user ${student.clerkId}. This cannot be undone.`;
    }
    if (confirm.vars.scope === "all") {
      return lang === "ar"
        ? `سيؤدي هذا إلى إلغاء ربط جميع الأجهزة لـ ${student.fullName}. يجب عليهم إعادة ربط الويب والهاتف قبل استخدام المحتوى المحمي.`
        : `This unbinds every device for ${student.fullName}. They must rebind web and mobile before using protected content.`;
    }
    return lang === "ar"
      ? `سيؤدي هذا إلى إلغاء ربط جهاز ${DEVICE_LABELS[confirm.vars.deviceType]} لـ ${student.fullName}. يجب عليهم إعادة ربط هذا الجهاز للمتابعة.`
      : `This unbinds the ${DEVICE_LABELS[confirm.vars.deviceType]} device for ${student.fullName}. They must rebind that device to continue.`;
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
          {t("students.backToStudents")}
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-label-md uppercase tracking-wider text-on-surface-variant">
              {t("students.eyebrow")}
            </p>
            <h1 className="font-display text-display-lg text-on-surface">
              {student.fullName}
            </h1>
            <p className="mt-1 text-body-md text-on-surface-variant">
              {student.email}
            </p>
            {isDeactivated ? (
              <p className="mt-2 text-body-sm font-medium text-status-suspended">
                {t("students.deactivatedLabel")} {formatTimestamp(student.deactivatedAt)}
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
                  {t("students.reactivate")}
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
                  {t("students.deactivate")}
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
                {t("students.delete")}
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
            {t("students.profile")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-label-md uppercase tracking-wider text-on-surface-variant">
                {t("students.phone")}
              </dt>
              <dd className="mt-1 text-body-md text-on-surface">
                {student.phone ?? (lang === "ar" ? "لا يوجد" : "None")}
              </dd>
            </div>
            <div>
              <dt className="text-label-md uppercase tracking-wider text-on-surface-variant">
                {t("students.telegram")}
              </dt>
              <dd className="mt-1 text-body-md text-on-surface">
                {student.telegram ?? (lang === "ar" ? "لا يوجد" : "None")}
              </dd>
            </div>
            <div>
              <dt className="text-label-md uppercase tracking-wider text-on-surface-variant">
                {t("students.region")}
              </dt>
              <dd className="mt-1 text-body-md text-on-surface">
                {t(`common.regions.${student.region}`)}
              </dd>
            </div>
            <div>
              <dt className="text-label-md uppercase tracking-wider text-on-surface-variant">
                {t("students.nestUserId")}
              </dt>
              <dd className="mt-1 break-all font-mono text-body-sm text-on-surface-variant">
                {student.id}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-label-md uppercase tracking-wider text-on-surface-variant">
                {t("students.clerkUserId")}
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
            {t("students.activeDeviceBindings")}
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
            {t("students.resetAllBindings")}
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
                    {t("students.noDeviceRegistered").replace("{device}", DEVICE_LABELS[deviceType].toLowerCase())}
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
                        {lang === "ar" ? "ارتبط في: " : "Bound: "}{formatTimestamp(binding.boundAt)}
                      </p>
                      <p className="mt-1 text-[10px] text-on-surface-variant">
                        {lang === "ar" ? "آخر ظهور: " : "Last seen: "}{formatTimestamp(binding.lastSeenAt)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={busy}
                    className="text-error hover:bg-error-container"
                    title={`${lang === "ar" ? "إعادة تعيين" : "Reset"} ${DEVICE_LABELS[deviceType]}`}
                    aria-label={`${lang === "ar" ? "إعادة تعيين" : "Reset"} ${DEVICE_LABELS[deviceType]}`}
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
            <AlertDialogCancel disabled={dialogPending}>{t("students.confirmCancel")}</AlertDialogCancel>
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
                  ? (lang === "ar" ? "جاري الحذف…" : "Deleting…")
                  : confirm?.kind === "lifecycle"
                    ? (lang === "ar" ? "جاري الحفظ…" : "Saving…")
                    : (lang === "ar" ? "جاري إعادة التعيين…" : "Resetting…")
                : confirm?.kind === "lifecycle" && confirm.action === "delete"
                  ? (lang === "ar" ? "حذف نهائي" : "Delete permanently")
                  : t("students.confirmOk")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
