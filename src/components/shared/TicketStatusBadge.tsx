import { Badge } from "@/components/ui/badge";
import {
  SUPPORT_REQUEST_STATUS_LABELS,
  type SupportRequestStatus,
} from "@/lib/domain/support-request-status";
import { cn } from "@/lib/utils";

/** Maps ticket statuses onto existing Kinetic status color tokens. */
const statusClassName: Record<SupportRequestStatus, string> = {
  open: "rounded-full border-status-pending-approval/30 bg-status-pending-approval-bg text-status-pending-approval",
  reviewed:
    "rounded-full border-status-active/30 bg-status-active-bg text-status-active",
  closed:
    "rounded-full border-outline-variant bg-status-expired-bg text-status-expired",
};

type TicketStatusBadgeProps = {
  status: SupportRequestStatus;
  className?: string;
};

export function TicketStatusBadge({
  status,
  className,
}: TicketStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[11px] font-bold uppercase tracking-wide",
        statusClassName[status],
        className,
      )}
    >
      {SUPPORT_REQUEST_STATUS_LABELS[status]}
    </Badge>
  );
}
