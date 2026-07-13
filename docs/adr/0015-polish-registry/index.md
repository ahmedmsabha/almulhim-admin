# ADR 0015 — Polish + Registry

**Status**: In Progress  
**Date**: 2026-07-13  
**Feature**: Polish + Registry (scope #16 / build-plan step 16)

## Context

All primary Admin Web product slices are built (facade then wire through Support). Hardening remains: consistent empty/loading/error UX, mutation feedback via toasts, accessibility basics on tables and dialogs, a complete `ui-registry.md`, no secrets in the client bundle, and a clean production build. Nest / Mulhim Backend is out of scope — Admin Web only. Env-example and progress-tracker reconciliation stay for Docs Sync (#17).

## Requirements

- **AC-1**: Install shadcn Sonner; mount `Toaster` once in the dashboard provider shell. Shared helper maps `ApiError` (and unknown errors) to a stable toast message.
- **AC-2**: Wire `toast.error` on mutation `onError` for plans, subscriptions, content, announcements, support, and device resets. Success toasts only where the UI has no other clear signal (support reply/close; receipt approve/reject/suspend). No toasts for Query/page fetch failures — keep `*ErrorPanel` + retry.
- **AC-3**: Gap-fill empty / skeleton / error UX on the seven nav areas. Align ad-hoc ErrorPanels onto the shared `Empty` primitive pattern (as Content). Do not merge into one mega `AdminErrorPanel` / `AdminEmpty` this slice.
- **AC-4**: Accessibility basics on tables and dialogs in those areas (names, headers/`aria-label`, focus/Escape via existing primitives). No axe CI or full WCAG report.
- **AC-5**: Update `.context/ui-registry.md` via focused imprint/audit: every nav-area component + shared primitives (Empty, Toaster, badges, toast helper). Fix clear visual drift only — no redesign.
- **AC-6**: Secrets pass — only intentional `NEXT_PUBLIC_*` (and other public values) in client-reachable code; no Clerk secrets, DB URLs, or R2 credentials. `npm run build` passes.
- **AC-7**: Out of scope: Nest changes, Docs Sync (#17) env/progress reconciliation, auth/forbidden redesign, new product features.

## Decisions

1. **Toast library**: shadcn Sonner (`@shadcn/sonner`). Mount under `DashboardProviders` (dashboard-scoped, same as Query).

2. **Toast policy**: Errors on all mutating writes. Success only when feedback would otherwise be invisible. Queries stay in-page ErrorPanels.

3. **Shared helper**: Small `toastAdminError(error)` (and optional `toastAdminSuccess(message)`) under `src/lib/` — prefer `ApiError.message`, fall back to a generic string. Call from mutation `onError` / selective `onSuccess`.

4. **Empty / ErrorPanel**: Gap-fill + align to `Empty`; keep per-area components and copy.

5. **Registry**: Acceptance gate for this slice. Imprint/audit then update `ui-registry.md`. Document toast helper in registry / area notes as needed. Progress tracker / `.env.example` → #17.

6. **A11y**: Basics only on tables and dialogs; fix clear gaps while polishing.

7. **Secrets + build**: Grep/review client-reachable env usage; `npm run build` green. No new env vars. Nest out of scope.

## Feature design

| Concern | Choice |
| --- | --- |
| Toasts | Sonner in `DashboardProviders` |
| Mutation feedback | `onError` everywhere; selective success |
| Fetch failures | Existing `*ErrorPanel` + retry |
| Empty / skeleton | Gap-fill + `Empty` alignment |
| Registry | `/imprint` audit → `ui-registry.md` |
| A11y | Tables + dialogs basics |
| Secrets / build | Audit + `npm run build` |
| Backend | Out of scope |

## Build plan

1. [x] Add Sonner + `Toaster` in `DashboardProviders`; `toastAdminError` / optional success helper. — AC-1
2. [x] Wire mutation toasts (error everywhere; selective success); gap-fill empty/skeleton/ErrorPanel → `Empty`. — AC-2, AC-3
3. [x] A11y basics on tables/dialogs; imprint/audit → `ui-registry.md`; secrets pass + `npm run build`. — AC-4, AC-5, AC-6

## Consequences

- Mutation failures become visible without leaving the page or relying on silent Query error state.
- Registry becomes the consistency source of truth before Docs Sync.
- Remaining open `/test` boxes on earlier slices are unchanged by this ADR.
