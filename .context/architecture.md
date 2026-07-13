# Architecture — Mulhim Admin Web

## Stack

| Layer | Tool | Purpose |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) + React 19 | Admin dashboard UI |
| Language | TypeScript (strict) | Throughout |
| Auth | Clerk (`@clerk/nextjs`) | Admin session only |
| API | Mulhim NestJS Backend | All business logic + data |
| Server state | TanStack Query | Client reads/mutations against API |
| Validation | Zod + react-hook-form | Forms and write payloads |
| Styling | Tailwind CSS v4 + shadcn/ui | UI primitives |
| Icons | lucide-react / Material Symbols (design) | Navigation and actions |
| Analytics | PostHog (`posthog-js`) | Admin product analytics |
| Package manager | npm | Do not use pnpm |

Admin Web does **not** use Prisma, R2 SDKs, or NestJS modules directly.

---

## System Position

```
Admin browser
  → Clerk session
  → Next.js Admin Web (UI + Server Actions / fetchers)
  → Authorization: Bearer Clerk JWT
  → Mulhim Backend (NestJS)
       → Prisma / Postgres
       → Cloudflare R2 (signed URLs)
       → PostHog / mail / AI (server-side)
```

### Invariants

- Role `admin` is resolved on the backend from the local DB — never from client claims alone.
- Receipts, videos, and PDFs are accessed only via backend-issued signed URLs.
- Subscription approve/reject/suspend always go through backend endpoints.
- Region, publish, and lock rules are enforced by the API; UI mirrors them, does not invent them.
- No database credentials or R2 secrets in Admin Web env beyond Clerk + public API/PostHog keys.

---

## Folder Structure

```
admin-web/   (or apps/admin-web/)
├── AGENTS.md
├── CLAUDE.md
├── context/
│   ├── project-overview.md
│   ├── architecture.md
│   ├── ui-tokens.md
│   ├── ui-rules.md
│   ├── ui-registry.md
│   ├── code-standards.md
│   ├── library-docs.md
│   ├── build-plan.md
│   ├── progress-tracker.md
│   └── ai-workflow-rules.md
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   └── (dashboard)/
│   │       ├── layout.tsx              → Sidebar + top bar shell
│   │       ├── dashboard/page.tsx
│   │       ├── students/
│   │       │   ├── page.tsx
│   │       │   └── [userId]/page.tsx
│   │       ├── plans/page.tsx
│   │       ├── subscriptions/
│   │       │   ├── page.tsx
│   │       │   └── [id]/page.tsx
│   │       ├── content/
│   │       │   ├── page.tsx
│   │       │   ├── units/[id]/page.tsx
│   │       │   ├── chapters/[id]/page.tsx
│   │       │   └── lessons/[id]/page.tsx
│   │       ├── announcements/
│   │       │   ├── page.tsx
│   │       │   └── [id]/page.tsx
│   │       └── support/
│   │           ├── page.tsx
│   │           └── [id]/page.tsx
│   ├── actions/                        → Server Actions (*Action suffix)
│   │   ├── students.ts
│   │   ├── plans.ts
│   │   ├── subscriptions.ts
│   │   ├── content.ts
│   │   ├── announcements.ts
│   │   ├── support.ts
│   │   └── devices.ts
│   ├── components/
│   │   ├── ui/                         → shadcn only
│   │   ├── layout/
│   │   │   ├── AppSidebar.tsx
│   │   │   ├── AppTopbar.tsx
│   │   │   └── PageHeader.tsx
│   │   ├── dashboard/
│   │   ├── students/
│   │   ├── plans/
│   │   ├── subscriptions/
│   │   ├── content/
│   │   ├── announcements/
│   │   └── support/
│   ├── hooks/                          → use* query/mutation hooks
│   ├── lib/
│   │   ├── auth/                       → Clerk helpers, admin gate
│   │   ├── api/                        → Typed API client (Bearer token)
│   │   ├── posthog/
│   │   ├── query/                      → QueryClient + keys
│   │   └── validators/                 → Zod schemas
│   └── types/
└── proxy.ts                            → Clerk clerkMiddleware + protect dashboard routes
```

---

## Request Flow

### Reads (preferred)

```
Server Component or Client Component
  → TanStack Query hook / server fetcher
  → lib/api client with Clerk token
  → GET backend admin endpoint
  → map response to UI types
```

### Writes

```
Form (react-hook-form + Zod)
  → Server Action (*Action) OR useMutation
  → validate with Zod
  → POST/PATCH/DELETE backend admin endpoint
  → invalidate related query keys
  → toast / inline error
```

Prefer Server Actions for mutations when they keep secrets and tokens server-side. Use client mutations when UX needs optimistic updates or upload progress — still call the backend through the typed API client, never invent local business rules.

---

## Auth Model

- Clerk is the only auth provider.
- `src/proxy.ts` (`clerkMiddleware`) protects all routes except `/login` and `/forbidden`.
- After Clerk auth, Admin Web must confirm the user is registered as `admin` via backend (`GET /users/me` or equivalent admin gate). Non-admins are blocked.
- Never render admin tools based only on a client-side flag.

---

## API Surface Used by Admin Web

Aligned with Mulhim Backend README:

| Area | Methods |
| --- | --- |
| Students | `GET /users` |
| Plans | `GET /plans/all`, `POST /plans`, `PATCH /plans/:id` |
| Subscriptions | `GET /subscriptions/pending`, `GET /subscriptions/:id`, `GET /subscriptions/:id/receipt-url`, `PATCH .../approve|reject|suspend` |
| Content | `GET/PATCH/POST /content/admin/*` |
| Announcements | `GET/PATCH/POST /announcements/admin/*` |
| Support | `GET/PATCH /support/admin/requests/*` |
| Devices | `GET/DELETE /devices/admin/users/:userId/bindings/*` |
| Analytics | `GET /analytics/admin/dashboard` |

Upload flows for content media, announcement images, and receipt viewing use backend-presigned or signed URL endpoints — Admin Web never talks to R2 with secrets.

---

## Domain Rules the UI Must Reflect

### Roles

- `student` | `admin` only
- Admin Web is for `admin` only

### Regions

- Students: `gaza` | `west_bank`
- Content / announcements: `gaza` | `west_bank` | `both`

### Subscription statuses

- `free` | `pending_review` | `pending_approval` | `active` | `expired` | `rejected` | `suspended`

Primary admin workload: pending queue → approve / reject; later suspend if needed.

### Content hierarchy

```
Unit → Chapter → Lesson → Video / PDF
```

Publish, preview, and region controls exist at the levels the backend supports. UI must not invent cascade behavior that the API does not implement.

### Support statuses

- `open` | `reviewed` | `closed`

### Devices

- One web + one mobile binding per student
- Admin can reset one or all
- UI shows hashes only (never raw device IDs from storage)

---

## Server State (TanStack Query)

Recommended query key groups:

- `['admin', 'me']`
- `['admin', 'dashboard', 'stats', userId]`
- `['admin', 'students']` / `['admin', 'students', userId]`
- `['admin', 'plans']`
- `['admin', 'subscriptions', filters]`
- `['admin', 'subscriptions', id]`
- `['admin', 'content', 'tree']` / unit / chapter / lesson keys
- `['admin', 'announcements']`
- `['admin', 'support']` / ticket id
- `['admin', 'devices', userId]`

Rules:

- Stable keys; invalidate after successful mutations
- Skeletons on first load; keep previous data during refetch
- Differentiate `isLoading` vs `isFetching`

---

## Analytics

PostHog on Admin Web for product usage. Backend already emits lifecycle events (`subscription_approved`, etc.). Admin Web may emit UI events such as:

- `admin_logged_in`
- `admin_subscription_reviewed`
- `admin_content_published`
- `admin_content_media_attached`
- `admin_content_media_deleted`
- `admin_device_reset`
- `admin_support_replied`

Do not invent backend lifecycle event names — those stay on the API.

---

## Environment Variables

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=
NEXT_PUBLIC_POSTHOG_HOST=
```

Optional Clerk URL helpers as needed by `@clerk/nextjs` (sign-in/sign-up URLs).

---

## Security Boundaries

- Never put R2 keys, `DATABASE_URL`, `DEVICE_HASH_PEPPER`, or Arcjet keys in Admin Web.
- Never trust role / region / subscription from the client for authorization UI alone — always re-check via API errors (403) and gate on `/users/me`.
- Receipt viewer opens signed URLs only; do not cache receipt binaries in public folders.
- Validate every mutation with Zod before calling the API.

---

## UI Architecture

- Kinetic Enterprise design system (see `ui-tokens.md`, `ui-rules.md`)
- Fixed sidebar + top bar shell for all dashboard pages
- Tables, KPI cards, status badges, nested content tree, split-pane support inbox
- shadcn/ui for primitives; project components for domain UI
- Design references live in stitch Admin SaaS panel (dashboard, subscriptions, content, students)

---

## Notifications (Backend-Automatic)

When an admin publishes a lesson or announcement, Nest automatically creates
in-app Notification records for matching-region students and attempts a
push send (currently no-op — `PUSH_NOTIFICATIONS_ENABLED=false` until
Student Web/Mobile exist to register device tokens). No admin action,
button, or toggle exists for this — it is fully automatic and invisible
to the Admin Web UI.

---

## What This App Must Not Do

- Direct Prisma / SQL
- Own subscription expiry cron or AI verification
- Store permanent media URLs as public assets for paid content
- Implement student learning or mobile download flows
- Use pnpm or Pages Router
- Own a notifications UI or send controls (Nest fans out on publish)
