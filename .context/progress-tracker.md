# Progress Tracker — Mulhim Admin Web

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** 9 — Hardening  
**Last completed:** Sign Out / Switch Account Button (step 18)  
**Next:** Session wrap up

---

## Progress

### Phase 1 — Foundation

- [x] 01 App Shell + Design Tokens
- [x] 02 Auth (Clerk)
- [x] 03 API Client + TanStack Query + PostHog

### Phase 2 — Dashboard

- [x] 04 Dashboard UI (Mock)
- [x] 05 Dashboard Data (built; Nest `GET /analytics/admin/dashboard` documented)

### Phase 3 — Students & Devices

- [x] 06 Students List UI (Mock) (built; verify/test open)
- [x] 07 Student Detail + Devices (built; verify/test open; ADR 0006)

### Phase 4 — Plans

- [x] 08 Plans UI + CRUD (built + verified; ADR 0007; test waived; ready)

### Phase 5 — Subscriptions

- [x] 09 Subscriptions Queue UI (Mock) (built + verified; ADR 0008; test waived; ready)
- [x] 10 Receipt Review + Approve / Reject / Suspend (built; ADR 0009; verify/test open)

### Phase 6 — Content

- [x] 11 Content Tree UI (Wire) (built; ADR 0010; verify/test open; was Mock in early plan)
- [x] 12 Content CRUD + Media Upload (built; ADR 0011; verify/test open; Nest DELETE + Admin wire)

### Phase 7 — Announcements

- [x] 13 Announcements UI + CRUD (built + verified; ADR 0012; test open)

### Phase 7.5 — Notifications Foundation (Backend Only)

- [x] 13a Notifications Backend Foundation
- Nest: `Notification` model, `DeviceBinding.pushToken`, `notifications` module, wired into lesson/announcement publish handlers
- `PUSH_NOTIFICATIONS_ENABLED=false` until a consumer app exists
- No Admin Web UI change — fully automatic, invisible to admin
- Verified via DB inspection + curl, not a real device (no Mobile/Student Web yet)

### Phase 8 — Support

- [x] 14 Support Inbox UI (Mock) (built + verified; ADR 0013; test waived; ready)
- [x] 15 Support API Wiring (built + verified; ADR 0014; test open)

### Phase 9 — Hardening

- [x] 16 Polish + Registry (built + verified; ADR 0015; test open)
- [x] 17 Docs Sync (done)
- [x] 18 Sign Out / Switch Account Button (built + verified; error page, sidebar, topbar; ready)

---

## Decisions Made During Build

- Admin Web is a Next.js 16 client of the existing NestJS Mulhim Backend — no direct Prisma/R2 in this app.
- UI system is Kinetic Enterprise (indigo primary, sidebar shell), not the JobPilot top-nav purple template.
- Package manager: npm only.
- Auth: Clerk only; admin role enforced via backend (`requireAdmin` + `GET /users/me`); session protection in `src/proxy.ts`.
- API: Clerk-agnostic `apiFetch` with injected Bearer token; Query provider is dashboard-scoped; PostHog inits in `instrumentation-client.ts`, identify/reset in `AdminAnalytics`.
- PostHog env: `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` + `NEXT_PUBLIC_POSTHOG_HOST` (EU).
- Dashboard mock: Nest-shaped `DashboardStats` in `src/lib/dashboard/mock-data.ts`; Recharts for growth/sparklines; `?state=loading|empty` preview.
- Dashboard data: single Nest `GET /analytics/admin/dashboard` → `DashboardStats`; client Query (`adminKeys.dashboard.stats(userId)` + clear on sign-out); payload validated; no silent mock fallback (ADR 0004).
- Students list mock: Nest-shaped `StudentListResponse` in `src/lib/students/mock-data.ts`; shared `Region` in `src/lib/domain/region.ts`; URL filters `q` / `region` / `status` / `page`; `?state=loading|empty` preview; row → `/students/[userId]` placeholder (ADR 0005).
- Student detail + devices (ADR 0006): wire list + detail; Nest `GET /users` (filters/pagination), `GET /users/:userId`, `GET/DELETE /devices/admin/users/:userId/bindings[/:deviceType]`; bindings show type + timestamps (no hash); AlertDialog + `admin_device_reset`.
- Plans UI + CRUD (ADR 0007): live `GET /plans/all` / `POST /plans` / `PATCH /plans/:id`; Nest `AdminPlanResponse` fields; major-units price ↔ integer `priceAmount`; dialog create/edit; inline + dialog `isActive`; RHF + Zod; no PostHog this slice.
- Subscriptions queue mock (ADR 0008): Nest `AdminSubscriptionListResponse` fixtures; Pending tab + stub Archived/AI Logs; `q` + `?state=`; View → `/subscriptions/[id]` stub; mutate icons disabled.
- Receipt review wire (ADR 0009 built): live pending + `GET /subscriptions/:id` + receipt-url; Nest `ReceiptVerificationResult` AI panel; mutations on detail only; PostHog `admin_subscription_reviewed`.
- Content tree wire (ADR 0010 built): live `GET /content/admin/tree` + lesson detail + publish/unpublish; `?lessonId=` + `q`; shared `POST /content/search` with substring fallback; PostHog `admin_content_published`; CRUD/media deferred to step 12.
- Content CRUD + media (ADR 0011 built): hierarchy create/update dialogs on `/content`; lesson media list with XHR PUT progress + attach; metadata PATCH; Nest `DELETE` videos/pdfs (R2 then DB); PostHog attach/delete; auto-append sortOrder on create.
- Announcements UI + CRUD (ADR 0012 built): single `/announcements` composer + list; `?id=` selection; Save create/update; publish/unpublish Switch; image upload-url → XHR PUT → attach; no pin/delete/client PostHog.
- Notifications (13a, backend-only): Nest fans out in-app `Notification` rows on lesson/announcement publish; push stubbed until Mobile/Student Web; no Admin Web UI.
- Support inbox mock (ADR 0013 built): Nest-shaped `SupportRequest` split pane; `TicketStatusBadge`; URL `id`/`status`/`q`/`state`; reply/close disabled with mock vs closed helper copy; no live API.
- Support API wiring (ADR 0014 built): live `GET /support/admin/requests` with Nest `status` + `q`; Reply/Close mutations; PostHog `admin_support_replied` / `admin_support_closed`; email stays on Nest.
- Polish + Registry (ADR 0015 built): Sonner toasts for mutations; ErrorPanels on `Empty`; table `aria-label`s; ui-registry updated; `npm run build` green; `CLERK_SECRET_KEY` only in `server-only` dev seed.
- Sign Out / Switch Account Button: Integrated Clerk's `SignOutButton` on the "Admin API unavailable" error page (`error.tsx`), `AppSidebar.tsx` (next to account card footer), and `AppTopbar.tsx` (next to user avatar), with English/Arabic translations, allowing administrators to change accounts even during an API outage.

---

## Open Questions

- Confirm live Nest `DashboardStats` DTO matches ADR 0003 field-for-field when verifying.
- Whether Admin Web lives at repo root or `apps/admin-web` in a monorepo — follow deployment target `admin.smartmulhim.com` either way.

---

## Notes

- Backend build is complete (see Mulhim Backend README). Admin Web consumes its admin routes.
- Stitch HTML references under `stitch_saas_admin_dashboard_panel/` are visual references for dashboard, subscriptions, content, students.
