# Project Overview — Mulhim Admin Web

## About the Project

Mulhim Admin Web is the teacher/admin dashboard for the **Mulhim** learning platform (Palestine / Tawjihi / Grade 12). It is one of four applications in the Mulhim system:

| App                                     | Role                                                           |
| --------------------------------------- | -------------------------------------------------------------- |
| Student Web (`smartmulhim.com`)         | Student learning experience                                    |
| **Admin Web (`admin.smartmulhim.com`)** | Teacher operations dashboard                                   |
| Student Mobile                          | Offline lessons + secure video downloads                       |
| Backend API (`api.smartmulhim.com`)     | NestJS source of truth for auth, data, storage, and admin APIs |

This app does **not** own business rules or the database. It authenticates admins via Clerk, calls the Mulhim Backend admin APIs, and presents a dense SaaS dashboard for day-to-day teaching operations.

---

## The Problem It Solves

The teacher needs one place to:

- Approve or reject payment receipts before students unlock paid lessons
- Organize and publish the Unit → Chapter → Lesson content tree by region
- Manage students and reset device bindings when access is stuck
- Publish announcements and answer support requests
- See high-signal analytics (students, subscriptions, pending work, support load)

Without this dashboard, subscription approval, content publishing, and support would be manual and error-prone.

---

## Pages

```
/login                    → Admin auth (Clerk)
/dashboard                → Analytics overview (KPIs + charts)
/students                 → Student list + device bindings
/students/[userId]        → Student detail + device reset
/plans                    → Subscription plan CRUD
/subscriptions            → Approval queue + status management
/subscriptions/[id]       → Receipt review + approve/reject/suspend
/content                  → Unit → Chapter → Lesson tree
/content/units/[id]       → Unit detail / chapters
/content/chapters/[id]    → Chapter detail / lessons
/content/lessons/[id]     → Lesson detail / media upload / publish
/announcements            → Announcement list + composer
/announcements/[id]       → Announcement edit / publish
/support                  → Support inbox
/support/[id]             → Ticket detail + reply / close
```

---

## Navigation

Fixed left sidebar (280px) + top utility bar (64px). Sidebar items:

```
Dashboard
Students
Plans
Subscriptions
Content
Announcements
Support
```

On mobile, the sidebar collapses into a drawer. Shell UI is LTR English; Arabic content fields support RTL.

---

## Core Admin Flows

### Subscription Approval

1. Student submits plan + receipt via Student Web/Mobile
2. Backend AI verifies receipt → `pending_approval` (or related pending states)
3. Admin opens Subscriptions → Pending queue
4. Admin views signed receipt URL, AI notes, sender name, plan
5. Admin approves, rejects (with reason), or later suspends an active subscription
6. Backend updates status; student access unlocks or stays locked accordingly

### Content Publishing

1. Admin builds Unit → Chapter → Lesson hierarchy
2. Sets region (`gaza` | `west_bank` | `both`), preview vs subscriber-only, publish flags
3. Uploads video (up to 1 GB) and/or PDF (up to 50 MB) via backend presigned/upload flows
4. Publishes at unit/chapter/lesson levels per cascade rules enforced by the API

### Students & Devices

1. Admin lists students (name, email, phone, Telegram, region, subscription status)
2. Opens a student to view bound web/mobile device hashes
3. Resets one device or all devices when the student needs to rebind

### Announcements & Support

1. Admin composes announcements with optional image + region targeting + pin/publish
2. Admin reviews Contact Us tickets, replies (email via backend), closes tickets

### Analytics Dashboard

1. KPI cards: Total Students, Active Subscriptions, Pending Approvals (urgent), Open Support Tickets
2. Charts: subscription growth over time; region distribution (Gaza vs West Bank)
3. Driven by backend data and PostHog lifecycle events where applicable

---

## Features In Scope

- Clerk admin authentication and protected dashboard routes
- Role gate: only users with backend role `admin`
- Dashboard KPIs and charts
- Students list + detail + device reset
- Subscription plans CRUD (create, update, disable)
- Subscription pending queue + approve / reject / suspend + receipt viewer
- Content tree CRUD, publish/unpublish, region, preview lock, media upload
- Announcements CRUD, image upload, region, pin, publish
- Support inbox, reply, close
- TanStack Query for server state
- Zod validation on all write payloads
- PostHog analytics (admin-relevant events)
- Kinetic Enterprise design system (sidebar SaaS layout)
- RTL support for Arabic content fields
- Empty states, skeletons, status badges throughout

---

## Features Out of Scope

- Student-facing learning UI (belongs to Student Web / Mobile)
- Direct teacher–student chat (support is ticket + email only)
- Database / Prisma access from the Admin Web app
- Cloudflare R2 credentials or signed URL generation in the browser
- AI receipt verification logic (backend only)
- Mobile offline sync / video download authorization
- Multi-admin RBAC beyond single `admin` role (v1 is one teacher account)
- Public marketing pages
- Student registration flows
- HLS / multi-quality video pipeline
- Billing provider integration (receipts are manual bank/transfer uploads)

---

## Backend Dependency

Admin Web consumes NestJS admin endpoints documented in the Mulhim Backend README, including:

- `GET /users` — list students
- Plans: `GET /plans/all`, `POST /plans`, `PATCH /plans/:id`
- Subscriptions: pending queue, receipt URL, approve / reject / suspend
- Content: `GET/PATCH/POST /content/admin/*`
- Announcements: `GET/PATCH/POST /announcements/admin/*`
- Support: `GET/PATCH /support/admin/requests/*`
- Devices: `GET/DELETE /devices/admin/users/:userId/bindings/*`

All authorization, region rules, subscription lifecycle, and file signing happen on the API. The Admin Web never trusts client-side role or subscription flags.

---

## Target User

A single teacher/admin who:

- Reviews payment receipts daily
- Publishes Tawjihi content for Gaza and West Bank
- Needs a calm, dense dashboard (not a marketing site)
- Works primarily in English UI with Arabic lesson/support content

---

## Success Criteria

- Admin can log in via Clerk and reach only admin-protected routes
- Pending subscription can be reviewed with receipt and approved/rejected end to end
- Content tree can be created, media uploaded, and published by region
- Student device bindings can be viewed and reset
- Announcements and support tickets can be managed without leaving the dashboard
- UI matches Kinetic Enterprise tokens (sidebar layout, status badges, tables)
- `npm run build` passes
- No secrets (R2, Clerk secret misuse, DB URLs) exposed to the client beyond required public env vars
