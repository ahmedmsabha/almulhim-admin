# Plans area

Conventions for Subscription Plans CRUD (live Nest wire).

## File pointers

- Page: `src/app/(dashboard)/(gated)/plans/page.tsx` (RSC → `PlansContainer`)
- UI: `src/components/plans/`
- Fetch / hooks: `src/lib/plans/` (`fetch-plans`, `use-plans-list`, `use-plan-mutations`, `form-schema`, `money`, `parse-plans`)
- Query keys: `adminKeys.plans.list()`
- Visual registry: `.context/ui-registry.md`
- ADR: `docs/adr/0007-plans-ui-crud/`

## Conventions

- Render from Nest `AdminPlan` / `AdminPlanListResponse`. Do not invent subscriber counts or feature chips.
- Live path only: TanStack Query + Clerk `getToken` + `apiFetch`. List query gated on `isLoaded` + `isSignedIn` (same as students/dashboard). No mock fallback.
- Endpoints: `GET /plans/all`, `POST /plans`, `PATCH /plans/:id`. Soft disable via `isActive` (no DELETE).
- Price: admin enters **ILS** only; Nest always stores `currency: "ILS"`. Table displays ILS / USD / EGP via live FX (`fetchIlsFxRates`, CDN + Cloudflare fallback). Display amounts are rounded **up** to whole units (`ceilMajorAmount`). Display currencies: `PLAN_DISPLAY_CURRENCIES` in `currencies.ts`.
- Forms: Zod + react-hook-form (`planFormSchema`). Create omits `isActive`. Edit includes it. Nest `400` field errors map through `nestFieldErrorsFromApiError` (requires `ApiError.body`). Clear form errors before each submit.
- Edit dialog keys by plan id and reads the live list row so a row Switch cannot be overwritten by a stale snapshot. Form resets on open / plan id change; `isActive` syncs from the list unless that field is dirty.
- Inline row `Switch` and edit dialog both PATCH `isActive`. No confirm dialog. Revert on failure.
- Page stays a Server Component. Container and interactive pieces are `"use client"`.
- Icons: Phosphor. Prefer `data-icon` on buttons.
- Fetch errors stay on the page with retry.

## Out of scope here

- PostHog plan events
- Stitch KPI bento / subscriber column / key features list
- Separate `/plans/[id]` route
