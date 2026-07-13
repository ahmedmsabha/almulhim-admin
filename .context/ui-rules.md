# UI Rules — Mulhim Admin Web

Rules for building the Mulhim Admin dashboard UI. Visual source of truth: Kinetic Enterprise design system + stitch Admin SaaS screens (dashboard, subscriptions, content, students). Tokens live in `ui-tokens.md`.

---

## Fonts

Import in root layout via `next/font/google`:

- **Hanken Grotesk** → display / headlines (`--font-display`)
- **Inter** → body / UI chrome (`--font-sans`)
- **JetBrains Mono** → labels, IDs, status badges (`--font-mono`)

Never use system fonts as the primary stack. Never use Inter for page titles when Hanken Grotesk is specified.

---

## Layout Shell

- Fixed left sidebar: 280px, white / Level 1 surface, full viewport height
- Top bar: 64px, persistent, search + profile utilities
- Main content: fluid, 12-column mental model, 24px gutter, 32px container padding (16px mobile)
- Mobile: sidebar → drawer; do not switch to a top-only nav as the primary pattern

All authenticated pages use this shell. Login is outside the shell.

---

## Sidebar Navigation

Items (exact order):

```
Dashboard
Students
Plans
Subscriptions
Content
Announcements
Support
```

- Active item: primary indigo text/background treatment from tokens
- Inactive: `on-surface-variant`
- Brand mark / “Admin Central” (or Mulhim Admin) at top of sidebar
- No student-web marketing nav patterns

---

## Direction & Language

- Shell (sidebar, top bar, chrome labels): LTR English
- Lesson titles, announcement bodies, support messages may be Arabic → `dir="rtl"` on those content nodes
- Arabic body line-height uses `arabic-body` token (taller than English body)

---

## Cards & Surfaces

- Default card: Level 1 — white, `1px` border `#E2E8F0`, radius `lg` (8px), **no drop shadow**
- KPI cards: `headline-sm` value, `label-md` uppercase title, optional 7-day sparkline (primary, 2px stroke)
- Never use colored card backgrounds for primary content panels — color belongs in badges, charts, and text

---

## Typography Hierarchy

- Page title: `display-lg` or `headline-md` (Hanken Grotesk)
- Section title: `headline-sm`
- Table / body: `body-md`
- Helper / meta: `body-sm` + `on-surface-variant`
- Status / IDs: `label-md` (JetBrains Mono, uppercase where badges)

---

## Data Tables

Core pattern for Students, Subscriptions, Plans, Support lists.

- Fixed header on scroll
- Row height ~48px
- No zebra striping — white rows, `1px` border between rows
- Header: uppercase `label-md` / muted
- Hover row: `surface-container-low`
- Row actions: icon buttons or compact text buttons aligned end
- Empty state required when zero rows

---

## Status Badges

- Always pills (`rounded-full`)
- Use semantic status colors from `ui-tokens.md`
- Uppercase `label-md`
- Do not reuse badge styles for primary buttons

---

## Buttons

**Primary**

- Background: `primary` / `primary-container`
- Text: `on-primary`
- Radius: `md` (4px) for controls; keep soft, not pill

**Secondary**

- White + border `border` / `outline-variant`
- Text: `on-surface`

**Destructive**

- Error / rejected semantic colors for reject / delete / reset-all confirmations

---

## Forms

- Labels above fields (`body-sm`, slate/muted)
- Input: white, 1px `#E2E8F0`, radius `md`, focus ring 2px indigo (`primary`)
- Prefer react-hook-form + Zod resolvers
- Inline validation errors under fields — never silent failures

---

## Content Tree

- Nested accordion / tree for Unit → Chapter → Lesson
- Parent: slightly bolder; chevron rotates 90° on expand
- Indent 20px per level
- Vertical guide line 1px `#E2E8F0`
- Publish / region / lock controls visible without hunting through menus

---

## Support Inbox

- Split pane: list left, thread right
- Arabic messages: `dir="rtl"` + right align
- English: LTR
- Message surfaces: Level 1

---

## Subscriptions Queue

- Default tab / filter: **Pending** (primary teacher workload)
- Columns include: student, plan, submitted date, status badge, AI verification result, actions
- Receipt opens in modal or dedicated panel via signed URL — never embed permanent public receipt URLs

---

## Loading & Empty

- First load: skeletons matching final layout
- Refetch: keep previous data; subtle indicator
- Empty: short muted copy + optional icon; one clear CTA when relevant

---

## Modals

- Backdrop: blur + ~25% opacity
- Dialog: white, strong border, Level 2 elevation
- Confirm destructive actions (reject, suspend, reset devices)

---

## Do Not

- Top-navbar-only layout (JobPilot pattern) — this app is sidebar-first
- Purple-on-white generic AI aesthetic unrelated to Kinetic tokens
- Cards in a marketing hero (there is no marketing hero in Admin)
- Pill clusters of unrelated filters that obscure the pending queue
- Hardcoded hex in components — use token utilities
