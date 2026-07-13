# ADR 0005 — Students List UI (Mock)

**Status**: In Progress  
**Date**: 2026-07-10  
**Feature**: Students List UI (Mock) (scope #5 / build-plan step 06)

## Context

`/students` is still a placeholder panel. Step 06 ships a Kinetic / stitch-aligned enrollment directory on typed mock data so the list UI is complete before a later wire to Nest `GET /users`. Visual reference: `almulhim-admin-web-desgin/students_devices/` (table + filters). Stitch also shows KPI bento, inline device accordion, bindings map, and bulk reset; those belong to step 07 (Student Detail + Devices), not this slice. Facade approach matches ADR 0003: Nest-shaped mock contract first, live fetch later.

## Requirements

- **AC-1**: `/students` renders an enrollment table with columns for profile (name + id), contact (email + phone), Telegram, region, and subscription status (`StatusBadge`).
- **AC-2**: Search (`q`) and filters (`region`, `status`) work on mock rows; values live in URL search params.
- **AC-3**: Row click / link navigates to `/students/[userId]` (placeholder page until step 07).
- **AC-4**: `?state=loading` shows a list skeleton; `?state=empty` shows the empty state; default shows filled mock (filtered).
- **AC-5**: Client pagination (page size 10) with a footer showing range and prev/next on the filtered mock set.
- **AC-6**: No live `GET /users`, no TanStack Query hook, no device reset UI in this step.

## Decisions

1. **List-first composition**: Page header + filter toolbar + enrollment table + pagination footer. Skip stitch KPIs, inline device drill-down, bindings map, and bulk reset (step 07).

2. **Nest-shaped mock contract (required)**: Types in `src/lib/students/mock-data.ts` match the **intended** Nest admin student list response. A later wire step fetches (or composes into) this same type. Query key later: `adminKeys.students.all()` (already stubbed); no hook in this step.

   Target payload (camelCase, Nest DTO style). Likely route later: `GET /users`.

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

   type StudentListItem = {
     id: string;
     fullName: string;
     email: string;
     phone: string | null;
     telegram: string | null;
     region: Region;
     subscriptionStatus: SubscriptionStatus;
   };

   type StudentListResponse = {
     students: StudentListItem[];
     total: number;
     page: number;
     pageSize: number;
   };
   ```

   Domain enums match architecture. UI formats labels (e.g. “Gaza Strip”) but does not invent alternate status or region strings. Prefer shared `Region` in `src/lib/domain/` (alongside `subscription-status.ts`) rather than forking dashboard-only types.

3. **URL-driven filters**: `q` (text across name/email/phone/telegram), `region` (`gaza` | `west_bank` | unset = all), `status` (subscription status | unset = all). Filtering is client-side on the mock array for the facade.

4. **State preview**: Same pattern as dashboard. `?state=loading|empty` overrides the filled mock for design checks.

5. **Detail stub**: Add `(gated)/students/[userId]/page.tsx` as a minimal placeholder (PageHeader + panel) so navigation is real. Device bindings UI is out of scope.

6. **Header actions**: Optional “Export CSV” control is visual only (disabled or non-functional), matching dashboard decorative actions. Do not ship stitch’s “View Students” primary CTA on the list page itself.

7. **RSC boundary**: Page stays a Server Component that reads `searchParams`. Interactive filter/table/pagination pieces are `"use client"` as needed. Reuse shadcn `table`, `input`, `select` (add via project config if missing), `StatusBadge`, `PageHeader`, Kinetic Level 1 card patterns from `ui-registry.md`.

8. **Packages**: No new chart or data libraries. Icons from Phosphor / existing icon set per project shadcn config.

## Feature design

| Concern | Choice |
| --- | --- |
| Path (later wire) | `GET /users` |
| Response | `StudentListResponse` above |
| Auth | Existing admin gate (page under `(gated)`) |
| Query key (later) | `adminKeys.students.all()` |
| UI entry | Students page → list view (mock) |
| Visual source | `almulhim-admin-web-desgin/students_devices/` (table section) |

## Build plan

1. [x] Extract shared `Region` (+ labels) to `src/lib/domain/`; add Nest-shaped types + `mockStudentList` in `src/lib/students/mock-data.ts`. — AC-1 contract
2. [x] Add students UI (`StudentsToolbar`, `StudentsTable`, `StudentsSkeleton`, compose `StudentsView`) under `src/components/students/`; add missing shadcn primitives if needed. — AC-1, AC-2, AC-5
3. [x] Wire `(gated)/students/page.tsx` (`searchParams` filters + `?state=`); add `(gated)/students/[userId]/page.tsx` placeholder. — AC-2, AC-3, AC-4, AC-6
4. [x] Update `ui-registry.md`, progress tracker, scope milestones. — docs

## Consequences

- `/students` looks production-ready on mocks; a later students wire step is fetch + Query only.
- Step 07 owns detail profile, device bindings, and reset confirmations.
- If Nest’s live `GET /users` DTO diverges, update this ADR and the shared type once; do not fork a UI-only list type.
- Query-param state preview is a facade aid; remove or gate when live loading/empty exist.
