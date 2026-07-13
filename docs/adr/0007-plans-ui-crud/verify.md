# Verify: Plans UI + CRUD · ADR 0007 · updated 2026-07-12

_Steps derived from ADR 0007 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

- [x] Sign in as admin, open `/plans` → Nest list loads (`GET /plans/all`) → AC-1
- [x] Table shows name, price+currency, duration, sortOrder, isActive, edit → AC-2
- [x] Add New Plan → valid submit → `POST /plans` → row appears; invalid fields show inline errors → AC-3
- [x] Edit plan → change fields → `PATCH /plans/:id` → row updates → AC-4
- [x] Row active switch toggles `isActive` via PATCH; failure reverts and shows error; edit dialog can also set `isActive` → AC-5
- [x] Loading / empty / error + Retry; no mock fallback on default path → AC-6

## Commands

- [x] Nest `GET /health` → 200 (API up during verify)
- [x] Admin Bearer can call `GET /plans/all` → 200 with `{ plans: [...] }`

## Acceptance-criteria coverage

- AC-1 covered by list load step
- AC-2 covered by table columns
- AC-3 covered by create + validation
- AC-4 covered by edit PATCH
- AC-5 covered by toggle + dialog isActive
- AC-6 covered by loading/empty/error + cache refresh after writes

## Verify notes (2026-07-12)

- Live `/plans` as signed-in admin showed Nest plans (Arabic tiers + prices in ₪).
- Invalid create marked Plan Name and Price invalid.
- Created **Verify Temp Plan** (₪1.50, 7 days → edited to 14); list went 3→4.
- Row Switch disabled that plan (`aria-checked=false`, label became Enable…).
- Skeleton loading observed on first paint; empty/error panels are wired (Empty + PlansErrorPanel). Default path used live Nest data only.
- Left **Verify Temp Plan** inactive in Nest after verify (soft disable; no delete API).
