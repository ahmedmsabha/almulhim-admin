# ADR 0006 — Student Detail + Devices

**Status**: In Progress  
**Date**: 2026-07-12  
**Feature**: Student Detail + Devices (scope #10 / build-plan step 07)

## Context

Step 06 shipped `/students` on a Nest-shaped mock list and a `/students/[userId]` placeholder (ADR 0005). Nest now exposes filtered/paginated `GET /users`, `GET /users/:userId`, and admin device list/reset under `devices/admin`. This Wire step replaces the list mock with live `GET /users`, and builds the detail page with profile + device bindings + confirmed resets. Visual reference for per-student bindings: stitch drill-down in `almulhim-admin-web-desgin/students_devices/` (dedicated route, not inline accordion). Stitch KPI bento, bindings map, and org-wide emergency reset stay out — no Nest surface.

## Requirements

- **AC-1**: `/students` loads `StudentListResponse` from Nest `GET /users` with URL filters as query params (`q`, `region`, `status`, `page`, `pageSize`); TanStack Query key includes those filters.
- **AC-2**: `/students/[userId]` loads profile from `GET /users/:userId` (`StudentListItem`) and bindings from `GET /devices/admin/users/:userId/bindings`.
- **AC-3**: Detail shows web/mobile slots from Nest bindings (`deviceType`, `boundAt`, `lastSeenAt`); empty slot when unbound. No hash field (Nest does not return one).
- **AC-4**: Reset one (`DELETE .../bindings/:deviceType`) and reset all (`DELETE .../bindings`) require `AlertDialog` confirm; on success UI refreshes (response body and/or query invalidation).
- **AC-5**: Loading / empty / error states on list and detail (in-page retry; no silent mock fallback). Optional `?state=loading|empty` preview remains for design checks.
- **AC-6**: On successful reset, capture PostHog `admin_device_reset` with `userId` and `deviceType` or `all`.

## Decisions

1. **Wire list + detail together**: Live Nest for both. Mock-only list with live detail would break deep links (mock ids ≠ Nest UUIDs).

2. **Nest list contract (live)**: `GET /users` optional query `q` | `region` | `status` | `page` (default 1) | `pageSize` (default 10, max 100). Response:

   ```ts
   type StudentListItem = {
     id: string;
     fullName: string;
     email: string;
     phone: string | null;
     telegram: string | null;
     region: "gaza" | "west_bank";
     subscriptionStatus: SubscriptionStatus;
   };

   type StudentListResponse = {
     students: StudentListItem[];
     total: number;
     page: number;
     pageSize: number;
   };
   ```

   Align `src/lib/students` types with this; drop client-side full-list filtering. URL params map 1:1 to Nest query. Supersedes ADR 0005 “mock until later wire” for the data path; list UI composition from ADR 0005 stays.

3. **Detail profile**: `GET /users/:userId` (UUID, admin) returns the same `StudentListItem`. `404` → not-found UI on the detail page (do not bounce to `/forbidden`).

4. **Devices contract**:

   | Action | Path |
   | --- | --- |
   | List | `GET /devices/admin/users/:userId/bindings` |
   | Reset one | `DELETE /devices/admin/users/:userId/bindings/:deviceType` (`web` \| `mobile`) |
   | Reset all | `DELETE /devices/admin/users/:userId/bindings` |

   Response (list and deletes):

   ```ts
   type AdminDeviceBindingResponse = {
     deviceType: "web" | "mobile";
     boundAt: string; // ISO
     lastSeenAt: string | null;
   };

   type AdminDeviceBindingListResponse = {
     userId: string;
     bindings: AdminDeviceBindingResponse[];
   };
   ```

5. **UI composition**: Detail = PageHeader (name) + profile summary card + “Active Device Bindings” grid (stitch cards) + Reset all. No KPI bento, map, or global org reset.

6. **Confirm + analytics**: shadcn `AlertDialog` before destructive resets. `captureAdminEvent('admin_device_reset', { userId, scope: 'one' \| 'all', deviceType? })`. Prefer mutation response to `setQueryData`; also invalidate `adminKeys.devices.byUser(userId)`.

7. **Query keys**: List `adminKeys.students.all()` extended with filter object (or dedicated `list(filters)`); detail `adminKeys.students.detail(userId)`; devices `adminKeys.devices.byUser(userId)`. Token via Clerk `getToken` + `apiFetch` (ADR 0002).

8. **Containers**: Mirror Dashboard Data — client containers for list and detail; pages stay RSC. Reuse `StudentsView` / toolbar / table where possible; swap mock for Query.

9. **Packages**: Add shadcn `alert-dialog` if missing. No new data libraries.

## Feature design

| Concern | Choice |
| --- | --- |
| List path | `GET /users` |
| Detail path | `GET /users/:userId` |
| Devices | `GET/DELETE /devices/admin/users/:userId/bindings[/:deviceType]` |
| Auth | Existing `(gated)` admin gate + Bearer |
| Query keys | `students` list/detail + `devices.byUser` |
| UI entry | `StudentsListContainer` / `StudentDetailContainer` |
| Visual source | stitch device cards on dedicated detail route |

## Build plan

1. [x] Types + fetch/parse for students list/detail and devices; extend `adminKeys.students` for filtered list; hooks + reset mutations. — AC-1, AC-2, AC-4
2. [x] Add `alert-dialog`; build detail UI (profile + device cards + confirms); wire `[userId]` container (loading/error/404). — AC-2, AC-3, AC-4, AC-5
3. [x] Wire `/students` list to live Query (keep toolbar URL filters + `?state=` preview); remove mock as default path. — AC-1, AC-5
4. [x] PostHog `admin_device_reset` on success; update students `AGENTS.md`, ui-registry, progress tracker, scope milestones. — AC-6

## Consequences

- Students directory and detail are production-wired against Nest; mock remains only for `?state=` previews if kept.
- Scope “binding hashes” wording is obsolete — Nest exposes type + timestamps only.
- ADR 0005 list UI decisions remain; its mock-only AC-6 is superseded by this wire for the default path.
- Org-wide device reset and bindings map stay out of Admin Web until Nest supports them.
