# ADR 0004 — Dashboard Data

**Status**: In Progress  
**Date**: 2026-07-10  
**Feature**: Dashboard Data (scope #9 / build-plan step 05)

## Context

Step 04 shipped `/dashboard` on Nest-shaped mock `DashboardStats` (ADR 0003). This step replaces the mock data source with a live fetch so KPIs, charts, and activity use real aggregates. Nest’s published admin surface (Backend README) has no dedicated dashboard stats route yet; Admin Web still needs a stable contract and Query wiring so the UI does not invent a remapping layer. Aggregates must not be composed in the browser from list endpoints (incomplete for sparklines / growth series; business logic belongs on Nest). PostHog on Admin Web is product analytics only (no personal API key for ops KPIs).

## Requirements

- **AC-1**: `/dashboard` loads `DashboardStats` from the Mulhim Backend via authenticated `apiFetch` (Bearer from Clerk).
- **AC-2**: TanStack Query uses key `['admin', 'dashboard', 'stats', userId]` (`adminKeys.dashboard.stats(userId)`). Cache clears on Clerk sign-out.
- **AC-3**: First load shows `DashboardSkeleton`; empty payload shows the empty-friendly view; fetch failures show an in-page error with retry (not silent mock fallback).
- **AC-4**: Authz failures on the admin gate still go to `/forbidden`; dashboard fetch technical errors stay on the page (do not bounce admins to forbidden for a missing stats route).
- **AC-5**: Existing `DashboardView` / chart components keep consuming `DashboardStats` with no field remapping.
- **AC-6**: Optional `?state=loading|empty` remains a UI preview only; default path is live Query status.

## Decisions

1. **Nest live DTO is the contract**: Admin Web consumes the body returned by Mulhim Backend `AdminAnalyticsService.getDashboard()` (flat KPIs, `subscriptionGrowth[].count`, `regionDistribution[].count`, activity `{ id, studentName, action, timestamp }`). The richer ADR 0003 mock shape is superseded for the wire path.

2. **No PostHog for dashboard KPIs**: PostHog stays identify / UI events. Ops aggregates come from Nest.

3. **Client Query hook**: `useDashboardStats` in a client container. Token via `useAuth().getToken()` then `apiFetch`. Matches ADR 0002 (Clerk stays out of `apiFetch`). Page RSC renders the client container.

4. **States**: `isPending` → skeleton; successful empty-ish payload → empty view; `isError` → `DashboardErrorPanel` with `refetch`. No production silent fallback to `mockDashboardStats`.

5. **Preview query param**: Keep `?state=loading|empty` for design checks without Nest. When `state` is set, skip the live query and render the preview. When unset, use Query only.

6. **Nest dependency**: Nest documents `GET /analytics/admin/dashboard` (admin role). Admin Web consumes it as the single aggregate source. Body must match ADR 0003 `DashboardStats`; path is locked to that README entry.

## Feature design

| Concern | Choice |
| --- | --- |
| Path | `GET /analytics/admin/dashboard` |
| Response | Nest `DashboardStats` (flat KPIs + growth `count` + region `count` + activity feed) |
| Auth | Admin Bearer (existing gate + token) |
| Query key | `adminKeys.dashboard.stats(userId)` |
| UI entry | `DashboardContainer` (client) → skeleton / error / `DashboardView` |
| Packages | Existing `@tanstack/react-query`, `@clerk/nextjs`, `apiFetch` |

## Build plan

1. [x] Add `fetchDashboardStats(token)` + `useDashboardStats()` (Query). — satisfies AC-1, AC-2
2. [x] Add `DashboardContainer` + in-page error panel; wire `(gated)/dashboard/page.tsx` (live + optional `?state=`). — satisfies AC-3, AC-4, AC-5, AC-6
3. [x] Update dashboard `AGENTS.md`, progress tracker, scope milestones. — docs

## Consequences

- `/dashboard` is fetch + Query only relative to step 04 UI.
- Nest documents `GET /analytics/admin/dashboard` (Backend README); Admin Web expects the ADR 0003 `DashboardStats` body. If the live DTO diverges, update ADR 0003/0004 and the shared type once.
- List-endpoint composition and PostHog Query API remain out of scope for Admin Web.
