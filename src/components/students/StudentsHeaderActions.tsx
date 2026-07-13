import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/ssr";

import { Button } from "@/components/ui/button";

/** Decorative only for step 06. Later wire may enable CSV export. */
export function StudentsHeaderActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        type="button"
        variant="outline"
        disabled
        className="rounded-lg border-outline-variant bg-surface-container-low"
        aria-label="Export CSV (coming soon)"
      >
        <DownloadSimpleIcon data-icon="inline-start" />
        Export CSV
      </Button>
    </div>
  );
}
