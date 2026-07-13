# Scope — Mulhim Admin Web

Teacher ops dashboard for the Mulhim learning platform (Palestine, Tawjihi, Grade 12). One admin signs in, calls the existing Mulhim Backend admin APIs, and runs day to day work: receipt review, content publishing, students and devices, announcements, and support.

**Build approach:** Facade — clickable screens on placeholder data first, then wire the real backend behind interfaces that already exist. Phase 1 style work is prototype grade until wired; say so plainly when shipping mocks.
**Weight profile:** Auth and receipt review are full (access and money sensitive). Content media upload is full. Most mock UIs and wiring are medium. Docs sync is lean.

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | App Shell + Design Tokens | Foundation | existing |
| 2 | Auth | Foundation | in-progress |
| 3 | API Client + Server State + Analytics | Foundation | in-progress |
| 4 | Dashboard UI (Mock) | Prototype | in-progress |
| 5 | Students List UI (Mock) | Prototype | in-progress |
| 6 | Subscriptions Queue UI (Mock) | Prototype | done |
| 7 | Content Tree UI (Wire) | Wire | in-progress |
| 8 | Support Inbox UI (Mock) | Prototype | done |
| 9 | Dashboard Data | Wire | in-progress |
| 10 | Student Detail + Devices | Wire | in-progress |
| 11 | Plans UI + CRUD | Wire | done |
| 12 | Receipt Review + Approve / Reject / Suspend | Wire | in-progress |
| 13 | Content CRUD + Media Upload | Wire | in-progress |
| 14 | Announcements UI + CRUD | Wire | in-progress |
| 15 | Support API Wiring | Wire | in-progress |
| 16 | Polish + Registry | Hardening | in-progress |
| 17 | Docs Sync | Hardening | done |

## Foundations

### 1. App Shell + Design Tokens · existing
Pre-workflow shell: Kinetic Enterprise tokens, fonts, sidebar + top bar, seven placeholder dashboard routes, mobile drawer. code in `src/app/`, `src/components/layout/`, `src/lib/navigation.ts`, `src/app/globals.css`

### 2. Auth · in-progress · full
Sign in outside the dashboard shell, protect dashboard routes with a real session, confirm admin role via the Mulhim Backend profile (not client claims alone), show a forbidden state for signed in non admins, and expose a session token for the API client. Fold Step 01 design drift into the shell when logout lands (sidebar logout slot; icons and search copy if still open).
**Done when:** unauthenticated users cannot open dashboard routes; after sign in an admin reaches `/dashboard`; a signed in non admin sees the forbidden state; a Bearer token is available for authenticated API calls; logout works from the shell.
- [x] Design it (ADR): `/architect Auth (Clerk): session protection, admin role gate, forbidden state, token for API client`
- [x] Build it: `/develop Auth`
   - [x] Clerk install + env + ClerkProvider + proxy session protection
   - [x] Login + forbidden pages outside shell
   - [x] lib/auth token + admin gate + dashboard layout wiring + shell logout
- [ ] Verify it: `/check verify Auth`
- [ ] Test it: `/test Auth`
ADR 0001 · code in `src/proxy.ts`, `src/lib/auth/`, `src/app/(auth)/`, `src/app/forbidden/`

### 3. API Client + Server State + Analytics · in-progress · full
Typed authenticated fetch to the Mulhim Backend, shared query client and key factory for server state, product analytics identify/reset after admin session is confirmed, and env wiring for public API and analytics keys.
**Done when:** any admin page can call the API with a Bearer token; query keys follow a stable `['admin', …]` shape; analytics identify runs after admin gate and resets on logout; required env vars are documented.
- [x] Design it (ADR): `/architect API Client + Server State + Analytics`
- [x] Build it: `/develop API Client + Server State + Analytics`
   - [x] Packages + env docs (`apiFetch`, Query, PostHog `PROJECT_TOKEN` / EU host)
   - [x] `apiFetch` + typed errors; migrate `fetchAdminMe`; `requireAdmin` branches + dashboard `error.tsx`
   - [x] QueryClient provider (dashboard) + `['admin', …]` key factory
   - [x] `instrumentation-client` init + dashboard `AdminAnalytics` identify/reset
- [ ] Verify it: `/check verify API Client + Server State + Analytics`
- [ ] Test it: `/test API Client + Server State + Analytics`
ADR 0002 · code in `src/lib/api/`, `src/lib/query/`, `src/lib/posthog/`, `src/instrumentation-client.ts`, `src/components/layout/DashboardProviders.tsx`, `src/components/layout/AdminAnalytics.tsx`, `src/app/(dashboard)/error.tsx`

## Prototype — screens on mock data

### 4. Dashboard UI (Mock) · in-progress · medium
Analytics overview that looks real on placeholder data: KPI cards, subscription growth and region charts, optional quick links. No live aggregates yet.
**Done when:** `/dashboard` matches Kinetic / stitch layout patterns with mock KPIs and chart placeholders; empty and loading placeholders are visible.
- [x] Design it (ADR): `/architect Dashboard UI (Mock)`
- [x] Build it: `/develop Dashboard UI (Mock)`
   - [x] shadcn primitives + Kinetic CSS var remap
   - [x] Nest-shaped mock-data module
   - [x] Dashboard components (KPI, charts, activity, skeleton)
   - [x] Wire `/dashboard` + `?state=` preview + registry
- [ ] Verify it: `/check verify Dashboard UI (Mock)`
- [ ] Test it: `/test Dashboard UI (Mock)`
ADR 0003 · code in `src/app/(dashboard)/(gated)/dashboard/`, `src/components/dashboard/`, `src/lib/dashboard/`

### 5. Students List UI (Mock) · in-progress · medium
Students table with search and filters (region, subscription status) on mock rows; row opens student detail route.
**Done when:** list renders with filters and status badges; navigation to student detail works on mock data.
- [x] Design it (ADR): `/architect Students List UI (Mock)`
- [x] Build it: `/develop Students List UI (Mock)`
   - [x] Nest-shaped mock + shared `Region` domain
   - [x] Students toolbar / table / skeleton / view
   - [x] Wire `/students` + `[userId]` placeholder + `?state=`
   - [x] Registry + progress tracker
- [ ] Verify it: `/check verify Students List UI (Mock)`
- [ ] Test it: `/test Students List UI (Mock)`
ADR [0005](../adr/0005-students-list-ui-mock/index.md) · verify [checklist](../adr/0005-students-list-ui-mock/verify.md) · code in `src/app/(dashboard)/(gated)/students/`, `src/components/students/`, `src/lib/students/`

### 6. Subscriptions Queue UI (Mock) · done · medium
Pending first queue with status badges, AI result column, and actions affordances on mock subscriptions.
**Done when:** pending tab is default; badges match token status colors; row can open receipt review route on mock data.
- [x] Design it (ADR): `/architect Subscriptions Queue UI (Mock)`
- [x] Build it: `/develop Subscriptions Queue UI (Mock)`
  - [x] Types + mock + verification display parser
  - [x] Queue UI (tabs, toolbar, table, skeleton) + detail stub
  - [x] `q` / `?state=` wiring + disabled mutate actions
  - [x] Area docs + registry + tracker
- [x] Verify it: `/check verify Subscriptions Queue UI (Mock)`
- [x] Test it: `/test Subscriptions Queue UI (Mock)` _(waived by developer — `/check verify` enough)_
ADR [0008](../adr/0008-subscriptions-queue-ui-mock/index.md) · verify [checklist](../adr/0008-subscriptions-queue-ui-mock/verify.md) · code in `src/app/(dashboard)/(gated)/subscriptions/`, `src/components/subscriptions/`, `src/lib/subscriptions/`

### 7. Content Tree UI (Wire) · in-progress · medium
Live Unit → Chapter → Lesson tree with publish, region on units, accessLevel on lessons, lesson detail panel, and shared AI search. (Architect flipped this from Mock to Wire.)
**Done when:** tree and lesson detail load from Nest; publish works at all three levels; `?lessonId=` and `q` work; search fallback + LLM path behave as designed.
- [x] Design it (ADR): `/architect Content Tree UI`
- [x] Build it: `/develop Content Tree UI`
  - [x] Types + fetch/hooks/mutations + search helpers + `adminKeys.content`
  - [x] Tree + lesson panel + toolbar + publish switches + page wire
  - [x] PostHog `admin_content_published` + docs/registry/tracker
- [ ] Verify it: `/check verify Content Tree UI`
- [ ] Test it: `/test Content Tree UI`
ADR [0010](../adr/0010-content-tree-ui/index.md) · verify [checklist](../adr/0010-content-tree-ui/verify.md) · code in `src/app/(dashboard)/(gated)/content/`, `src/components/content/`, `src/lib/content/`

### 8. Support Inbox UI (Mock) · done · medium
Split pane inbox and thread with status chips, reply box, close action, and RTL for Arabic bodies on Nest-shaped mock tickets.
**Done when:** list + thread layout works; open / reviewed / closed chips render; Arabic sample bodies are RTL.
- [x] Design it (ADR): `/architect Support Inbox UI (Mock)`
- [x] Build it: `/develop Support Inbox UI (Mock)`
  - [x] Domain status + TicketStatusBadge + Nest-shaped mock/filter
  - [x] Split-pane list/thread/composer + URL `id`/`status`/`q`/`state`
  - [x] Area AGENTS.md + ui-registry + progress tracker
- [x] Verify it: `/check verify Support Inbox UI (Mock)`
- [ ] Test it: `/test Support Inbox UI (Mock)` _(waived by developer — `/check verify` enough)_
ADR [0013](../adr/0013-support-inbox-ui-mock/index.md) · code in `src/app/(dashboard)/(gated)/support/`, `src/components/support/`, `src/lib/support/`

## Wire — replace mocks with the real API

### 9. Dashboard Data · in-progress · medium
Replace dashboard mocks with Nest `DashboardStats` via Query; skeletons and empty states for real loads.
**Done when:** KPI and chart values come from live Nest aggregates; loading and empty states work; fetch errors surface on the page with retry.
- [x] Design it (ADR): `/architect Dashboard Data`
- [x] Build it: `/develop Dashboard Data`
   - [x] `fetchDashboardStats` + `useDashboardStats` Query hook
   - [x] `DashboardContainer` (loading / empty / error) + page wire
   - [x] Area docs + progress tracker
- [ ] Verify it: `/check verify Dashboard Data`
- [ ] Test it: `/test Dashboard Data`
ADR 0004 · code in `src/lib/dashboard/`, `src/components/dashboard/`, `src/app/(dashboard)/(gated)/dashboard/`

### 10. Student Detail + Devices · in-progress · medium
Student profile plus device bindings; reset one or all with confirm; wired to users and devices admin endpoints. Also wires the students list to live `GET /users` (filters/pagination). Nest returns binding type + timestamps (no hash).
**Done when:** admin can open a student, see web/mobile bindings, reset one or all with confirm, see bindings refresh after reset, and the directory loads from Nest.
- [x] Design it (ADR): `/architect Student Detail + Devices`
- [x] Build it: `/develop Student Detail + Devices`
   - [x] Students + devices fetch/hooks/mutations + query keys
   - [x] Detail UI (profile, device cards, AlertDialog resets) + `[userId]` container
   - [x] Live `/students` list Query (URL filters → Nest; `?state=` preview)
   - [x] PostHog `admin_device_reset` + docs/registry/tracker
- [x] Verify it: `/check verify Student Detail + Devices`
- [ ] Test it: `/test Student Detail + Devices`
ADR [0006](../adr/0006-student-detail-devices/index.md) · code in `src/app/(dashboard)/(gated)/students/`, `src/components/students/`, `src/lib/students/`, `src/lib/devices/`

### 11. Plans UI + CRUD · done · medium
Plans table and create/edit flow with Zod validated payloads against plans admin endpoints. Live Nest wire (no mock-first); major-units price UX; inline active toggle + dialog.
**Done when:** admin can list, create, update, and disable plans; validation errors show inline; cache updates after writes.
- [x] Design it (ADR): `/architect Plans UI + CRUD`
- [x] Build it: `/develop Plans UI + CRUD`
   - [x] Types + fetch/mutations + Query hooks + `adminKeys.plans`
   - [x] Form stack + shadcn dialog/switch; plans table + skeleton + error
   - [x] Create/edit dialog + inline toggle; invalidate list
   - [x] Wire `/plans` + AGENTS.md + registry + tracker
- [x] Verify it: `/check verify Plans UI + CRUD`
- [x] Test it: `/test Plans UI + CRUD` _(waived by developer — `/check verify` enough)_
ADR [0007](../adr/0007-plans-ui-crud/index.md) · verify [checklist](../adr/0007-plans-ui-crud/verify.md) · code in `src/app/(dashboard)/(gated)/plans/`, `src/components/plans/`, `src/lib/plans/`

### 12. Receipt Review + Approve / Reject / Suspend · in-progress · full
Receipt detail with signed URL image, AI check panel (`ReceiptVerificationResult`), and approve / reject (reason required) / suspend confirmations wired to subscription admin endpoints. Also wires the pending queue to live `GET /subscriptions/pending`. Mutations on detail only; queue View → detail.
**Done when:** admin can review a pending receipt end to end and change status through the API; 403 and missing receipt errors are clear.
- [x] Design it (ADR): `/architect Receipt Review + Approve / Reject / Suspend`
- [x] Build it: `/develop Receipt Review + Approve / Reject / Suspend`
   - [x] Types + Nest verification helper + fetch/hooks/mutations + `adminKeys.subscriptions`
   - [x] Detail UI (receipt, AI panel, approve/reject/suspend dialogs) + `[id]` container
   - [x] Live `/subscriptions` pending Query; View only on table; `q` + `?state=`
   - [x] PostHog `admin_subscription_reviewed` + docs/registry/tracker
- [ ] Verify it: `/check verify Receipt Review + Approve / Reject / Suspend`
- [ ] Test it: `/test Receipt Review + Approve / Reject / Suspend`
ADR [0009](../adr/0009-receipt-review/index.md) · verify [checklist](../adr/0009-receipt-review/verify.md) · code in `src/app/(dashboard)/(gated)/subscriptions/`, `src/components/subscriptions/`, `src/lib/subscriptions/`

### 13. Content CRUD + Media Upload · in-progress · full
Wire content admin CRUD and publish; video (up to 1 GB) and PDF (up to 50 MB) via backend upload/presign flows with progress UI.
**Done when:** tree edits persist; media uploads complete through backend flows; queries invalidate on success; no R2 secrets in the client.
- [x] Design it (ADR): `/architect Content CRUD + Media Upload`
- [x] Build it: `/develop Content CRUD + Media Upload`
  - [x] Nest `DELETE` video/pdf (R2 then DB) + tests
  - [x] Admin fetch/hooks + hierarchy dialogs + tree/toolbar actions
  - [x] Lesson panel media upload (XHR progress) / metadata PATCH / confirm delete + PostHog
  - [x] Docs (AGENTS, registry, tracker)
- [x] Verify it: `/check verify Content CRUD + Media Upload`
- [ ] Test it: `/test Content CRUD + Media Upload`
ADR [0011](../adr/0011-content-crud-media/index.md) · verify [checklist](../adr/0011-content-crud-media/verify.md) · code in `src/app/(dashboard)/(gated)/content/`, `src/components/content/`, `src/lib/content/` (+ Nest `admin-content` DELETE)

### 14. Announcements UI + CRUD · in-progress · Wire
Announcement list and composer (title, RTL body, image, region, publish) wired to announcements admin endpoints. No pin (Nest has none).
**Done when:** admin can create, edit, publish/unpublish, and target by region; image upload uses Nest upload-url → PUT → attach.
- [x] Design it (ADR): `/architect Announcements UI + CRUD`
- [x] Build it: `/develop Announcements UI + CRUD`
  - [x] Types, fetch, parse, form schema, Query hooks, mutations (CRUD, publish, image XHR)
  - [x] Composer + list UI with `?id=` sync, publish switch, image dropzone
  - [x] Page wire + announcements AGENTS.md + ui-registry
- [x] Verify it: `/check verify Announcements UI + CRUD`
- [ ] Test it: `/test Announcements UI + CRUD`
ADR [0012](../adr/0012-announcements-ui-crud/index.md) · code in `src/app/(dashboard)/(gated)/announcements/`, `src/components/announcements/`, `src/lib/announcements/`

### 15. Support API Wiring · in-progress · medium
Wire the existing inbox UI to support admin list, reply, and close; Nest optional list `q`; email side effects stay on the backend.
**Done when:** tickets load from the API; reply and close persist; thread refreshes after actions.
- [x] Design it (ADR): `/architect Support API Wiring`
- [x] Build it: `/develop Support API Wiring`
  - [x] Nest list `q` + Admin fetch/hooks/mutations + `adminKeys.support.list`
  - [x] Enable Reply/Close UI; Query loading/error/empty; PostHog on success
  - [x] Area docs + progress tracker
- [x] Verify it: `/check verify Support API Wiring`
- [ ] Test it: `/test Support API Wiring`
ADR [0014](../adr/0014-support-api-wiring/index.md) · code in `src/app/(dashboard)/(gated)/support/`, `src/components/support/`, `src/lib/support/` (+ Nest `admin-support`)

## Hardening

### 16. Polish + Registry · in-progress · medium
Empty states, skeletons, and error toasts everywhere; ui-registry updated; accessibility pass on tables and dialogs; no secrets in the client bundle; clean production build.
**Done when:** critical screens have empty/loading/error UX; registry lists shipped components; `npm run build` passes; accessibility basics hold on tables and dialogs.
- [x] Design it (ADR): `/architect Polish + Registry`
- [x] Build it: `/develop Polish + Registry`
  - [x] Sonner + `Toaster` + `toastAdminError` helper
  - [x] Mutation toasts + empty/skeleton/ErrorPanel gap-fill
  - [x] A11y basics + ui-registry imprint + secrets/`npm run build`
- [x] Verify it: `/check verify Polish + Registry`
- [ ] Test it: `/test Polish + Registry`
ADR [0015](../adr/0015-polish-registry/index.md) · verify [checklist](../adr/0015-polish-registry/verify.md) · code in `src/components/ui/sonner.tsx`, `src/lib/toast/`, `src/components/layout/DashboardProviders.tsx`, area ErrorPanels / tables / empty states

### 17. Docs Sync · done
Progress tracker and env example match reality; smoke critical paths against a local API.
**Done when:** `progress-tracker.md` reflects shipped work; env example matches architecture; smoke paths documented or checked.
- [x] Build it: `/develop Docs Sync`

## Deferred
Out of scope for this Admin Web build pass, kept so the plan stays honest.
- **Student learning UI** — belongs to Student Web / Mobile
- **Direct teacher–student chat** — support is ticket + email only
- **Database or object storage from this app** — API owns Prisma and R2
- **Multi-admin RBAC beyond single admin** — v1 is one teacher account
- **Public marketing / SEO pages** — auth walled app only
- **Billing provider integration** — receipts stay manual bank/transfer uploads
- **Settings and Devices as top nav items** — appear in some stitch screens; excluded from v1 nav per product overview

## Legend

**Feature lifecycle** — the scope updates as a feature moves; each row is what it shows and who sets it:

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (ADR): /architect <feature>` |
| `in-progress` (designed) | **`/architect` at ADR capture** | `Design it` ticked; ADR linked; `Build it: /develop <feature>` + **2 to 5 milestones rolled up from the ADR**; `Verify it` + `Test it` boxes; any surfaced follow-up enrolled |
| `in-progress` (building) | `/develop` | milestone sub-boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | `/test`, then `/sync` | all boxes ticked; `/sync` captures the slice's conventions into `AGENTS.md` |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **needs a decision** = run `/architect` first; otherwise straight to `/develop` (or `/audit` for standards & tooling). The tag drops once the ADR is captured.
- **Atomic build tasks live in the ADR's `## Build plan`, not here** — the scope carries only the milestone rollup.
- **Status** `planned` → `in-progress` → `done`, plus `existing` (pre-workflow) and `dropped` (de-scoped, kept for history).
- **Approach tag** beside a heading (e.g. `· Facade`) overrides the project default for that feature; no tag = inherits it.
- **Weight tag** `· full` = a fresh-model `/check review` warranted; `lean`/`medium` get no tag.
- **Pointer line** (`ADR <n> · code in <path>`): the ADR link added by `/architect`, the code path by `/develop`.
