import { Badge } from "@/components/ui/badge";
import {
  SUBSCRIPTION_STATUS_LABELS,
  type SubscriptionStatus,
} from "@/lib/domain/subscription-status";
import { cn } from "@/lib/utils";

const statusClassName: Record<SubscriptionStatus, string> = {
  free: "rounded-full border-outline-variant bg-status-free-bg text-status-free",
  pending_review:
    "rounded-full border-status-pending-review/30 bg-status-pending-review-bg text-status-pending-review",
  pending_approval:
    "rounded-full border-status-pending-approval/30 bg-status-pending-approval-bg text-status-pending-approval",
  active:
    "rounded-full border-status-active/30 bg-status-active-bg text-status-active",
  expired:
    "rounded-full border-outline-variant bg-status-expired-bg text-status-expired",
  rejected:
    "rounded-full border-status-rejected/30 bg-status-rejected-bg text-status-rejected",
  suspended:
    "rounded-full border-status-suspended/30 bg-status-suspended-bg text-status-suspended",
};

type StatusBadgeProps = {
  status: SubscriptionStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[11px] font-bold uppercase tracking-wide",
        statusClassName[status],
        className
      )}
    >
      {SUBSCRIPTION_STATUS_LABELS[status]}
    </Badge>
  );
}
