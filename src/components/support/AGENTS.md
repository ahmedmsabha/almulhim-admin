# Support area

Conventions for Support Inbox live wire (ADR 0014). UI shell from ADR 0013.

## File pointers

- Page: `src/app/(dashboard)/(gated)/support/page.tsx` (RSC; live or `?state=` preview)
- Container / view: `SupportContainer`, `SupportView`
- UI: `src/components/support/`
- Fetch / hooks: `src/lib/support/` (`fetch-support`, parse, list hook, mutations, reply schema)
- Preview empty fixture: `src/lib/support/mock-data.ts` (`?state=empty` only)
- Domain status: `src/lib/domain/support-request-status.ts`
- Badge: `src/components/shared/TicketStatusBadge.tsx` (not subscription `StatusBadge`)
- Query keys: `adminKeys.support.list({ status?, q? })`, `.detail(id)` (detail unused this slice)
- Visual registry: `.context/ui-registry.md`
- ADRs: `docs/adr/0013-support-inbox-ui-mock/`, `docs/adr/0014-support-api-wiring/`

## Conventions

- Nest-shaped DTOs only (`AdminSupportRequestResponse` with nested `student`).
- One request = student `message` + optional single `adminReply` (not a chat history API).
- Live path: TanStack Query + Clerk `getToken` + `apiFetch`. No mock fallback.
- Nest list filters: optional `status` and `q` (name, email, subject).
- URL: `?id=` selection, `?status=` filter, `?q=` search, `?state=loading|empty` preview.
- When filters hide the selected id, auto-select the first visible row (or clear `id`).
- Thread fills from the selected list row (no detail fetch).
- Reply / Close enabled for non-closed tickets. Closed = permanent disable.
- Reply body: Zod `replySupportSchema` (trim, 1–5000). Nest may overwrite `adminReply` on re-reply.
- On success: invalidate `adminKeys.support` only (no setQueriesData); PostHog `admin_support_replied` / `admin_support_closed`.
- While list `isFetching` after invalidate: list dims (`opacity-60`) + small “Updating…” spinner so the refetch gap is visible.
- Arabic bodies: `dir="rtl"` via `looksArabic`. Shell stays LTR.
- Icons: Phosphor. Fetch errors stay on the page with retry.

## Preview states

- Default: live `GET /support/admin/requests` via `SupportContainer`
- `?state=loading` → `SupportSkeleton` (no fetch)
- `?state=empty` → empty list fixture (no fetch)

## Out of scope

- KPI strip, channel/priority, CDN avatars, attach/emoji/print
- Nest email configuration (mail stays on backend)
