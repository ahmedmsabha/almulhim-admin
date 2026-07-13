# Verify: Polish and Registry · ADR 0015

## UI / manual
- [x] Trigger a mutation error (such as plan toggle fail) → Error toast appears with descriptive message → AC-1, AC-2
- [x] Trigger a support response/close or receipt status change → Success toast appears → AC-2
- [x] Inspect Empty states in all major list views with empty data filters → Aligned to the shared Empty primitive → AC-3
- [x] Tab key navigation on main tables and action dialogs → Focus rings visible and Escape key closes dialogs → AC-4

## Commands
- [x] `npm run build` → Production build compiles successfully without errors or type issues → AC-6

## Acceptance criteria coverage
* AC-1: Toaster component is initialized in the providers layout.
* AC-2: Mutations trigger error or success toast alerts.
* AC-3: Empty and error panels follow the shared empty pattern.
* AC-4: Accessible elements are present on tables and dialogs.
* AC-5: UI registry matches components.
* AC-6: Production build succeeds and secrets check is clean.
