# UI Registry — Mulhim Admin Web

Living document. Update after every component is built. Read before creating a new component — match existing patterns before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes / structure
3. If no — build it following `ui-rules.md` and `ui-tokens.md`, then add it here

After building — record: component name, file path, key classes / variants. Prefer `/imprint` after each UI build.

---

## Index

### Layout

| Component | Path | Notes |
| --- | --- | --- |
| AppSidebar | `src/components/layout/AppSidebar.tsx` | 280px fixed nav, active indigo state, mobile drawer |
| AppTopbar | `src/components/layout/AppTopbar.tsx` | 64px sticky bar, search + notifications + profile |
| DashboardShell | `src/components/layout/DashboardShell.tsx` | Sidebar + topbar; main `px-container py-8` |
| PageHeader | `src/components/layout/PageHeader.tsx` | eyebrow + display-lg title; optional `className` |
| PlaceholderPanel | `src/components/layout/PlaceholderPanel.tsx` | Level 1 bordered placeholder card |

### Shared

| Component | Path | Notes |
| --- | --- | --- |
| StatusBadge | `src/components/shared/StatusBadge.tsx` | Subscription status pills on Kinetic status tokens |
| TicketStatusBadge | `src/components/shared/TicketStatusBadge.tsx` | Support `open` / `reviewed` / `closed` (reuses status color tokens) |
| toastAdminError / toastAdminSuccess | `src/lib/toast/admin-toast.ts` | Mutation feedback via Sonner; Nest body → kind map → generic |
| Toaster | `src/components/ui/sonner.tsx` | Mounted once in `DashboardProviders` |

### Students

| Component | Path | Notes |
| --- | --- | --- |
| StudentsHeaderActions | `src/components/students/StudentsHeaderActions.tsx` | Decorative Export CSV (disabled) |
| StudentsToolbar | `src/components/students/StudentsToolbar.tsx` | Search + region/status selects; URL params |
| StudentsTable | `src/components/students/StudentsTable.tsx` | Enrollment table + pagination footer |
| StudentsSkeleton | `src/components/students/StudentsSkeleton.tsx` | List loading placeholders |
| StudentsView | `src/components/students/StudentsView.tsx` | Header + Enrollment Directory card |
| StudentsErrorPanel | `src/components/students/StudentsErrorPanel.tsx` | Fetch failure + retry (`Empty` pattern) |

### Plans

| Component | Path | Notes |
| --- | --- | --- |
| PlansContainer | `src/components/plans/PlansContainer.tsx` | Query loading / error / live view |
| PlansView | `src/components/plans/PlansView.tsx` | Header + Add + table card + dialog |
| PlansTable | `src/components/plans/PlansTable.tsx` | Plan rows + active Switch + edit |
| PlanFormDialog | `src/components/plans/PlanFormDialog.tsx` | Create/edit RHF + Zod dialog |
| PlansSkeleton | `src/components/plans/PlansSkeleton.tsx` | List loading placeholders |
| PlansErrorPanel | `src/components/plans/PlansErrorPanel.tsx` | Fetch failure + retry (`Empty` pattern) |

### Support

| Component | Path | Notes |
| --- | --- | --- |
| SupportContainer | `src/components/support/SupportContainer.tsx` | Mock list or empty preview → view |
| SupportView | `src/components/support/SupportView.tsx` | Header + chips + search + split pane; URL sync |
| SupportList | `src/components/support/SupportList.tsx` | Left request list + selection highlight |
| SupportThread | `src/components/support/SupportThread.tsx` | Right thread (message + optional adminReply) |
| SupportComposer | `src/components/support/SupportComposer.tsx` | Reply/close (disabled when closed) |
| SupportSkeleton | `src/components/support/SupportSkeleton.tsx` | Inbox loading placeholders |
| SupportErrorPanel | `src/components/support/SupportErrorPanel.tsx` | Fetch failure + retry (`Empty` pattern) |

### Announcements

| Component | Path | Notes |
| --- | --- | --- |
| AnnouncementsContainer | `src/components/announcements/AnnouncementsContainer.tsx` | Query loading / error / live view |
| AnnouncementsView | `src/components/announcements/AnnouncementsView.tsx` | Header + composer + list; `?id=` sync |
| AnnouncementsComposer | `src/components/announcements/AnnouncementsComposer.tsx` | RHF form, Save, publish switch, image |
| AnnouncementsList | `src/components/announcements/AnnouncementsList.tsx` | History table + New |
| AnnouncementPublishSwitch | `src/components/announcements/AnnouncementPublishSwitch.tsx` | Nest publish/unpublish |
| AnnouncementImageSection | `src/components/announcements/AnnouncementImageSection.tsx` | XHR upload progress; attached indicator |
| AnnouncementsSkeleton | `src/components/announcements/AnnouncementsSkeleton.tsx` | Composer + list placeholders |
| AnnouncementsErrorPanel | `src/components/announcements/AnnouncementsErrorPanel.tsx` | Fetch failure + retry (`Empty` pattern) |

### Content

| Component | Path | Notes |
| --- | --- | --- |
| ContentContainer | `src/components/content/ContentContainer.tsx` | Query loading / error / live view |
| ContentView | `src/components/content/ContentView.tsx` | Header + toolbar + tree + lesson panel + CRUD dialogs |
| ContentToolbar | `src/components/content/ContentToolbar.tsx` | Debounced `q` → URL + New unit |
| ContentTree | `src/components/content/ContentTree.tsx` | Unit → Chapter → Lesson accordion + publish + row actions |
| ContentLessonPanel | `src/components/content/ContentLessonPanel.tsx` | Lesson detail / empty / not-found + edit |
| LessonMediaSection | `src/components/content/LessonMediaSection.tsx` | Video/PDF list, XHR upload progress, edit, confirm delete |
| UnitFormDialog | `src/components/content/UnitFormDialog.tsx` | Create/edit unit (RHF + Zod) |
| ChapterFormDialog | `src/components/content/ChapterFormDialog.tsx` | Create/edit chapter |
| LessonFormDialog | `src/components/content/LessonFormDialog.tsx` | Create/edit lesson |
| PublishSwitch | `src/components/content/PublishSwitch.tsx` | Optimistic publish for unit/chapter/lesson |
| ContentSkeleton | `src/components/content/ContentSkeleton.tsx` | Tree + panel placeholders |
| ContentErrorPanel | `src/components/content/ContentErrorPanel.tsx` | Fetch failure + retry (`Empty` pattern) |

### Subscriptions

| Component | Path | Notes |
| --- | --- | --- |
| SubscriptionsView | `src/components/subscriptions/SubscriptionsView.tsx` | Header + receipt review card (tabs + search + table) |
| SubscriptionsTabs | `src/components/subscriptions/SubscriptionsTabs.tsx` | Pending active; Archived / AI Logs disabled stubs |
| SubscriptionsToolbar | `src/components/subscriptions/SubscriptionsToolbar.tsx` | Debounced `q` search → URL |
| SubscriptionsTable | `src/components/subscriptions/SubscriptionsTable.tsx` | Queue rows, AI cell, View link, disabled mutate icons |
| SubscriptionsSkeleton | `src/components/subscriptions/SubscriptionsSkeleton.tsx` | Queue loading placeholders |
| SubscriptionsErrorPanel | `src/components/subscriptions/SubscriptionsErrorPanel.tsx` | Fetch failure + retry (`Empty` pattern) |

### Dashboard

| Component | Path | Notes |
| --- | --- | --- |
| KpiCard | `src/components/dashboard/KpiCard.tsx` | KPI + sparkline; urgent tertiary variant |
| KpiSparkline | `src/components/dashboard/KpiSparkline.tsx` | Client Recharts area sparkline |
| SubscriptionGrowthChart | `src/components/dashboard/SubscriptionGrowthChart.tsx` | Dual line chart (new / renewals) |
| RegionDistribution | `src/components/dashboard/RegionDistribution.tsx` | Gaza / West Bank progress bars |
| RecentActivityTable | `src/components/dashboard/RecentActivityTable.tsx` | Activity table + empty state |
| DashboardHeaderActions | `src/components/dashboard/DashboardHeaderActions.tsx` | Decorative range + export |
| DashboardSkeleton | `src/components/dashboard/DashboardSkeleton.tsx` | Full-page loading placeholders |
| DashboardView | `src/components/dashboard/DashboardView.tsx` | Composes analytics from `DashboardStats` |
| DashboardContainer | `src/components/dashboard/DashboardContainer.tsx` | Query loading / error / live view |
| DashboardErrorPanel | `src/components/dashboard/DashboardErrorPanel.tsx` | Fetch failure + retry (`Empty` pattern) |

### shadcn UI (base-lyra)

`src/components/ui/`: button, card, badge, table, skeleton, empty, chart, avatar, separator, input, select, alert-dialog, dialog, switch, label, textarea, field, collapsible, accordion, sonner. Kinetic colors on `:root` in `globals.css`. Do not use `px-(--card-spacing)` / `--spacing(N)` for card padding; use explicit `p-6` / `px-8`.

### Mutation toasts (ADR 0015)

- Errors: `toastAdminError` on mutation `onError` (plans, subscriptions, content, announcements, support, devices, student lifecycle).
- Success: only support reply/close and subscription approve/reject/suspend.
- Queries stay on `*ErrorPanel` + retry (no toast).
- Prefer Nest `body.message`, then kind map; never raw `[api/apiFetch]` strings.

---

## Imprinted patterns

### Card (dashboard Level 1)

File: `src/components/ui/card.tsx` (+ dashboard overrides)
Last updated: 2026-07-10

| Property | Class |
| --- | --- |
| Background | `bg-surface-container-lowest` (dashboard) / `bg-card` (primitive) |
| Border | `border border-outline-variant` + `ring-0` (dashboard) |
| Border radius | `rounded-xl` |
| Text — primary | `text-on-surface` |
| Text — secondary | `text-on-surface-variant` |
| Spacing — KPI | `Card` `py-0`; `CardContent` `p-6` `gap-4` |
| Spacing — chart panel | `CardHeader` `px-8 pt-8`; `CardContent` `px-8 pb-8` |
| Spacing — table panel | `CardHeader` `px-6 py-6`; table body may use `CardContent` `px-0` |
| Shadow | none |
| Accent usage | none on default cards |

**Pattern notes:**
Never rely on `--card-spacing` / `px-(--card-spacing)` (does not apply reliably here). Prefer explicit Tailwind padding. No drop shadows on Level 1 cards.

### KpiCard

File: `src/components/dashboard/KpiCard.tsx`
Last updated: 2026-07-10

| Property | Class |
| --- | --- |
| Background | `bg-surface-container-lowest` |
| Border | `border border-outline-variant` |
| Border radius | `rounded-xl` |
| Text — label | `text-label-md uppercase text-on-surface-variant` |
| Text — value | `text-headline-md text-on-surface` |
| Spacing | `p-6` `gap-4` |
| Icon well | `rounded-lg bg-primary/10 p-2 text-primary` |
| Trend up | `bg-status-active-bg text-status-active` |
| Trend down | `bg-error-container text-error` |
| Shadow | none |

**Urgent variant:** `border-2 border-tertiary-container bg-tertiary-fixed`; label/value use `text-on-tertiary-fixed*`; badge `Urgent` with `bg-tertiary-fixed-dim/30 text-tertiary`.

### SubscriptionGrowthChart

File: `src/components/dashboard/SubscriptionGrowthChart.tsx`
Last updated: 2026-07-10

| Property | Class |
| --- | --- |
| Background | `bg-surface-container-lowest` |
| Border | `border border-outline-variant` |
| Border radius | `rounded-xl` |
| Title | `text-headline-sm font-display text-on-surface` |
| Description | `text-body-sm text-on-surface-variant` |
| Spacing | header/content `px-8` + `pt-8` / `pb-8` |
| Chart colors | `var(--color-primary)` (new), `var(--color-secondary)` (renewals) |
| Empty | `Empty` + dashed `border-outline-variant` |
| Shadow | none |

**Pattern notes:** Client island (`"use client"`). Recharts via shadcn `ChartContainer`.

### RegionDistribution

File: `src/components/dashboard/RegionDistribution.tsx`
Last updated: 2026-07-10

| Property | Class |
| --- | --- |
| Background | `bg-surface-container-lowest` |
| Border | `border border-outline-variant` |
| Border radius | `rounded-xl` |
| Title / description | same as growth chart |
| Spacing | `px-8` panel padding |
| Track | `h-3 rounded-full bg-surface-container-low` |
| Fill — Gaza | `bg-primary` |
| Fill — West Bank | `bg-secondary` |
| Footer meta | `text-body-sm font-bold text-on-surface` + `text-[11px] text-on-surface-variant` |
| Shadow | none |

### RecentActivityTable

File: `src/components/dashboard/RecentActivityTable.tsx`
Last updated: 2026-07-10

| Property | Class |
| --- | --- |
| Background | `bg-surface-container-lowest` |
| Border | `border border-outline-variant` |
| Header bar | `border-b border-outline-variant bg-surface-container-low/30 px-6 py-6` |
| Title | `text-headline-sm font-display text-on-surface` |
| Link action | `text-body-sm font-bold text-primary underline-offset-4 hover:underline` (plain `Link`, not Button+render) |
| Table header | `text-label-md uppercase tracking-wider text-on-surface-variant` |
| Row hover | `hover:bg-surface-container-low` |
| Plan chip | `bg-primary/10 text-label-md font-bold uppercase text-primary` |
| Shadow | none |

**Pattern notes:** Do not use Base UI `Button` with `render={<Link />}` unless `nativeButton={false}`. Prefer styled `Link` for text actions.

### StatusBadge

File: `src/components/shared/StatusBadge.tsx`
Last updated: 2026-07-10

| Property | Class |
| --- | --- |
| Shape | `rounded-full` |
| Type | `text-[11px] font-bold uppercase tracking-wide` |
| active | `bg-status-active-bg text-status-active border-status-active/30` |
| pending_review | `bg-status-pending-review-bg text-status-pending-review` |
| pending_approval | `bg-status-pending-approval-bg text-status-pending-approval` |
| expired / free | muted `status-expired` / `status-free` tokens |
| rejected / suspended | matching `status-*` tokens |

**Pattern notes:** Always map Nest `SubscriptionStatus` enums; never invent alternate status strings.

### DashboardHeaderActions

File: `src/components/dashboard/DashboardHeaderActions.tsx`
Last updated: 2026-07-10

| Property | Class |
| --- | --- |
| Layout | `flex flex-wrap gap-3` |
| Secondary | `Button variant="outline"` + `rounded-lg border-outline-variant bg-surface-container-low` |
| Primary | `Button` default + `rounded-lg` |
| Icons | Phosphor + `data-icon="inline-start"` |

**Pattern notes:** Decorative/disabled until step 05 wires range/export.

### DashboardShell (main canvas)

File: `src/components/layout/DashboardShell.tsx`
Last updated: 2026-07-10

| Property | Class |
| --- | --- |
| Page background | `bg-background` |
| Main padding | `px-container py-8` |
| Sidebar offset | `lg:pl-sidebar` |

---

## Domain

| Module | Path | Notes |
| --- | --- | --- |
| Region | `src/lib/domain/region.ts` | `gaza` / `west_bank` + labels |
| Subscription status | `src/lib/domain/subscription-status.ts` | Nest enums + labels for `StatusBadge` |
| Student list types | `src/lib/students/types.ts` | Nest `StudentListItem` / `StudentListResponse` |
| Student list preview | `src/lib/students/mock-data.ts` | `?state=` fixtures only |
| Devices admin | `src/lib/devices/` | Bindings list + reset by `deviceType` |
| Plans admin | `src/lib/plans/` | `AdminPlan` list + create/update; major↔minor money |
| Subscriptions pending + detail | `src/lib/subscriptions/` | Live pending/detail/receipt-url + Nest `ReceiptVerificationResult` parser |

---

### StudentsTable / Enrollment Directory

File: `src/components/students/StudentsView.tsx` (+ table/toolbar)
Last updated: 2026-07-10

| Property | Class |
| --- | --- |
| Background | `bg-surface-container-lowest` |
| Border | `border border-outline-variant` |
| Border radius | `rounded-xl` |
| Title | `text-headline-sm font-display text-on-surface` |
| Toolbar bar | `border-b border-outline-variant bg-surface-container-low/30 px-6 py-4` |
| Search input | `h-9 rounded-lg border-outline-variant bg-surface-container-lowest pl-9` |
| Table header | `text-label-md uppercase tracking-wider text-on-surface-variant` |
| Row hover | `hover:bg-surface-container-low` |
| Avatar well | `rounded-lg bg-primary-container text-on-primary-container` |
| Shadow | none |

**Pattern notes:** Filters live in URL (`q`, `region`, `status`, `page`) and map to Nest `GET /users`. Preview via `?state=loading|empty`. Row profile links to `/students/[userId]`. Reuse `StatusBadge` for subscription status. Live list via `StudentsListContainer` (ADR 0006).

---

### Subscriptions Pending Queue

File: `src/components/subscriptions/SubscriptionsView.tsx` (+ tabs/toolbar/table)
Last updated: 2026-07-12

| Property | Class |
| --- | --- |
| Background | `bg-surface-container-lowest` |
| Border | `border border-outline-variant` |
| Border radius | `rounded-xl` |
| Title | `text-headline-sm font-display text-on-surface` |
| Active tab | `border-b-2 border-primary … font-bold text-primary` |
| Stub tab | `cursor-not-allowed text-on-surface-variant/60` |
| Toolbar bar | `border-b border-outline-variant bg-surface-container-low/30 px-6 py-4` |
| AI pass / warn / fail | `text-status-active` / `text-status-pending-approval` / `text-status-rejected` |
| View control | plain `Link` + `buttonVariants({ variant: "ghost", size: "icon-sm" })` |
| Shadow | none |

**Pattern notes:** Live `GET /subscriptions/pending` via `SubscriptionsListContainer`. Client `q` + `?state=loading|empty`. View/row → `/subscriptions/[id]`. No table mutations. No KPI strip.

---

### Subscription Receipt Review

File: `src/components/subscriptions/SubscriptionDetailView.tsx`
Last updated: 2026-07-12

| Property | Class |
| --- | --- |
| Layout | two column on `lg`: receipt image + metadata / AI / actions |
| Cards | `rounded-xl border border-outline-variant bg-surface-container-lowest` |
| AI pass well | `border-status-active/30 bg-status-active-bg text-status-active` |
| AI fail well | `border-status-rejected/30 bg-status-rejected-bg text-status-rejected` |
| Approve | solid status-active button |
| Reject | outline status-rejected |
| Suspend | outline status-suspended |

**Pattern notes:** Signed receipt URL only (`<img>`). AI panel from Nest `ReceiptVerificationResult` v1. Approve/Suspend use `AlertDialog`. Reject uses dialog + Zod reason. PostHog `admin_subscription_reviewed` on success, then back to queue.

---

### Student Detail + Device Bindings

File: `src/components/students/StudentDetailView.tsx`
Last updated: 2026-07-12

| Property | Class |
| --- | --- |
| Cards | `rounded-xl border border-outline-variant bg-surface-container-lowest` |
| Device card | `rounded-lg border border-outline-variant p-4` |
| Empty slot | `border-dashed border-outline-variant … italic` |
| Reset all | `border-error text-error hover:bg-error hover:text-on-error` |
| Single reset | ghost icon, `text-error hover:bg-error-container` |

**Pattern notes:** Profile summary + two device slots (web/mobile). Timestamps only (no hash). Destructive resets use `AlertDialog`. PostHog `admin_device_reset` on success.

---

### Plans table + create/edit dialog

File: `src/components/plans/PlansView.tsx` (+ `PlansTable.tsx`, `PlanFormDialog.tsx`)
Last updated: 2026-07-12

| Property | Class |
| --- | --- |
| Background | `bg-surface-container-lowest` |
| Border | `border border-outline-variant` |
| Border radius | `rounded-xl` (panel); dialog uses shadcn `Dialog` |
| Text — primary | `text-on-surface` / plan name `font-semibold` |
| Text — secondary | `text-on-surface-variant` |
| Table header | `text-label-md uppercase tracking-wider text-on-surface-variant` |
| Header spacing | `CardHeader` `px-6 py-4`; body `CardContent` `px-0` |
| Page gap | `flex flex-col gap-8` |
| Inactive row | `opacity-60` |
| Footer strip | `border-t border-outline-variant bg-surface-container-low px-6 py-4` |
| Form layout | `FieldGroup` + `Field` + `FieldLabel` / `FieldError` (no `space-y-*`) |
| Active control | shadcn `Switch` (row + edit dialog) |
| Shadow | none |
| Accent usage | primary Button for Add / Save; Phosphor icons with `data-icon` |

**Pattern notes:** Match Students Level 1 table card. Live Nest only (`AdminPlan`). Price via `formatPlanPrice` (major units in form). Create omits `isActive`; edit includes it. No KPI bento, subscriber column, or PostHog events this slice.

---

### Content tree + lesson panel

File: `src/components/content/ContentView.tsx` (+ `ContentTree.tsx`, `ContentLessonPanel.tsx`)
Last updated: 2026-07-12

| Property | Class |
| --- | --- |
| Outer card | `rounded-xl border border-outline-variant bg-surface-container-lowest` |
| Tree unit card | same Level 1 border/radius; accordion via Collapsible |
| Guide line | `before:… before:w-px before:bg-outline-variant` on chapter stack |
| Lesson row | `rounded-lg border … hover:border-primary`; selected `ring-1 ring-primary/30` |
| Panel | sibling Level 1 card `p-6` |
| Page gap | `flex flex-col gap-8`; grid `lg:grid-cols-12` (8 + 4) |
| Publish | shadcn `Switch` size `sm` + label |
| Arabic titles | `dir="rtl"` when Arabic script detected |
| Shadow | none |

**Pattern notes:** Live Nest admin tree only. Region on unit row. `accessLevel` badges on lessons. No Media Vault this slice. Search toolbar matches subscriptions debounce pattern.

---

### Announcements composer + list

File: `src/components/announcements/AnnouncementsView.tsx`
Last updated: 2026-07-13

| Property | Class |
| --- | --- |
| Layout | `grid … lg:grid-cols-12` (7 composer + 5 list) |
| Panels | Level 1 `rounded-xl border border-outline-variant bg-surface-container-lowest` |
| Body field | `Textarea` with `dir="rtl"` `lang="ar"` |
| Publish | shadcn `Switch` size `sm` (separate from Save) |
| Image dropzone | dashed border + `Progress` during XHR PUT |
| List badges | region short labels + Published/Draft `Badge` |
| Shadow | none |

**Pattern notes:** Live Nest only. No pin, priority, delete, or signed image preview. Create before image upload. Selection via `?id=`.

### Support inbox + thread

File: `src/components/support/SupportView.tsx`
Last updated: 2026-07-13

| Property | Class |
| --- | --- |
| Layout | Split pane `md:flex-row` inside Level 1 card; list `md:w-1/3` + thread `flex-1` |
| Panel | `rounded-xl border border-outline-variant bg-surface-container-lowest` |
| Selected row | `border-s-4 border-s-primary bg-surface-container-low` |
| Student bubble | `bg-surface-container-highest rounded-2xl` + RTL when Arabic |
| Admin bubble | `bg-primary text-on-primary rounded-2xl` |
| Filter chips | `rounded-full` active `bg-primary text-on-primary` |
| Avatar | Initials on `rounded-full bg-surface-variant` (no CDN photos) |
| Shadow | none |

**Pattern notes:** Nest-shaped mock only. No KPI strip, channel, priority, or attach/emoji. Selection via `?id=`; filters `status`/`q`; auto-resync id when filtered out. Composer disabled with mock vs closed helper text.

