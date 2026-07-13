# Verify: Student Detail + Devices · ADR 0006 · updated 2026-07-12

_Steps derived from ADR 0006 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

- [x] Sign in as admin, open `/students` → Nest list loads (live fetch `GET /users?page=&pageSize=`) → AC-1
- [x] URL filters `q` / `region` / `status` / `page` map to Nest query string → AC-1
- [x] Open `/students/[userId]` → profile from `GET /users/:userId` + bindings from devices admin → AC-2
- [x] Device slots show type + bound/last-seen (or empty dashed slots); no hash → AC-3
- [x] Reset one: AlertDialog confirm → `DELETE .../bindings/:deviceType` → UI refreshes empty → AC-4
- [x] `?state=loading|empty` previews; detail 404 shows not-found + Retry → AC-5
- [x] Successful reset runs `captureAdminEvent('admin_device_reset', …)` (PostHog loaded; mutation onSuccess) → AC-6

## Commands

- [x] Nest `GET /health` → 200 (API up during verify)
- [x] Seed web binding via Prisma upsert for verify student (no student app) when bindings empty

## Acceptance-criteria coverage

- AC-1 covered by list + filter steps
- AC-2 covered by detail profile + bindings fetch
- AC-3 covered by web slot timestamps / empty mobile
- AC-4 covered by reset-one confirm + DELETE + UI refresh
- AC-5 covered by preview + 404 + empty slots
- AC-6 covered by reset success path (client capture helper)
