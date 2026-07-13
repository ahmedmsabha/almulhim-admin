# ADR 0014 — Support API Wiring

**Status**: In Progress  
**Date**: 2026-07-13  
**Feature**: Support API Wiring (scope #15 / build-plan step 15)

## Context

ADR 0013 shipped the Support Inbox split pane on Nest-shaped mock data with Reply/Close disabled. Nest already exposes admin list, detail, reply, and close under `/support/admin/requests/*`. This Wire step swaps the mock source for live Query + mutations, enables Reply/Close (except closed tickets), and adds optional Nest list search (`q`). Email side effects stay on the backend.

## Requirements

- **AC-1**: `/support` loads `AdminSupportRequestListResponse` from Nest `GET /support/admin/requests` via TanStack Query (`adminKeys.support.list`). Pass optional `status` and `q` as query params. No mock fallback on the live path.
- **AC-2**: Status chips and search keep URL `status=` / `q=`. Nest filters both. Selection stays URL `?id=` with auto-resync when the filtered list hides the selected id (same as ADR 0013).
- **AC-3**: Thread fills from the selected list row (full `AdminSupportRequestResponse`). No separate detail fetch this slice.
- **AC-4**: Reply enabled for `open` and `reviewed`: `PATCH …/reply` with `{ reply }` (trim, 1–5000). Nest overwrites `adminReply`, sets `reviewed`, may email the student. Re-reply allowed until closed.
- **AC-5**: Close enabled for non-closed tickets: `PATCH …/close`. Closed tickets keep permanent disable (textarea + Reply + Close).
- **AC-6**: On successful reply/close, invalidate `adminKeys.support.all()` (no `setQueriesData`), clear reply draft on reply success, capture PostHog `admin_support_replied` / `admin_support_closed` with `{ requestId }`.
- **AC-7**: Loading / empty / error with retry. `?state=loading|empty` preview remains. Remove mock-step helper copy.
- **AC-8**: Nest list gains optional `q` matching student `fullName`, `email`, and request `subject` (case-insensitive contains). Admin Web consumes it.

## Decisions

1. **Live wire on existing UI**: Keep split-pane from ADR 0013. Swap `SupportContainer` mock for Query. Enable composer mutations.

2. **Nest contracts**:

   | Action | Path |
   | --- | --- |
   | List | `GET /support/admin/requests?status=&q=` |
   | Detail (unused this slice) | `GET /support/admin/requests/:id` |
   | Reply | `PATCH /support/admin/requests/:id/reply` body `{ reply }` |
   | Close | `PATCH /support/admin/requests/:id/close` |

3. **Nest `q`**: Extend `listSupportRequestsQuerySchema` + `AdminSupportService.listRequests` with optional trimmed `q`. Prisma `OR` on `subject` contains and nested `user.fullName` / `user.email` contains (insensitive).

4. **Selection**: List-only. Mutation response upserts the row in list cache.

5. **Analytics**: Client PostHog only (`admin_support_replied` / `admin_support_closed`). No Nest support capture this slice.

6. **Re-reply**: Keep Nest overwrite rules (blocked only when `closed`).

7. **Query keys**: `adminKeys.support.list({ status?, q? })`; keep `.detail(id)` unused for now.

8. **Forms**: Zod for reply body matching Nest. Controlled textarea in composer (no RHF required for a single field).

## Feature design

| Concern | Choice |
| --- | --- |
| List | `GET /support/admin/requests` + `status` / `q` |
| Reply / Close | `PATCH …/reply`, `PATCH …/close` |
| Selection | `?id=` from list row |
| Auth | Existing `(gated)` + Bearer |
| Query keys | `adminKeys.support.list(filters)` |
| Analytics | `captureAdminEvent` on success |
| UI entry | `SupportContainer` on `/support` |

## Build plan

1. [x] Nest optional `q` on admin list + service tests. — AC-8
2. [x] Admin fetch/parse/hooks/mutations + `adminKeys.support.list`. — AC-1, AC-4, AC-5, AC-6
3. [x] Wire container/composer UI (enable actions, loading/error/empty, PostHog); drop mock live path. — AC-2, AC-3, AC-4, AC-5, AC-6, AC-7
4. [x] Area `AGENTS.md` + progress tracker / scope milestones. — AC-1…AC-8

## Consequences

- Client-side `filter-support` is no longer used for the live path (Nest owns status + q). Helpers may remain for tests or be unused.
- Detail endpoint stays available for a later refresh path if needed.
- Closed tickets cannot reply or close again (Nest 400 + UI disable).
