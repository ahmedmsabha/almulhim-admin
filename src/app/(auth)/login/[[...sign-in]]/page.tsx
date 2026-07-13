import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mb-8 text-center">
        <p className="font-display text-headline-sm font-bold text-primary">
          Mulhim Admin
        </p>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Sign in to continue to the teacher operations dashboard.
        </p>
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
