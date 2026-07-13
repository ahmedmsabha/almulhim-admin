# Verify: Receipt Review + Approve / Reject / Suspend · ADR 0009 · updated 2026-07-12

_Steps derived from ADR 0009 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## Last automated run

- **Date**: —
- **Verdict**: —
- **How**: —
- **Notes**: —

## UI / manual (signed in admin, Nest API up)

- [ ] Open `/subscriptions` → Pending Queue loads from `GET /subscriptions/pending`; student, plan, date, badge, AI column, View → AC-1, AC-6
- [ ] `?q=` filters pending rows; URL keeps `q` → AC-1
- [ ] `/subscriptions?state=loading` → skeleton; `?state=empty` → empty → AC-1
- [ ] Open `/subscriptions/[id]` for a pending row → metadata + signed receipt image + AI check panel (`passed` / checks / notes / txn ref) → AC-2, AC-3
- [ ] Invalid / missing id → not-found UI (not forbidden) → AC-2
- [ ] Approve (confirm) on pending → Nest PATCH approve; return to queue; row gone / status updated → AC-4, AC-5
- [ ] Reject with empty reason blocked; with reason → Nest PATCH reject; return to queue → AC-4, AC-5
- [ ] Suspend only when `active`; confirm → Nest PATCH suspend → AC-4, AC-5
- [ ] Queue table does not call approve/reject/suspend directly → AC-6
- [ ] PostHog `admin_subscription_reviewed` fired on successful decide → AC-5

## Commands

- [ ] `npx tsc --noEmit` → clean → build health

## Acceptance-criteria coverage

- AC-1 … UI steps 1–3
- AC-2 … UI steps 4–5
- AC-3 … UI step 4
- AC-4 … UI steps 6–8
- AC-5 … UI steps 6–8, 10 + commands
- AC-6 … UI steps 1, 9
