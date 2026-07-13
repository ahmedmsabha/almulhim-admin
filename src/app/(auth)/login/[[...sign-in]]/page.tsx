import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl overflow-hidden bg-surface-container-high border border-outline-variant shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="Mulhim Logo" className="size-full object-cover" />
        </div>
        <div>
          <p className="font-display text-headline-sm font-bold text-primary">
            Mulhim Admin
          </p>
          <p className="mt-2 text-body-md text-on-surface-variant">
            Sign in to continue to the teacher operations dashboard.
          </p>
        </div>
      </div>
      <SignIn
        routing="path"
        path="/login"
        forceRedirectUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
        signUpUrl="/register"
      />
    </main>
  );
}
