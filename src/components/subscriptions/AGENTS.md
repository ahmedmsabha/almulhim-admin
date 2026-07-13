# Subscriptions area

Conventions for the pending approval queue and receipt review wire (ADR 0009).

## File pointers

- Queue page: `src/app/(dashboard)/(gated)/subscriptions/page.tsx` (RSC; live pending or `?state=` preview)
- Detail page: `src/app/(dashboard)/(gated)/subscriptions/[id]/page.tsx`
- Containers: `SubscriptionsListContainer`, `SubscriptionDetailContainer`
- UI: `src/components/subscriptions/`
- Fetch + hooks: `src/lib/subscriptions/` (`fetch-subscriptions.ts`, parse, Query hooks, mutations)
- Preview fixtures: `src/lib/subscriptions/mock-data.ts` (`?state=` only)
- Dev test checkout (non-production): `/dev/subscriptions` — real Nest student submit, then live `/subscriptions/[id]`
- Domain status: `src/lib/domain/subscription-status.ts`
- Shared status pills: `src/components/shared/StatusBadge.tsx`
- Query keys: `adminKeys.subscriptions.pending()`, `.archived()`, `.aiLogs()`, `.detail(id)`, `.receiptUrl(id)`
- Visual registry: `.context/ui-registry.md`
- ADRs: `docs/adr/0008-subscriptions-queue-ui-mock/`, `docs/adr/0009-receipt-review/`

## Conventions

- Render from Nest DTOs (`AdminSubscriptionResponse`, `AdminSubscriptionListResponse`, `AiVerificationLogListResponse`). Student contact field is `phoneNumber`.
- Live path: TanStack Query + Clerk `getToken` + `apiFetch`. No silent mock fallback.
- `verificationResult` is Nest `ReceiptVerificationResult` v1 (nullable). Queue uses `parseVerificationResult`; detail uses `buildVerificationPanel`.
- Page stays a Server Component. Containers and interactive pieces are `"use client"`.
- Tabs via `?tab=pending|archived|ai_logs` (default pending). Pending → `GET /subscriptions/pending`; archived → `GET /subscriptions/archived`; AI logs → `GET /subscriptions/ai-logs`.
- Queue View / row opens `/subscriptions/[id]`. Mutations live on the detail page only.
- Pending statuses: Approve (confirm) + Reject (reason required). Active: Suspend (confirm). Else read only.
- On successful decide: invalidate `adminKeys.subscriptions`, capture `admin_subscription_reviewed`, navigate to `/subscriptions`.
- Receipt image uses the signed URL from `GET /subscriptions/:id/receipt-url` only.
- Icons: Phosphor. Prefer plain `Link` + `buttonVariants` for view navigation.

## Preview states

- Default: live tab fetch via `SubscriptionsListContainer` (client `q` filter)
- `?state=loading` → queue skeleton (no fetch)
- `?state=empty` → empty pending/ai tables (no fetch)
