import {
  CalendarBlankIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";

import { Button } from "@/components/ui/button";

type DashboardHeaderActionsProps = {
  rangeLabel?: string;
};

/** Decorative only for step 04. Step 05 may wire real range / export. */
export function DashboardHeaderActions({
  rangeLabel = "Last 30 Days",
}: DashboardHeaderActionsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        type="button"
        variant="outline"
        disabled
        className="rounded-lg border-outline-variant bg-surface-container-low"
        aria-label={`Date range: ${rangeLabel} (coming soon)`}
      >
        <CalendarBlankIcon data-icon="inline-start" />
        {rangeLabel}
      </Button>
      <Button
        type="button"
        disabled
        className="rounded-lg"
        aria-label="Export report (coming soon)"
      >
        <DownloadSimpleIcon data-icon="inline-start" />
        Export Report
      </Button>
    </div>
  );
}
