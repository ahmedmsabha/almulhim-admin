import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mb-8 text-center">
        <p className="font-display text-headline-sm font-bold text-primary">
          Mulhim Admin
        </p>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Create an account, then sign in to continue.
        </p>
      </div>
      <SignUp
        routing="path"
        path="/register"
        forceRedirectUrl="/login"
        fallbackRedirectUrl="/login"
        signInUrl="/login"
      />
    </main>
  );
}
