# ADR 0002 — API Client + Server State + Analytics

**Status**: In Progress  
**Date**: 2026-07-10  
**Feature**: API Client + Server State + Analytics (scope #3 / build-plan step 03)

## Context

Admin Web needs a typed authenticated path to the Mulhim Nest backend, shared TanStack Query wiring for later list/detail screens, and PostHog product analytics that identifies only after the admin gate. Auth already exposes `getSessionToken` / `fetchAdminMe` / `requireAdmin`; this feature replaces the ad-hoc profile fetch with a shared client and wires Query + PostHog foundations without domain CRUD modules yet.

## Decisions

1. **Shared `apiFetch`**: One helper in `src/lib/api/` for server and client. Accepts `token: string | null` (and path/method/body options). Attaches `Authorization: Bearer` when token is present. Uses `NEXT_PUBLIC_API_URL`. **Must not import** `@clerk/nextjs` or `@clerk/nextjs/server` — token retrieval stays in adapters (`getSessionToken` on server; later `useAuth().getToken()` in Query hooks).

2. **Error mapping**: `apiFetch` throws a typed error with a distinguishable kind so callers can branch:
   - **Authz miss** — HTTP 403/404 on gated calls (e.g. `/users/me` for non-admin / missing profile) → `requireAdmin` → `/forbidden`
   - **Technical failure** — network error or HTTP 5xx → rethrow; **never** treat as non-admin
   - **No session** — handled by `proxy.ts` / `auth()` before `requireAdmin` in practice

3. **`requireAdmin` outcomes**:
   - Non-admin / authz miss → `/forbidden`
   - Technical failure → rethrow → parent `(dashboard)/error.tsx` (“Admin API unavailable — retry”). Gate runs in nested `(dashboard)/(gated)/layout.tsx` so the outer segment’s `error.tsx` can catch it (Next.js does not catch errors from a same-segment layout).
   - Also: do not swallow Next.js `redirect()` inside `catch` (rethrow redirect errors)

4. **`fetchAdminMe` migration**: Keep `AdminMe` + `requireAdmin` in `src/lib/auth/`; implement `fetchAdminMe` via `apiFetch('/users/me', { token })`. No students/plans/subscriptions API modules in this step.

5. **TanStack Query**: `QueryClientProvider` mounted in **dashboard layout only**, after `requireAdmin()`. Server-new / browser-singleton client pattern; default `staleTime: 60_000`. Key factory in `src/lib/query/keys.ts` under `['admin', …]` (shape from architecture). No domain hooks yet. Optional React Query Devtools in development only.

6. **PostHog**:
   - **Init** at root `instrumentation-client.ts` (official Next.js pattern) so early `$pageview` / errors are not missed
   - **identify / reset** only in dashboard-scoped client `AdminAnalytics` (after admin confirmed); `identify(admin.id)`; `reset` on sign-out
   - Env (PostHog current Next.js docs + EU project): `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, `NEXT_PUBLIC_POSTHOG_HOST` (EU: `https://eu.i.posthog.com`)
   - Do not invent backend lifecycle event names; UI `admin_*` helpers may be stubbed for later wire steps

7. **Packages**: `@tanstack/react-query`, `@tanstack/react-query-devtools` (dev), `posthog-js` via npm.

## Build plan

1. [x] Install Query + PostHog packages; document env in `.env.example` (`NEXT_PUBLIC_API_URL`, PostHog token/host); align `architecture.md` / `library-docs.md` env names to `PROJECT_TOKEN`.
2. [x] Implement `src/lib/api` (`apiFetch` + typed errors); migrate `fetchAdminMe` onto it; refine `requireAdmin` branching + redirect rethrow; add `(dashboard)/error.tsx`.
3. [x] Add `src/lib/query` (QueryClient helper + `['admin', …]` key factory); mount `QueryClientProvider` in dashboard layout after `requireAdmin`.
4. [x] Add root `instrumentation-client.ts` PostHog init; dashboard `AdminAnalytics` for identify/reset; wire admin id from `requireAdmin` into the shell.

## Consequences

- Auth gate and all future API calls share one Bearer path without Clerk bundling conflicts.
- Nest outages no longer bounce real admins to `/forbidden`.
- Query is available only inside the admin shell; login/forbidden stay lean.
- PostHog can capture anonymous pageviews globally; Person profiles still only after dashboard identify.
- Domain API modules and Query hooks remain deferred to wire features (students, subscriptions, etc.).
