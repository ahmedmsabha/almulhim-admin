# Verify: Students List UI (Mock) · ADR 0005 · updated 2026-07-10

_Steps derived from ADR 0005 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## Last automated run

- **Date**: 2026-07-10
- **Verdict**: BLOCKED (not PASS)
- **Why**: Agent `next dev` accepted TCP on `/students` and `/login` then hung with 0 bytes (Clerk middleware / session path). Browser could not complete a signed in admin pass. Scope `Verify it` left unticked.
- **Offline evidence**: Mock `buildStudentList` filter/pagination counts look correct; AC-6 code path has no live fetch / Query / device reset. Specced routes and components exist on disk.

## UI / manual (signed in admin, normal browser)

- [ ] Open `/students` → Enrollment Directory shows profile (name + id), contact (email + phone), Telegram, region, `StatusBadge` → AC-1
- [ ] Set `?q=sara`, `?region=gaza`, `?status=active` (alone or combined) → list filters; URL keeps params → AC-2
- [ ] Click a student name → `/students/[userId]` placeholder (no device reset UI) → AC-3
- [ ] `/students?state=loading` → skeleton; `/students?state=empty` → empty copy → AC-4
- [ ] Default mocks (12 rows): Next/Prev → footer shows page 1 as 1–10 of 12, page 2 as 11–12 of 12 → AC-5
- [ ] Confirm Network tab has no `GET /users` for this page; no device reset controls on the list → AC-6

## Commands

- [ ] `npx tsc --noEmit` → clean → build health
- [ ] Optional: exercise `buildStudentList` offline (q / region / status / page) → AC-2, AC-5 logic

## Acceptance-criteria coverage

- AC-1 … UI step 1
- AC-2 … UI step 2 (+ optional command)
- AC-3 … UI step 3
- AC-4 … UI step 4
- AC-5 … UI step 5 (+ optional command)
- AC-6 … UI step 6 (+ code inspection)

## After a manual PASS

1. Tick scope `Verify it: /check verify Students List UI (Mock)`
2. Optionally run `/test Students List UI (Mock)` (or skip if requested)
3. Update progress tracker Next line
