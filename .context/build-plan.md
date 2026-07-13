# Build Plan — Mulhim Admin Web

## Core Principle

Full page UI with mock data first — verify visually against Kinetic Enterprise / stitch screens — then wire to Mulhim Backend admin APIs. Every step must be visible and testable before the next. No invisible “backend-only” phases inside this app (the API already exists).

---

## Phase 1 — Foundation

### 01 App Shell + Design Tokens

**UI:**

- Root layout with fonts (Hanken Grotesk, Inter, JetBrains Mono)
- `globals.css` `@theme` tokens from `ui-tokens.md`
- Dashboard layout: AppSidebar + AppTopbar
- Sidebar nav items: Dashboard, Students, Plans, Subscriptions, Content, Announcements, Support
- Placeholder page bodies for each route

**Logic:**

- Route group `(dashboard)` shell
- Mobile drawer behavior for sidebar

---

### 02 Auth (Clerk)

**UI:**

- Login page outside dashboard shell
- Forbidden / non-admin state

**Logic:**

- ClerkProvider + middleware protecting dashboard routes
- Session token available to API client
- After login → `/dashboard`
- Admin role gate via backend profile

---

### 03 API Client + TanStack Query + PostHog

**Logic:**

- `src/lib/api` authenticated fetch helper
- QueryClient provider + key factory
- PostHog provider, identify/reset hooks
- Env wiring: Clerk, `NEXT_PUBLIC_API_URL`, PostHog

---

## Phase 2 — Dashboard

### 04 Dashboard UI (Mock)

**UI:**

- Page header “Analytics Dashboard”
- KPI cards: Total Students, Active Subscriptions, Pending Approvals, Open Support Tickets
- Subscription growth chart placeholder
- Region distribution chart placeholder
- Optional recent activity / quick links

### 05 Dashboard Data

**Logic:**

- Wire KPIs/charts to backend and/or PostHog-backed aggregates as available
- Loading skeletons + empty states

---

## Phase 3 — Students & Devices

### 06 Students List UI (Mock)

**UI:**

- Table: name, email, phone, Telegram, region, subscription status
- Search / filter by region and status
- Row → student detail

### 07 Student Detail + Devices

**UI:**

- Profile summary
- Device bindings list (web/mobile, hashes, timestamps)
- Reset one / reset all with confirm dialog

**Logic:**

- `GET /users`
- `GET/DELETE /devices/admin/users/:userId/bindings/*`
- Mutations + query invalidation

---

## Phase 4 — Plans

### 08 Plans UI + CRUD

**UI:**

- Plans table: name, price, duration, active toggle
- Create / edit plan dialog or page

**Logic:**

- `GET /plans/all`, `POST /plans`, `PATCH /plans/:id`
- Zod validators for plan payloads

---

## Phase 5 — Subscriptions

### 09 Subscriptions Queue UI (Mock)

**UI:**

- Tabs/filters with **Pending** as default
- Columns: student, plan, submitted date, status badge, AI result, actions
- Status badges per `ui-tokens.md`

### 10 Receipt Review + Approve / Reject / Suspend

**UI:**

- Detail drawer/page with receipt image (signed URL), AI notes, sender name
- Approve, Reject (reason required), Suspend confirmations

**Logic:**

- `GET /subscriptions/pending`
- `GET /subscriptions/:id/receipt-url`
- `PATCH` approve / reject / suspend
- PostHog `admin_subscription_reviewed` (optional)

---

## Phase 6 — Content

### 11 Content Tree UI (Wire)

**UI:**

- Nested Unit → Chapter → Lesson tree
- Publish toggles, region on units, lesson accessLevel, lesson detail panel
- URL `lessonId` + `q` search (shared `POST /content/search` + client fallback)

**Logic:**

- Live `GET /content/admin/tree`, lesson detail, publish/unpublish
- PostHog `admin_content_published` on publish success

### 12 Content CRUD + Media Upload

**Logic:**

- Wire `/content/admin/*` list/create/update/publish
- Video upload up to 1 GB, PDF up to 50 MB via backend upload flow
- Progress UI for large uploads
- Invalidate content queries on success

---

## Phase 7 — Announcements

### 13 Announcements UI + CRUD

**UI:**

- List with pin/publish/region badges
- Composer: title, body (RTL-capable), image upload, region, pin, publish

**Logic:**

- `/announcements/admin/*`
- Image upload via backend signed/presign flow

---

## Phase 8 — Support

### 14 Support Inbox UI (Mock)

**UI:**

- Split pane list + thread
- Status chips: open / reviewed / closed
- Reply box + close action
- RTL for Arabic message bodies

### 15 Support API Wiring

**Logic:**

- `/support/admin/requests/*` list, reply, close
- Email side effects stay on backend

---

## Phase 9 — Hardening

### 16 Polish + Registry

- Empty states, skeletons, error toasts everywhere
- Update `ui-registry.md` with all components
- Accessibility pass on tables and dialogs
- Ensure no secrets in client bundle
- `npm run build` clean

### 17 Docs Sync

- Update `progress-tracker.md`
- Confirm env example matches `architecture.md`
- Smoke-test critical paths against local API

---

## Verification Checklist (every step)

- [ ] Matches Kinetic / stitch layout patterns
- [ ] Uses design tokens (no random hex)
- [ ] Auth/admin gate respected
- [ ] API errors surfaced cleanly
- [ ] Query cache invalidated after writes
- [ ] `progress-tracker.md` updated
