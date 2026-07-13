# ADR 0009 — Receipt Review + Approve / Reject / Suspend

**Status**: Accepted  
**Date**: 2026-07-12  
**Feature**: Receipt Review + Approve / Reject / Suspend (scope #12 / build-plan step 10)

## Context

Step 09 shipped a pending queue facade and `/subscriptions/[id]` stub (ADR 0008). Nest now exposes live admin subscription reads and decisions, including `GET /subscriptions/:id` (any status) and a documented `ReceiptVerificationResult` v1 for `verificationResult`. This **Wire** step replaces the queue mock, builds the receipt review detail page (signed URL + AI check panel), and wires approve / reject / suspend. Visual reference: `almulhim-admin-web-desgin/subscriptions_management/` (receipt modal chrome adapted to a dedicated detail route). Stitch KPI strip and Archived / AI Logs stay stubs.

## Requirements

- **AC-1**: `/subscriptions` loads `AdminSubscriptionListResponse` from Nest `GET /subscriptions/pending` via TanStack Query; URL `q` filters client-side on the pending payload (Nest pending has no search query today). Optional `?state=loading|empty` preview remains.
- **AC-2**: `/subscriptions/[id]` loads `AdminSubscriptionResponse` from `GET /subscriptions/:id` and a short-lived signed URL from `GET /subscriptions/:id/receipt-url`. Missing → clear 404 / not-found UI (not `/forbidden`).
- **AC-3**: Detail shows student, plan, sender name, status, submitted time, receipt image (signed URL only), and an **AI check panel** driven by Nest `ReceiptVerificationResult` v1 (`passed`, `checks.*`, `notes`, transaction ref).
- **AC-4**: Pending (`pending_review` | `pending_approval`): Approve (confirm) and Reject (reason required). Active: Suspend (confirm). Other statuses: read-only (no mutate actions).
- **AC-5**: Mutations call Nest `PATCH …/approve`, `…/reject` (`{ rejectionReason }`), `…/suspend`; on success invalidate pending list + detail (+ receipt URL), capture PostHog `admin_subscription_reviewed`, navigate to `/subscriptions`. Surface 403 / 404 / validation errors clearly.
- **AC-6**: Queue row / View opens detail; no inline approve / reject / suspend mutations on the table (icons may link to detail or be removed in favor of View).

## Decisions

1. **Wire queue + detail together**: Live Nest for both. Mock pending ids ≠ Nest UUIDs; deep links require `GET /subscriptions/:id`.

2. **Nest contracts** (source of truth — Backend README + admin subscription DTOs):

   | Action | Path |
   | --- | --- |
   | Pending queue | `GET /subscriptions/pending` |
   | One subscription | `GET /subscriptions/:id` |
   | Signed receipt | `GET /subscriptions/:id/receipt-url` |
   | Approve | `PATCH /subscriptions/:id/approve` |
   | Reject | `PATCH /subscriptions/:id/reject` |
   | Suspend | `PATCH /subscriptions/:id/suspend` |

   Reuse existing `AdminSubscriptionResponse` / `AdminSubscriptionListResponse` in `src/lib/subscriptions/types.ts`.

   **`verificationResult`**: type as Nest `ReceiptVerificationResult` v1 (nullable until verification runs):

   ```ts
   type VerificationCheck = {
     passed: boolean;
     detected: string | null;
     reason: string | null;
     expected?: string | null;
     transactionReference?: string | null;
   };

   type ReceiptVerificationResult = {
     version: 1;
     passed: boolean;
     verifiedAt: string;
     aiEnabled: boolean;
     model: string | null;
     error: string | null;
     checks: {
       recipientMatch: VerificationCheck;
       senderMatch: VerificationCheck;
       notDuplicate: VerificationCheck;
     };
     notes: string | null;
   };
   ```

   Replace the provisional `outcome` / `summary` mock parser with a Nest-aligned display helper (overall pass/fail, per-check rows, notes, txn ref). Keep a thin fallback for null / malformed payloads (“Awaiting AI” / “—”).

   **Receipt URL response**: confirm Nest response field during build (expected `{ url: string }` or equivalent). Never cache receipt binaries in public folders; use the signed URL only for `<img>` / open-in-new.

   **Reject body**: `{ rejectionReason: string }` (non-empty; Nest `RejectSubscriptionDto`).

3. **UI composition**:
   - Queue: keep ADR 0008 chrome (tabs + toolbar + table); swap mock for Query; enable View / row → detail; drop table-level mutate APIs.
   - Detail: dedicated `/subscriptions/[id]` page (not stitch modal) — metadata + receipt image + AI check panel + action bar.
   - Approve / Suspend: `AlertDialog` confirm (pattern from device reset).
   - Reject: dialog with Zod + RHF required reason (reuse plans form stack).

4. **Action visibility**:
   - `pending_review` | `pending_approval` → Approve + Reject
   - `active` → Suspend only
   - else → read-only banner (already decided / not actionable here)

5. **Query + cache**: Extend `adminKeys.subscriptions` to `pending(filters?)`, `detail(id)`, `receiptUrl(id)`. Client `apiFetch` + TanStack Query hooks/mutations (same pattern as Students / Plans — not Server Actions). Invalidate pending + detail (+ receipt) after successful mutate; then `router.push("/subscriptions")`.

6. **Analytics**: On successful approve / reject / suspend, `captureAdminEvent("admin_subscription_reviewed", { subscriptionId, decision })` where `decision` is `approve` | `reject` | `suspend`. Backend lifecycle events stay on Nest.

7. **Search**: Nest pending has no `q` param — keep client-side filter on fetched pending rows via URL `q` (ADR 0008 behavior).

8. **Packages / primitives**: Reuse `alert-dialog`, `dialog`, form stack, `StatusBadge`, Kinetic cards. No new data libraries.

## Feature design

| Concern | Choice |
| --- | --- |
| Pending list | `GET /subscriptions/pending` |
| Detail | `GET /subscriptions/:id` |
| Receipt | `GET /subscriptions/:id/receipt-url` |
| Mutate | `PATCH …/approve\|reject\|suspend` |
| Auth | Existing `(gated)` admin gate + Bearer |
| Query keys | `subscriptions.pending` / `detail` / `receiptUrl` |
| UI entry | `SubscriptionsListContainer` + `SubscriptionDetailContainer` |
| AI panel | Nest `ReceiptVerificationResult` v1 |
| Visual source | stitch receipt modal → detail page layout |

## Build plan

1. [x] Types (`ReceiptVerificationResult`), Nest-aligned verification display helper, fetch/parse for pending / detail / receipt-url / mutations; extend `adminKeys.subscriptions`; Query hooks. — AC-1, AC-2, AC-3
2. [x] Receipt review UI (metadata, signed image, AI check panel, approve/reject/suspend dialogs); wire `[id]` container (loading / error / 404). — AC-2…AC-5
3. [x] Wire `/subscriptions` list to live Query; enable View; remove table mutate APIs; keep `q` + `?state=` preview. — AC-1, AC-6
4. [x] PostHog `admin_subscription_reviewed`; update subscriptions `AGENTS.md`, ui-registry, progress tracker, scope milestones. — AC-5

## Consequences

- Admin Web depends on Nest `GET /subscriptions/:id` and documented `ReceiptVerificationResult` (shipped on backend).
- Provisional mock AI `outcome`/`summary` fixtures become obsolete for the live path; mock module may remain only for `?state=` empty/loading helpers or be deleted if unused.
- Architecture table should list `GET /subscriptions/:id` alongside pending / receipt-url / patches.
- Suspend from student profile (non-receipt context) remains out of this slice — reachable via deep link to `/subscriptions/[id]` when status is `active`.
