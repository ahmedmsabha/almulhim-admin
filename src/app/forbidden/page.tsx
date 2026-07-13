import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";

type ForbiddenPageProps = {
  searchParams: Promise<{ reason?: string }>;
};

export default async function ForbiddenPage({
  searchParams,
}: ForbiddenPageProps) {
  const { reason } = await searchParams;
  const gateFailed = reason === "gate_failed";

  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-sm">
        <p className="font-display text-headline-sm font-bold text-on-surface">
          {gateFailed ? "Unable to verify admin access" : "Admin access required"}
        </p>
        <p className="mt-3 text-body-md text-on-surface-variant">
          {gateFailed
            ? "We could not confirm your admin role with the Mulhim Backend. Check that the API is reachable, then try again."
            : "This account is signed in but is not registered as an admin on the Mulhim Backend."}
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <SignOutButton redirectUrl="/login">
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-body-md font-semibold text-on-primary transition-colors hover:bg-primary-container"
            >
              Sign out
            </button>
          </SignOutButton>
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-outline-variant px-4 text-body-md font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
