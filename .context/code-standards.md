# Code Standards — Mulhim Admin Web

Implementation rules for the Admin Web app. Follow in every session without exception to prevent pattern drift.

---

## Engineering Mindset

- **Think before implementing** — read `project-overview.md` and `architecture.md` first
- **Scope is sacred** — only build what the current build-plan step requires
- **API is source of truth** — never invent subscription, region, or publish rules in the UI
- **Every feature must be testable** — verify in the browser or with a clear API response before moving on
- **Clean over clever** — readable Next.js code over abstractions
- **One unit at a time** — finish the current build-plan step before the next

---

## TypeScript

- Strict mode — no exceptions
- Never use `any` — use `unknown` and narrow
- Avoid `as` assertions unless necessary and commented
- Explicit parameter and return types on exported functions
- Prefer `type` for object shapes and unions; `interface` for extendable component props
- `const` by default

---

## Next.js 16 Conventions

- App Router only — no Pages Router
- React 19 APIs
- Server Components by default
- `"use client"` only for state, effects, browser APIs, event handlers, or client-only libs (PostHog, charts, upload widgets)
- Never put `"use client"` on root layout unless unavoidable
- Server Actions live in `src/actions/` — named with `Action` suffix (`approveSubscriptionAction`)
- Reusable server utilities in `src/lib/`
- Prefer Server Actions for mutations; avoid ad-hoc API routes unless needed for webhooks/uploads progress
- Use `@/` imports
- Always check current Next.js / Clerk docs via Context7 before novel framework APIs

---

## File and Folder Naming

- Folders: kebab-case — `subscriptions`, `content`
- Components: PascalCase — `StatusBadge.tsx`
- Utilities: camelCase — `api-client.ts`
- Hooks: `useSomething.ts`
- Server Actions files: camelCase module — `subscriptions.ts` exporting `approveSubscriptionAction`
- One component per file — named exports only (no default exports for components)
- No barrel files outside `components/ui/`

---

## Component Structure

```typescript
"use client"; // only if needed

// 1. External imports
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. Internal imports
import { StatusBadge } from "@/components/shared/StatusBadge";

// 3. Types
type Props = {
  subscriptionId: string;
};

// 4. Component
export function SubscriptionRow({ subscriptionId }: Props) {
  // state → derived → handlers → JSX
}
```

- Props type directly above the component unless shared
- Styling via Tailwind token utilities from `ui-tokens.md` — no inline styles except rare dynamic chart values

---

## API Client

```typescript
// src/lib/api/client.ts — server or authenticated fetch helper
// Always attach Clerk Bearer token
// Always parse/validate responses where practical
// Prefix logs: [api/subscriptions]
```

- All backend calls go through `src/lib/api/*`
- Never `fetch(NEXT_PUBLIC_API_URL)` scattered in components
- Map HTTP 401/403 to clear auth/forbidden UX
- Do not swallow errors

---

## Server Actions

```typescript
"use server";

export async function approveSubscriptionAction(id: string) {
  try {
    // auth gate
    // zod validate
    // call backend
    // revalidatePath / tag as needed
    return { success: true as const };
  } catch (error) {
    console.error("[actions/subscriptions/approve]", error);
    return { success: false as const, error: "Failed to approve subscription" };
  }
}
```

- Every action: try/catch
- Return `{ success: boolean; data?: T; error?: string }` — do not throw to the client
- Revalidate or invalidate query keys after success
- Never expose raw backend stack traces

---

## Forms & Validation

- Zod schemas in `src/lib/validators/`
- Validate before every write
- Mirror backend field names where possible (`region`, `status`, etc.)
- User-facing errors are human-readable

---

## TanStack Query

- Query keys from `src/lib/query/keys.ts`
- Hooks in `src/hooks/`
- Invalidate narrowly after mutations
- Skeletons for `isLoading`; keep prior data on `isFetching`

---

## Auth

- Clerk middleware protects `(dashboard)`
- Additional admin role check via backend before rendering sensitive actions
- Never trust `publicMetadata.role` alone if backend is the authority — confirm with API

---

## Error Handling

- No empty catch blocks
- Log with `[area/action]` prefix
- Toasts or inline alerts for user-visible failures
- 403 → “Admin access required” style message

---

## PostHog

- Initialize once in provider
- `identify` after admin session established; `reset` on logout
- Use event names listed in `architecture.md` / `library-docs.md`
- Do not send PII beyond what product analytics already allows (prefer user id over raw phone)

---

## Imports & Boundaries

- `components/` never import from `app/` route files
- `lib/` never import from `components/`
- `actions/` may use `lib/` only
- No Prisma, AWS SDK, or Nest providers in this app

---

## Testing Mindset

For each build-plan step:

1. UI renders with mock or real API data
2. Happy path mutation works against local/staging API
3. Error path shows a readable message
4. `npm run build` passes before marking the step done
