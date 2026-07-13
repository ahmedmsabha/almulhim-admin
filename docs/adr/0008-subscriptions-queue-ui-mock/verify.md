# Verify: Subscriptions Queue UI (Mock) · ADR 0008 · updated 2026-07-12

_Steps derived from ADR 0008 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## Last automated run

- **Date**: 2026-07-12
- **Verdict**: PASS
- **How**: `npm run dev` on http://localhost:3000; signed in admin browser; `npx tsc --noEmit`; offline mock filter via tsx; Next MCP routes + errors; code inspection for AC-6
- **Notes**: Row / View navigation to `/subscriptions/[id]` stub confirmed. Approve / Reject / Suspend disabled on list. No `GET /subscriptions/pending` in source.

## UI / manual (signed in admin, normal browser)

- [x] Open `/subscriptions` → Pending Queue table shows student, plan, submitted date, `StatusBadge`, AI column, actions → AC-1
- [x] Pending tab is selected by default with rows; Archived / AI Logs are stubs (no second datasets) → AC-2
- [x] Set `?q=` to a known mock student name/email → list filters; URL keeps `q` → AC-3
- [x] Click View (or row) → `/subscriptions/[id]` placeholder; Approve / Reject / Suspend disabled → AC-4
- [x] `/subscriptions?state=loading` → skeleton; `/subscriptions?state=empty` → empty copy → AC-5
- [x] Confirm Network tab has no `GET /subscriptions/pending`; no receipt viewer or mutate API calls → AC-6

## Commands

- [x] `npx tsc --noEmit` → clean → build health

## Acceptance-criteria coverage

- AC-1 … UI step 1
- AC-2 … UI step 2
- AC-3 … UI step 3
- AC-4 … UI step 4
- AC-5 … UI step 5
- AC-6 … UI step 6 (+ code inspection)

## After a manual PASS

1. Tick scope `Verify it: /check verify Subscriptions Queue UI (Mock)`
2. Optionally run `/test Subscriptions Queue UI (Mock)` (or skip if requested)
3. Update progress tracker Next line
