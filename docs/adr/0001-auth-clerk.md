# ADR 0001 — Auth (Clerk)

**Status**: In Progress  
**Date**: 2026-07-10  
**Feature**: Auth (scope #2)

## Context

Mulhim Admin Web must authenticate a single teacher/admin, protect dashboard routes, confirm `admin` role via the Mulhim Backend (not Clerk claims alone), expose a Bearer token for later API client work, and show a forbidden state for signed-in non-admins.

## Decisions

1. **Provider**: Clerk (`@clerk/nextjs`) only.
2. **Session protection**: `src/proxy.ts` exports `clerkMiddleware()` (Next.js 16 + current Clerk quickstart). Protect all routes except `/login` and `/forbidden` via `createRouteMatcher` + `auth.protect()`.
3. **Admin role gate**: Server helper `requireAdmin()` in `src/lib/auth/`, called from `(dashboard)/layout.tsx`. Fetches backend profile with Bearer token; non-admin → `/forbidden`. Fail closed if API/token unavailable.
4. **Forbidden state**: Dedicated `/forbidden` page outside the dashboard shell (message + sign out). Not a silent redirect to login.
5. **Login**: `/login` outside shell using Clerk `<SignIn />`; after sign-in → `/dashboard`. Sign-in focused (no custom sign-up UI in this app).
6. **Token for API client**: `getSessionToken()` / thin `fetchAdminMe()` under `src/lib/auth/`. Full typed `src/lib/api` stays in the next feature.
7. **Shell polish**: Sidebar/topbar use Clerk `UserButton` for logout; keep Lucide nav icons for now.

## Build plan

1. Install Clerk; add env example (`NEXT_PUBLIC_CLERK_*`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_API_URL`, sign-in URL helpers).
2. Root `ClerkProvider`; `src/proxy.ts` session protection.
3. `(auth)/login` SignIn page; `/forbidden` page.
4. `src/lib/auth` helpers: token, fetch me, `requireAdmin`.
5. Wire `requireAdmin` in dashboard layout; UserButton in sidebar/topbar.

## Consequences

- Dashboard pages never render without a confirmed backend admin.
- Auth feature depends on `NEXT_PUBLIC_API_URL` and a working `GET /users/me` (or equivalent) on the Nest API.
- Next feature (API Client) reuses `getSessionToken` rather than inventing a second token path.
