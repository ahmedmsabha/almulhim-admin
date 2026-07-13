# ADR 0003 — Dashboard UI (Mock)

**Status**: In Progress  
**Date**: 2026-07-10  
**Feature**: Dashboard UI (Mock) (scope #4 / build-plan step 04)

## Context

`/dashboard` is still a placeholder. Step 04 ships a stitch-aligned Analytics Dashboard on typed mock data so the UI is complete before step 05 wires live aggregates. Visual source: `almulhim-admin-web-desgin/dashboard_analytics/`. Kinetic tokens and the existing shell stay; shadcn (base-lyra + Phosphor) supplies primitives. Nest has no dedicated dashboard stats route yet; Admin Web still needs a stable response contract so step 05 only swaps the data source.

## Decisions

1. **Facade page**: Full stitch composition on `/dashboard` (header actions, four KPIs, growth chart, region bars, recent activity table). No live Nest or PostHog aggregates in this step.

2. **shadcn**: Use the installed project config (base-lyra, Phosphor, `@/components/ui`). Add `card`, `badge`, `table`, `skeleton`, `empty`, `chart`, `avatar`, `separator` as needed. Keep the custom `AppSidebar` / `AppTopbar`. Remap shadcn `:root` CSS variables onto Kinetic primary / surfaces so indigo branding is not replaced by the preset neutrals.

3. **Charts**: Recharts via shadcn `chart` for Subscription Growth and KPI sparklines (client islands). Region Distribution uses horizontal progress bars (stitch), not a pie.

4. **RSC boundary**: Page stays a Server Component. Chart and sparkline pieces are `"use client"`.

5. **Header actions**: “Last 30 Days” and “Export Report” are visual only (disabled or non-functional). “View All Students” links to `/students`.

6. **State preview**: Default shows filled mock. `?state=loading` renders `DashboardSkeleton`. `?state=empty` renders empty activity (and empty-friendly chart/KPI treatment). Step 05 replaces the query param with TanStack Query status.

7. **Nest-shaped mock contract (required)**: Types in `src/lib/dashboard/mock-data.ts` match the **intended Nest admin dashboard response**, not UI-only convenience shapes. Step 05 fetches (or composes into) this same type and passes it through; no remapping layer.

   Target payload (camelCase, Nest DTO style). Query key later: `['admin', 'dashboard', 'stats']`. Likely route in step 05: `GET /analytics/admin/dashboard` or equivalent; if Nest ships a different path, the **body shape below stays the contract**.

   ```ts
   type Region = "gaza" | "west_bank";
   type SubscriptionStatus =
     | "free"
     | "pending_review"
     | "pending_approval"
     | "active"
     | "expired"
     | "rejected"
     | "suspended";

   type DashboardStats = {
     range: {
       from: string; // ISO date
       to: string;   // ISO date
       preset: "last_30_days";
     };
     kpis: {
       totalStudents: number;
       totalStudentsChangePct: number;
       activeSubscriptions: number;
       activeSubscriptionsChangePct: number;
       pendingApprovals: number; // pending_review + pending_approval
       openSupportTickets: number; // support status open
       openSupportTicketsChangePct: number;
     };
     sparklines: {
       totalStudents: number[];
       activeSubscriptions: number[];
       openSupportTickets: number[];
     };
     subscriptionGrowth: Array<{
       date: string; // ISO date (day)
       newCount: number;
       renewalsCount: number;
     }>;
     regionDistribution: Array<{
       region: Region;
       activeUsers: number;
       percent: number;
     }>;
     recentActivity: Array<{
       userId: string;
       fullName: string;
       region: Region;
       planName: string | null;
       subscriptionStatus: SubscriptionStatus;
       lastLoginAt: string; // ISO datetime
     }>;
   };
   ```

   Domain enums match architecture (`gaza` / `west_bank`, subscription statuses, support `open`). UI may format labels (e.g. “Gaza Strip”) but must not invent alternate status strings.

8. **Packages**: Recharts arrives via `npx shadcn@latest add chart`. Icons from `@phosphor-icons/react`.

## Build plan

1. [x] Remap shadcn CSS vars to Kinetic; add UI primitives (`card`, `badge`, `table`, `skeleton`, `empty`, `chart`, `avatar`, `separator`).
2. [x] Add Nest-shaped types + `mockDashboardStats` in `src/lib/dashboard/mock-data.ts`.
3. [x] Build dashboard components (`KpiCard`, growth chart, region bars, activity table, skeleton, header actions) under `src/components/dashboard/`.
4. [x] Wire `(gated)/dashboard/page.tsx` with `searchParams.state` preview; update `ui-registry.md` + progress tracker.

## Consequences

- `/dashboard` looks production-ready on mocks; step 05 is fetch + Query only.
- Chart library choice is locked (Recharts / shadcn chart).
- If Nest’s eventual DTO diverges, update this ADR and the shared type once; do not fork a UI-only type.
- Query-param state preview is a facade aid; remove or gate when live loading/empty exist.
