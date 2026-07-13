# ADR 0008 — Subscriptions Queue UI (Mock)

**Status**: Accepted  
**Date**: 2026-07-12  
**Feature**: Subscriptions Queue UI (Mock) (scope #6 / build-plan step 09)

## Context

`/subscriptions` is still a placeholder panel. Step 09 ships a Kinetic / stitch-aligned **Pending Queue** on Nest-shaped mock data so the list UI and navigation exist before step 10 wires live pending fetch, receipt URL, and approve / reject / suspend. Visual reference: `almulhim-admin-web-desgin/subscriptions_management/` (tabs + table). Stitch KPI strip and working Archived / AI Logs tabs stay out of this slice. Facade approach matches ADR 0005: Nest admin DTO first, live fetch later.

## Requirements

- **AC-1**: `/subscriptions` renders a Pending Queue table with columns: student (name + email), plan name, submitted date (`createdAt`), `StatusBadge`, AI verification display, and actions.
- **AC-2**: Pending tab is the default and only populated tab; Archived Decisions and AI Logs render as non-functional stub tabs (visible chrome, no datasets).
- **AC-3**: Search (`q`) filters mock rows by student name/email via URL search params (client-side).
- **AC-4**: View action and/or row navigation opens `/subscriptions/[id]` (placeholder until step 10). Approve / Reject / Suspend controls are visible but disabled.
- **AC-5**: `?state=loading` shows a queue skeleton; `?state=empty` shows the empty state; default shows filled pending mock (optionally filtered by `q`).
- **AC-6**: No live `GET /subscriptions/pending`, no TanStack Query hook, no receipt image viewer, no approve / reject / suspend mutations in this step.

## Decisions

1. **List-first composition**: PageHeader + tab chrome + search toolbar + pending table. Skip stitch KPI bento (Total Pending / AI % / discrepancies). No pagination this step (seed ~8–12 pending rows).

2. **Nest-shaped mock contract (required)**: Types in `src/lib/subscriptions/` match Mulhim Backend admin subscription responses (`admin-subscription.response.ts` / plan summary). Later wire step fetches into this same type. Query key later: `adminKeys.subscriptions` (already stubbed); no hook in this step.

   Target payload (camelCase, Nest DTO style). Later route: `GET /subscriptions/pending`.

   ```ts
   type SubscriptionPlanSummary = {
     id: string;
     name: string;
     priceAmount: number;
     currency: string;
     durationDays: number;
   };

   type AdminStudentSummary = {
     id: string;
     fullName: string;
     email: string;
     phoneNumber: string;
     region: string;
   };

   type AdminSubscriptionResponse = {
     id: string;
     status: SubscriptionStatus; // domain enum; pending tab seeds pending_review | pending_approval
     plan: SubscriptionPlanSummary;
     student: AdminStudentSummary;
     receiptSenderName: string | null;
     verificationResult: unknown;
     verifiedAt: string | null;
     approvedAt: string | null;
     rejectedAt: string | null;
     rejectionReason: string | null;
     expiresAt: string | null;
     suspendedAt: string | null;
     createdAt: string;
     updatedAt: string;
   };

   type AdminSubscriptionListResponse = {
     subscriptions: AdminSubscriptionResponse[];
   };
   ```

   Reuse `SubscriptionStatus` / `StatusBadge` from `src/lib/domain/subscription-status.ts`. UI labels region/status; does not invent alternate Nest status strings. Student contact field is Nest `phoneNumber` (not Students-list `phone`).

3. **AI column over `verificationResult: unknown`**: Keep Nest’s `unknown`. Add a small display parser + provisional mock objects (e.g. pass / warn / fail + short summary). Null or unparseable → “Awaiting AI” / “—”. Refine the parser against live Nest payloads in step 10; do not invent a second API field.

4. **URL-driven search + state preview**: `q` (text across student `fullName` / `email`). Filtering is client-side on the mock array. `?state=loading|empty` overrides the filled mock for design checks (same pattern as dashboard / students).

5. **Actions**: View (and row click/link) → `/subscriptions/[id]` minimal placeholder (PageHeader + panel). Approve / Reject / Suspend are disabled icon affordances only — no AlertDialogs, toasts, or mock status flips. Step 10 owns mutations + receipt signed URL.

6. **Tabs**: Pending Queue is default and shows mock pending rows (with count). Archived Decisions and AI Logs are stub tabs (disabled or empty panel) so stitch chrome is recognizable without second mock datasets.

7. **RSC boundary**: Page stays a Server Component that reads `searchParams`. Interactive toolbar/table pieces are `"use client"` as needed. Reuse shadcn `table`, `input`, `button`, `StatusBadge`, `PageHeader`, Kinetic Level 1 card patterns from `ui-registry.md`.

8. **Packages**: No new data libraries. Icons from Phosphor / existing icon set per project shadcn config. Tabs may be plain buttons or existing primitives — no requirement for a new tabs package unless already available.

## Feature design

| Concern | Choice |
| --- | --- |
| Path (later wire) | `GET /subscriptions/pending` |
| Response | `AdminSubscriptionListResponse` above |
| Auth | Existing admin gate (page under `(gated)`) |
| Query key (later) | `adminKeys.subscriptions` |
| UI entry | Subscriptions page → Pending Queue (mock) |
| Detail stub | `/subscriptions/[id]` until step 10 |
| Visual source | `almulhim-admin-web-desgin/subscriptions_management/` (table + tabs; no KPIs) |

## Build plan

1. [x] Types + mock-data + verification display parser in `src/lib/subscriptions/`. — AC-1, AC-6
2. [x] Components: container/view, tabs chrome, search toolbar, table, skeleton, empty; wire `/subscriptions` + `[id]` stub. — AC-1…AC-5
3. [x] `?state=` + `q` filtering; disabled mutate actions; View → detail. — AC-3, AC-4, AC-5
4. [x] Area `AGENTS.md` + ui-registry imprint + progress tracker / scope milestones. — AC-1…AC-6

## Consequences

- Step 10 swaps mock for `GET /subscriptions/pending` behind the same types; detail page gains receipt URL + approve / reject / suspend.
- Stitch KPI strip and live Archived / AI Logs remain intentionally incomplete vs design HTML.
- `verificationResult` display may need a one-line parser tweak when live Nest AI JSON is confirmed.
