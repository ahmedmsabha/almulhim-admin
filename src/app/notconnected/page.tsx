import { WifiSlashIcon } from "@phosphor-icons/react/dist/ssr";

/**
 * Fallback for a direct `/notconnected` hit. While the app is already loaded,
 * `OnlineGuard` swaps to this UI via history without a network round-trip.
 */
export default function NotConnectedPage() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant">
          <WifiSlashIcon aria-hidden className="size-6" weight="duotone" />
        </div>
        <p className="mt-5 font-display text-headline-sm font-bold text-on-surface">
          No internet connection
        </p>
        <p className="mt-3 text-body-md text-on-surface-variant">
          Mulhim Admin needs a network connection to sign in and load the
          dashboard. Check your connection, then try again.
        </p>
      </div>
    </main>
  );
}
