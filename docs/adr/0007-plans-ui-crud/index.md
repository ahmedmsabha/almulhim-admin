# ADR 0007 — Plans UI + CRUD

**Status**: Accepted  
**Date**: 2026-07-12  
**Feature**: Plans UI + CRUD (scope #11 / build-plan step 08)

## Context

`/plans` is still a placeholder. Nest already exposes admin plan CRUD under `/plans`. This is a **Wire** step (no mock-first phase): ship the Kinetic / stitch-aligned plans table and create/edit dialog against live Nest contracts. Visual reference: `almulhim-admin-web-desgin/subscription_plans/` (header + table + modal). Stitch KPI bento, subscriber counts, and “key features” chips stay out — Nest `AdminPlanResponse` has no surface for them.

## Requirements

- **AC-1**: `/plans` loads `AdminPlanListResponse` from Nest `GET /plans/all` via TanStack Query (`adminKeys.plans`).
- **AC-2**: Table shows name, price (+ currency), durationDays, sortOrder, isActive, and edit action; inactive rows may be visually muted.
- **AC-3**: Create opens a dialog → `POST /plans` with Zod-validated payload; inline field errors on client validation and Nest `400` validation failures.
- **AC-4**: Edit opens the same dialog prefilled → `PATCH /plans/:id`; supports name, description, priceAmount, currency, durationDays, sortOrder, isActive.
- **AC-5**: Row active switch and edit-dialog `isActive` both call `PATCH` with `{ isActive }`; no confirm; on failure revert switch and surface error. Create omits `isActive` (Nest create schema; DB default applies).
- **AC-6**: Loading / empty / error states with in-page retry; no silent mock fallback. After successful create/update/toggle, invalidate (and optionally `setQueryData` from response) so the list refreshes.

## Decisions

1. **Wire immediately**: Scope marks Plans as Wire. No Nest-shaped mock module or `?state=` requirement for Done-when (optional preview may be added later for design checks).

2. **Nest admin contract** (source of truth — Mulhim Backend `plan.response.ts` / create & update schemas):

   | Action | Path |
   | --- | --- |
   | List all | `GET /plans/all` |
   | Create | `POST /plans` |
   | Update / disable | `PATCH /plans/:id` |

   ```ts
   type AdminPlanResponse = {
     id: string;
     name: string;
     description: string | null;
     priceAmount: number; // integer minor units
     currency: string; // ISO 4217, length 3
     durationDays: number;
     sortOrder: number;
     isActive: boolean;
     createdAt: string; // ISO
     updatedAt: string; // ISO
   };

   type AdminPlanListResponse = {
     plans: AdminPlanResponse[];
   };
   ```

   Create body: `name`, optional `description`, `priceAmount` (int positive), `currency` (default `ILS`), `durationDays` (int positive), `sortOrder` (default `0`).  
   Update body: partial of those fields plus `isActive` / nullable `description`; at least one field required. No hard delete.

3. **Price UX**: UI shows and edits **major units** (e.g. `99.00`); convert to/from integer `priceAmount` at the form ↔ API boundary (×100 / ÷100). Assume 2-decimal currencies for v1. Currency is editable in the form (default `ILS`), not hard-coded to `$`.

4. **UI composition**: PageHeader + “Add New Plan” + plans table + create/edit dialog on `/plans` only (no `/plans/[id]`). Cut stitch KPI bento, subscriber column, features chips, export/filter chrome that has no Nest backing.

5. **Active toggle**: Inline row switch **and** `isActive` in the edit dialog. No AlertDialog confirm (not destructive like device reset). Optimistic or immediate PATCH; revert + error on failure.

6. **Forms**: `zod` + `react-hook-form` + `@hookform/resolvers` per `.context/library-docs.md`. Client schemas mirror Nest create/update rules; map Nest `BadRequestException` flatten errors to fields when present.

7. **Query + cache**: `adminKeys.plans.all()` (extend with `list()` if useful). Invalidate after successful mutations; prefer merging mutation `AdminPlanResponse` into cache when easy.

8. **Analytics**: No PostHog events for this slice (low-frequency config). Revisit later if product wants `admin_plan_saved`.

9. **Packages / primitives**: Install form stack if missing. Add shadcn `dialog`, `switch`, `label`, `textarea` (and form helpers as needed). Token via Clerk `getToken` + `apiFetch` (ADR 0002). Containers mirror Dashboard / Students — client container, RSC page.

## Feature design

| Concern | Choice |
| --- | --- |
| List | `GET /plans/all` |
| Create | `POST /plans` |
| Update / disable | `PATCH /plans/:id` |
| Auth | Existing `(gated)` admin gate + Bearer |
| Query keys | `adminKeys.plans` |
| UI entry | `PlansContainer` on `/plans` |
| Visual source | stitch table + modal; Nest fields only |

## Build plan

1. [x] Types + parse + money helpers + fetch/mutations; Query hooks; extend `adminKeys.plans`. — AC-1, AC-5, AC-6
2. [x] Install Zod/RHF; add shadcn dialog/switch/label/textarea; plans table + skeleton + error panel. — AC-1, AC-2, AC-6
3. [x] Create/edit dialog form (major-units price); wire create + update + inline toggle; invalidate list. — AC-3, AC-4, AC-5
4. [x] Wire `/plans` page + plans `AGENTS.md` + ui-registry + progress tracker / scope milestones. — AC-1…AC-6

## Consequences

- `/plans` becomes the first admin form surface using RHF + Zod; later Content / Announcements / reject reasons reuse the same stack.
- Stitch dollar / subscriber / KPI chrome is intentionally incomplete vs design HTML — honesty to Nest wins.
- Create cannot set `isActive` until Nest extends `createPlanSchema`; UI relies on DB default (expected `true`).
