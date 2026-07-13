---
name: Kinetic Enterprise
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#464555'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#7e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  arabic-body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 28px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  sidebar_width: 280px
  topbar_height: 64px
  gutter: 24px
  container_padding: 32px
  stack_sm: 8px
  stack_md: 16px
  stack_lg: 24px
---

## Brand & Style
The design system is engineered for high-density SaaS administration, prioritizing clarity, efficiency, and professional trust. The aesthetic leans into **Corporate Modernism** with a focus on functional minimalism. It utilizes a structured hierarchy to handle complex data-dense environments without overwhelming the user. 

The emotional response is one of "calm control"—achieved through generous whitespace within data cells, a refined neutral palette, and precise geometric shapes. The system must feel robust enough for enterprise resource management while remaining agile enough for a modern web application.

## Colors
The palette is anchored by a neutral background (`#F8FAFC`) to reduce eye strain during prolonged usage. The primary Indigo (`#4F46E5`) is reserved strictly for primary actions and active navigation states.

**Semantic Mapping:**
- **Active:** Emerald Green for success and "live" states.
- **Rejected:** Rose Red for critical errors or denials.
- **Suspended:** Vivid Orange for temporary account holds.
- **Pending Approval:** Deep Amber for states requiring admin intervention.
- **Pending Review:** Pale Yellow for internal workflow stages.
- **Expired/Free:** Slate and Gray tones for inactive or low-priority status indicators.

## Typography
This design system employs a multi-font strategy to balance character and utility. **Hanken Grotesk** provides a sharp, contemporary feel for titles. **Inter** is used for all body and UI chrome due to its exceptional legibility and robust support for mixed-language environments.

**Bi-directional Support:**
While the UI shell (navigation, sidebars, headers) remains LTR English, content areas (lesson titles, support chat) must support RTL Arabic. For Arabic strings, the line-height is increased by 15-20% relative to English counterparts to accommodate character ascenders and descenders without clipping.

**Technical Data:**
**JetBrains Mono** is used for small labels, IDs, and status badges to give a precise, systematic appearance to data points.

## Layout & Spacing
The layout follows a **Fixed-Fluid hybrid model**. 
- **Sidebar:** A fixed 280px left-hand navigation allows for deep nesting of admin categories.
- **Top Bar:** A 64px persistent utility bar for global search and profile management.
- **Main Content:** A fluid area using a 12-column grid with a 24px gutter. 

On mobile, the sidebar collapses into a hidden drawer, and the `container_padding` reduces from 32px to 16px. Nested tree structures should use a consistent 20px indentation per level to maintain visual hierarchy without wasting horizontal real estate.

## Elevation & Depth
The design system utilizes **Tonal Layering** supplemented by **Low-Contrast Outlines**.
- **Level 0 (Background):** `#F8FAFC`.
- **Level 1 (Cards/Sidebar):** White (`#FFFFFF`) with a 1px border of `#E2E8F0`. No shadow.
- **Level 2 (Hover/Active Popovers):** White with a soft ambient shadow: `0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)`.
- **Modals:** High-contrast 1px border with a deep 25% opacity backdrop blur (glassmorphism) on the overlay to maintain context of the underlying data.

## Shapes
A **Soft** shape language is applied to maintain professional rigor. Standard UI elements (buttons, inputs) use a 0.25rem (4px) radius. Larger containers like KPI cards and data tables use 0.5rem (8px). 

Status badges use a "Max" roundedness (pill-shape) to distinguish them from interactive buttons and clickable tags.

## Components

### Data Tables
Tables are the core of the dashboard. They must feature:
- Fixed headers on scroll.
- Condensed row heights (48px) with `body-md` typography.
- Status badges using `label-md` in uppercase, with low-opacity background tints of their semantic color and high-contrast text.

### KPI Cards
Cards should include a `headline-sm` value, a `label-md` title, and a simplified **Sparkline** (primary color, 2px stroke width) representing a 7-day trend.

### Nested Accordions
Used for lesson hierarchies. Parent nodes should use a subtle bold weight and a chevron-right icon that rotates 90 degrees on expansion. Nested children are indented 20px and connected by a vertical "guide line" 1px wide in `#E2E8F0`.

### Inbox / Support Layout
A split-pane view. The left pane contains a list of message previews; the right pane is the active thread. In the active thread, Arabic text must be rendered with `direction: rtl` and right-alignment, while English remains left-aligned. Message bubbles use `Level 1` elevation.

### Input Fields
Inputs use a white background, 1px `#E2E8F0` border, and a 2px Indigo ring focus state. Labels are positioned above the field using `body-sm` in a Slate-600 color.