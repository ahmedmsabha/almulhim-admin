# UI Tokens — Mulhim Admin Web

Design tokens for the Mulhim Admin dashboard, extracted from the **Kinetic Enterprise** design system (stitch Admin SaaS panel). Use these exact values — never hardcode hex colors or raw Tailwind palette classes in feature components.

---

## How to Use

This project uses **Tailwind CSS v4**. Define tokens with `@theme` in `src/app/globals.css` (or `app/globals.css`).

```tsx
// Correct
className="bg-surface-container-lowest text-on-surface border-outline-variant"

// Also correct
style={{ color: "var(--color-on-surface)" }}

// Never
className="bg-[#f7f9fb] text-purple-600"
```

---

## globals.css — Token Definition

```css
@import "tailwindcss";

@theme {
  /* Fonts */
  --font-display: "Hanken Grotesk", sans-serif;
  --font-sans: "Inter", sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Surfaces */
  --color-background: #f7f9fb;
  --color-surface: #f7f9fb;
  --color-surface-dim: #d8dadc;
  --color-surface-bright: #f7f9fb;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #f2f4f6;
  --color-surface-container: #eceef0;
  --color-surface-container-high: #e6e8ea;
  --color-surface-container-highest: #e0e3e5;
  --color-surface-variant: #e0e3e5;

  /* Text / icons on surfaces */
  --color-on-surface: #191c1e;
  --color-on-surface-variant: #464555;
  --color-on-background: #191c1e;

  /* Inverse */
  --color-inverse-surface: #2d3133;
  --color-inverse-on-surface: #eff1f3;
  --color-inverse-primary: #c3c0ff;

  /* Outline */
  --color-outline: #777587;
  --color-outline-variant: #c7c4d8;
  --color-border: #e2e8f0;

  /* Primary — indigo */
  --color-primary: #3525cd;
  --color-primary-container: #4f46e5;
  --color-on-primary: #ffffff;
  --color-on-primary-container: #dad7ff;
  --color-surface-tint: #4d44e3;
  --color-primary-fixed: #e2dfff;
  --color-primary-fixed-dim: #c3c0ff;
  --color-on-primary-fixed: #0f0069;
  --color-on-primary-fixed-variant: #3323cc;

  /* Secondary */
  --color-secondary: #565e74;
  --color-on-secondary: #ffffff;
  --color-secondary-container: #dae2fd;
  --color-on-secondary-container: #5c647a;
  --color-secondary-fixed: #dae2fd;
  --color-secondary-fixed-dim: #bec6e0;
  --color-on-secondary-fixed: #131b2e;
  --color-on-secondary-fixed-variant: #3f465c;

  /* Tertiary */
  --color-tertiary: #7e3000;
  --color-on-tertiary: #ffffff;
  --color-tertiary-container: #a44100;
  --color-on-tertiary-container: #ffd2be;

  /* Error */
  --color-error: #ba1a1a;
  --color-on-error: #ffffff;
  --color-error-container: #ffdad6;
  --color-on-error-container: #93000a;

  /* Semantic status (admin domain) */
  --color-status-active: #059669;
  --color-status-active-bg: #ecfdf5;
  --color-status-rejected: #e11d48;
  --color-status-rejected-bg: #fff1f2;
  --color-status-suspended: #ea580c;
  --color-status-suspended-bg: #fff7ed;
  --color-status-pending-approval: #d97706;
  --color-status-pending-approval-bg: #fffbeb;
  --color-status-pending-review: #ca8a04;
  --color-status-pending-review-bg: #fefce8;
  --color-status-expired: #64748b;
  --color-status-expired-bg: #f1f5f9;
  --color-status-free: #94a3b8;
  --color-status-free-bg: #f8fafc;

  /* Layout */
  --spacing-sidebar: 280px;
  --spacing-topbar: 64px;
  --spacing-gutter: 24px;
  --spacing-container: 32px;
  --spacing-stack-sm: 8px;
  --spacing-stack-md: 16px;
  --spacing-stack-lg: 24px;

  /* Radius */
  --radius-sm: 0.125rem;
  --radius-md: 0.25rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-full: 9999px;
}
```

Alternate background note from design copy: `#F8FAFC` may appear in prose; prefer `#f7f9fb` from the token export for implementation consistency.

---

## Typography Tokens

| Token | Family | Size | Weight | Line height | Tracking |
| --- | --- | --- | --- | --- | --- |
| `display-lg` | Hanken Grotesk | 36px | 700 | 44px | -0.02em |
| `headline-md` | Hanken Grotesk | 24px | 600 | 32px | -0.01em |
| `headline-sm` | Hanken Grotesk | 20px | 600 | 28px | — |
| `body-lg` | Inter | 16px | 400 | 24px | — |
| `body-md` | Inter | 14px | 400 | 20px | — |
| `body-sm` | Inter | 13px | 400 | 18px | — |
| `label-md` | JetBrains Mono | 12px | 500 | 16px | 0.05em |
| `arabic-body` | Inter | 16px | 400 | 28px | — |

Load fonts in root layout via `next/font/google` (Hanken Grotesk, Inter, JetBrains Mono).

---

## Elevation

| Level | Use | Treatment |
| --- | --- | --- |
| 0 | Page background | `#f7f9fb` |
| 1 | Cards, sidebar, tables | White + `1px` `#E2E8F0` border — **no shadow** |
| 2 | Hover / popovers | Soft shadow `0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)` |
| Modal | Dialogs | High-contrast border + 25% opacity backdrop blur |

---

## Status Badge Mapping

| Status | Text | Background |
| --- | --- | --- |
| active | `--color-status-active` | `--color-status-active-bg` |
| rejected | `--color-status-rejected` | `--color-status-rejected-bg` |
| suspended | `--color-status-suspended` | `--color-status-suspended-bg` |
| pending_approval | `--color-status-pending-approval` | `--color-status-pending-approval-bg` |
| pending_review | `--color-status-pending-review` | `--color-status-pending-review-bg` |
| expired | `--color-status-expired` | `--color-status-expired-bg` |
| free | `--color-status-free` | `--color-status-free-bg` |

Badges: pill (`rounded-full`), `label-md`, uppercase.

---

## Spacing Reference

- Sidebar width: 280px
- Top bar height: 64px
- Main container padding: 32px (16px on mobile)
- Gutter: 24px
- Content tree indent per level: 20px
- Table row height: 48px
