# Library Docs — Mulhim Admin Web

Project-specific usage patterns for third-party libraries in **Mulhim Admin Web**. Read the relevant section before implementing features that touch these libraries.

---

## Before Using Any Library

1. **Check AGENTS.md** for installed skills
2. **Use Context7 MCP** for Clerk, Next.js, TanStack Query, Zod, PostHog, Tailwind — prefer current docs over memory
3. **Read this file** for Mulhim-specific constraints

Authority order:

```
MCP / Context7 → Skills via AGENTS.md → This file → General training knowledge
```

---

## Clerk (`@clerk/nextjs`)

**Role:** Only authentication provider for Admin Web.

### Setup

- `ClerkProvider` in root layout
- `src/proxy.ts` with `clerkMiddleware` protecting dashboard routes (public: `/login`, `/forbidden`)
- Login page under `(auth)/login`
- Env: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`

### Rules

- Do not mix another auth system
- After Clerk session exists, confirm admin via Mulhim Backend (`GET /users/me` or admin-only call)
- Pass Clerk JWT as `Authorization: Bearer <token>` to the Nest API
- Never store role solely in localStorage
- Use Context7 for current Clerk Next.js App Router APIs (they change often)

### Admin Gate Pattern

```typescript
// Pseudocode — adapt to current Clerk + API helpers
const { getToken } = await auth();
const token = await getToken();
const me = await api.getMe(token);
if (me.role !== "admin") redirect("/login"); // or forbidden page
```

---

## Mulhim Backend API Client

**Role:** All data and mutations.

### Rules

- Base URL: `NEXT_PUBLIC_API_URL`
- Typed wrappers in `src/lib/api/`
- Always send Bearer token
- Never call R2 or Postgres from this app
- Treat 403 as authorization failure; 404 as missing resource
- Upload flows: use backend-provided upload/presign endpoints; show progress in UI only

### Admin endpoints (reference)

See Backend README — students, plans, subscriptions (pending/receipt/approve/reject/suspend), content admin, announcements admin, support admin, devices admin.

---

## TanStack Query

**Role:** Server state for dashboard lists and details.

### Rules

- `QueryClientProvider` in a client provider under app layout
- Stable keys under `['admin', ...]`
- `useQuery` for reads in client components; Server Components may prefetch and hydrate
- `useMutation` + invalidation for client-side writes when not using Server Actions alone
- Distinguish `isLoading` vs `isFetching`
- Keep previous data during background refetch where UX benefits

### Devtools

Optional `@tanstack/react-query-devtools` in development only.

---

## Zod

**Role:** Validate every write payload before API calls.

### Rules

- Schemas in `src/lib/validators/`
- Use with `@hookform/resolvers` for forms
- Align enums with backend: regions, subscription statuses, support statuses, device types
- Do not silently strip unknown critical fields without intentional schema design

---

## react-hook-form

**Role:** Admin forms (plans, content, announcements, reject reasons, support replies).

### Rules

- Pair with Zod resolver
- Disable submit while mutation in flight
- Reset or revalidate after success

---

## Tailwind CSS v4 + shadcn/ui

**Role:** Styling and primitives.

### Rules

- Tokens in `@theme` per `ui-tokens.md`
- shadcn components only under `components/ui/`
- Domain components compose shadcn — do not fork shadcn internals lightly
- Use `clsx` + `tailwind-merge` via a `cn()` helper
- Follow Kinetic Enterprise — indigo primary, sidebar layout — not JobPilot purple marketing styles

---

## PostHog (`posthog-js`)

**Role:** Product analytics for admin usage.

### Rules

- Init once via `src/lib/posthog/init-client.ts` from root `instrumentation-client.ts`, with `PostHogBootstrap` in the root layout as a fallback when Turbopack’s instrumentation chunk list is stale
- Env: `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` / `NEXT_PUBLIC_POSTHOG_HOST` (EU: `https://eu.i.posthog.com`)
- `identify` / `reset` only from dashboard-scoped `AdminAnalytics` after admin gate
- Prefer UI events (`admin_*`); do not duplicate backend lifecycle events unless product asks

---

## lucide-react

**Role:** Icons in sidebar and actions.

Prefer consistent stroke icons. Design HTML may reference Material Symbols — lucide is acceptable if visually consistent; do not mix three icon systems on one page.

---

## Charts (dashboard)

Use a lightweight chart library chosen at implementation time (e.g. Recharts) for:

- Subscription growth (line)
- Region distribution (pie/bar)

Keep chart colors on token primaries / neutrals. Lazy-load chart components (`"use client"`).

---

## Next.js Font / Image

- `next/font/google` for Hanken Grotesk, Inter, JetBrains Mono
- `next/image` for announcement previews when URLs are https signed/public as returned by API

---

## Explicitly Not Used in Admin Web

| Library | Why |
| --- | --- |
| Prisma | Backend only |
| `@aws-sdk/*` / R2 SDK | Backend only |
| NestJS | Backend only |
| InsForge / Supabase Auth | Replaced by Clerk + Nest API |
| Expo / NativeWind | Mobile only |
| Browserbase / Stagehand / Adzuna | Unrelated (JobPilot) |

---

## npm Install (Web)

From architecture reference:

```bash
npm install @clerk/nextjs @tanstack/react-query @tanstack/react-query-devtools posthog-js zod @hookform/resolvers react-hook-form clsx tailwind-merge lucide-react
```

Add shadcn init / components as needed. Use **npm** only.
