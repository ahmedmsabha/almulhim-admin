# Dashboard area

Conventions for the Analytics Dashboard and its Nest-shaped `DashboardStats` contract.

## File pointers

- Page: `src/app/(dashboard)/(gated)/dashboard/page.tsx` (RSC; live `DashboardContainer` or `?state=` preview)
- Container: `src/components/dashboard/DashboardContainer.tsx` (Query loading / error / view)
- UI: `src/components/dashboard/`
- Shared status pills: `src/components/shared/StatusBadge.tsx`
- Types + mock preview: `src/lib/dashboard/mock-data.ts` (Nest live `DashboardStats`)
- Domain status labels: `src/lib/domain/subscription-status.ts` (for `StatusBadge`)
- Fetch: `src/lib/dashboard/fetch-dashboard-stats.ts` → `GET /analytics/admin/dashboard` (validated via `parse-dashboard-stats.ts`)
- Hook: `src/lib/dashboard/use-dashboard-stats.ts` (`adminKeys.dashboard.stats(userId)`)
- Sign-out: `PostHogSessionReset` also calls `clearBrowserQueryClient()`
- Visual registry: `.context/ui-registry.md`
- ADRs: `docs/adr/0003-dashboard-ui-mock.md`, `docs/adr/0004-dashboard-data.md`

## Conventions

- Render from typed `DashboardStats` props. No UI remapping of Nest fields.
- Live path: TanStack Query + Clerk `getToken` + `apiFetch`. Do not compose KPIs from list endpoints or PostHog in this app.
- Page stays a Server Component. Container and chart islands are `"use client"`.
- Region distribution uses progress bars, not a pie.
- Card padding: use explicit Tailwind (`p-6` KPIs, `px-8` chart panels). Do not use `--card-spacing` or `px-(--card-spacing)`.
- Icons: Phosphor (`@phosphor-icons/react`). Prefer `data-icon` on buttons.
- Text links (e.g. View All Students): plain `Link`, not Base UI `Button` + `render={<Link />}` unless `nativeButton={false}`.
- Domain enums stay Nest-shaped: `gaza` | `west_bank`, subscription statuses from architecture.
- Fetch errors stay on the page with retry. Do not silent-fallback to mock data.

## Preview states

- Default: live Query via `DashboardContainer`
- `?state=loading` → `DashboardSkeleton` (no fetch)
- `?state=empty` → `emptyDashboardStats` (no fetch)
