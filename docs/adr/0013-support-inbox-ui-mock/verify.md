# Verify: Support Inbox UI (Mock) · ADR 0013 · updated 2026-07-13

_Steps derived from ADR 0013 acceptance criteria. `/check verify` runs these; `/test` waived for this feature._

## UI / manual (signed in admin, normal browser)

- [x] Open `/support` → split pane list + thread; student name, subject/preview, `TicketStatusBadge`, timestamp; thread shows message (+ `adminReply` when present) → AC-1
- [x] Status chips All / Open / Reviewed / Closed update URL `status=` and filter the list → AC-2
- [x] Search `q` filters by name, email, or subject; URL keeps `q` → AC-3
- [x] Select a ticket, then filter so it disappears → URL `id` becomes the first visible row (or clears when empty) → AC-4
- [x] Open ticket: disabled composer shows mock/step-15 helper. Closed ticket: closed permanent helper. Send / Close remain disabled → AC-5
- [x] Arabic message bodies use RTL (`dir="rtl"`) → AC-6
- [x] `/support?state=loading` → skeleton; `/support?state=empty` → empty copy → AC-7
- [x] Network tab: no `/support/admin/requests` calls → AC-8

## Commands

- [x] `npx tsc --noEmit` → clean → build health

## Last automated run

- **Date**: 2026-07-13
- **Verdict**: PASS
- **How**: `npm run dev` on http://localhost:3000; signed in admin browser; CDP + snapshot for filters/search/id resync/composer helpers/RTL/`?state=`; `npx tsc --noEmit`; code grep for no support admin fetch
- **Notes**: `/test` waived. Facade mock only.

## Acceptance-criteria coverage

- AC-1 … UI step 1
- AC-2 … UI step 2
- AC-3 … UI step 3
- AC-4 … UI step 4
- AC-5 … UI step 5
- AC-6 … UI step 6
- AC-7 … UI step 7
- AC-8 … UI step 8 (+ code inspection)

## After a manual PASS

1. Tick scope `Verify it: /check verify Support Inbox UI (Mock)`
2. Skip `/test` (waived)
3. Update progress tracker Next line toward Support API Wiring (step 15) or `/sync`
