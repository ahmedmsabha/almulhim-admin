# ADR 0013 — Support Inbox UI (Mock)

**Status**: Accepted  
**Date**: 2026-07-13  
**Feature**: Support Inbox UI (Mock) (scope #8 / build-plan step 14)

## Context

`/support` is still a placeholder panel. Step 14 ships a Kinetic / stitch-aligned split-pane Support Inbox on Nest-shaped mock data so the list and thread UI exist before step 15 wires live `GET/PATCH /support/admin/requests/*`. Visual reference: `almulhim-admin-web-desgin/support_requests/`. Stitch KPI strip and chat extras Nest does not model stay out of this slice. Facade approach matches ADR 0008: Nest admin DTO first, live fetch later.

## Requirements

- **AC-1**: `/support` renders a split pane: left request list (student name, subject preview or message preview, `TicketStatusBadge`, timestamp) and right thread pane (student identity, subject, student `message`, optional `adminReply`).
- **AC-2**: Status chips filter All | Open | Reviewed | Closed via URL `status=` (optional; All omits the param). Client-side filter on mock rows matching Nest `open` | `reviewed` | `closed`.
- **AC-3**: Search (`q`) filters mock rows by student name, email, or subject via URL (client-side).
- **AC-4**: Selection uses URL `?id=`. Changing `status` or `q` such that the selected id is no longer in the filtered list auto-selects the first matching row (or clears `id` when the filtered list is empty).
- **AC-5**: Reply textarea and Close / Send Reply controls are visible but disabled. Helper copy distinguishes (a) mock-wide temporary disable (wiring lands in step 15) from (b) closed-ticket permanent disable (Nest will keep reply blocked after wire).
- **AC-6**: Arabic `message` / `adminReply` bodies render with `dir="rtl"` (and right alignment). Shell stays LTR.
- **AC-7**: `?state=loading` shows inbox skeleton; `?state=empty` shows empty state; default shows filled mock (optionally filtered).
- **AC-8**: No live support admin API calls, no TanStack Query hooks, no PostHog, no mutations in this step.

## Decisions

1. **Composition**: PageHeader + filter chips + search + split-pane Level 1 card. Skip stitch KPI strip (Open Tickets / Avg Response / Resolved Today). No `/support/[id]` route.

2. **Nest-shaped mock contract (required)**: Types in `src/lib/support/` match Mulhim Backend `AdminSupportRequestResponse` / `AdminSupportRequestListResponse`. Later wire step fetches into the same types. Query keys already stubbed as `adminKeys.support`.

   ```ts
   type AdminSupportStudentSummary = {
     id: string;
     fullName: string;
     email: string;
     phoneNumber: string;
     region: "gaza" | "west_bank";
   };

   type AdminSupportRequestResponse = {
     id: string;
     subject: string;
     message: string;
     status: SupportRequestStatus; // open | reviewed | closed
     adminReply: string | null;
     reviewedAt: string | null;
     closedAt: string | null;
     createdAt: string;
     student: AdminSupportStudentSummary;
   };

   type AdminSupportRequestListResponse = {
     requests: AdminSupportRequestResponse[];
   };
   ```

3. **Drop stitch inventions**: No channel (Mobile/Web), priority, CDN avatars, attach / emoji / print. Initials avatar from student name. Subject + Nest student fields only.

4. **Thread presentation**: One student bubble (`message`) plus optional admin bubble (`adminReply`). Not a multi-message history API.

5. **TicketStatusBadge**: Separate component from subscription `StatusBadge`. Maps `open` | `reviewed` | `closed` onto existing Kinetic status color tokens (pending-approval / active / expired respectively) without inventing subscription enum values.

6. **Composer disable messaging**:
   - Closed ticket: permanent helper (cannot reply / close again).
   - Otherwise (mock step): temporary helper that reply and close wire in step 15.

7. **URL params**: `id`, `status`, `q`, `state`. Interactive pieces use `router.replace` with `scroll: false`.

8. **RSC boundary**: Page is a Server Component reading `searchParams`. Interactive inbox is `"use client"`.

9. **Packages**: No new data libraries. Phosphor icons per project config.

10. **Testing**: `/test` waived for this feature; `/check verify` is enough.

## Feature design

| Concern | Choice |
| --- | --- |
| Path (later wire) | `GET /support/admin/requests` (+ optional `?status=`) |
| Detail (later) | `GET /support/admin/requests/:id` |
| Mutations (later) | `PATCH .../reply`, `PATCH .../close` |
| Response | `AdminSupportRequestListResponse` above |
| Auth | Existing admin gate (`(gated)`) |
| Query key (later) | `adminKeys.support` |
| UI entry | `/support` split-pane mock |
| Visual source | `almulhim-admin-web-desgin/support_requests/` (split pane; no KPIs) |

## Build plan

1. [x] Domain `SupportRequestStatus` + `TicketStatusBadge`; types + mock + filter helpers in `src/lib/support/`. — AC-1, AC-2, AC-3, AC-8
2. [x] Components: container/view, list, thread, composer (disabled + dual helpers), skeleton, empty; wire `/support`. — AC-1…AC-7
3. [x] `?id=` auto-resync when filters hide selection; `?state=` preview. — AC-4, AC-7
4. [x] Area `AGENTS.md` + ui-registry imprint + progress tracker / scope milestones. — AC-1…AC-8

## Consequences

- Step 15 swaps mock for live list/detail and enables reply/close (except closed tickets keep permanent disable).
- Stitch KPI strip and multi-bubble chat remain intentionally incomplete vs design HTML.
- Nest list has no `q` yet; client-side search may become server-side later or stay client-only.
