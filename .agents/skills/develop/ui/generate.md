# UI Source: generated

## Path B — No source: establish the system, then build (design-first)

This is case 4 from the guide: nothing was provided, so you establish the design system, then build to the bar. Design first, integrate second.

**Prefer a proven design skill when one is available.** If the project has a design skill installed (Anthropic's `frontend-design` on Claude Code, Codex's frontend skill) or a design MCP connected, use it to set the visual direction; that is the same craft that makes the chat app's output good. With none available, use a curated template as the agnostic seed (below). Either way, the token values land in CSS and the art direction lands in `design.md` (B2).

### B1 — Set the direction (template seed, or a proven design skill)

For the picker read only the frontmatter (lines 1–30) of each of `templates/stripe.md`, `templates/posthog.md`, `templates/nike.md`, `templates/supabase.md`, `templates/raycast.md`, not the full files. Read the full selected file in B2, after the user chooses.

Ask (as above) — question 1:
```
"What mood should this UI have?"
  - Dark & focused       → near-black, precise, technical (Raycast)
  - Light & professional → white/off-white, trustworthy (Stripe or Supabase)
  - Bold & editorial     → strong personality (PostHog or Nike)
  - Custom               → describe a style, brand, or paste a design.md URL
```

Then ask (as above) — question 2 (only for Light or Bold):
```
  Light: Stripe vs Supabase
  Bold:  PostHog vs Nike
  Dark:  auto-select Raycast
```

### B2 — Establish the system: token values to CSS, art direction to design.md

Whatever set the direction (a selected template, a design skill, a described style, or a `design.md` URL), split the result so nothing is duplicated:

**1. Write the token VALUES into the project's CSS** (`app/globals.css` / `src/styles/tokens.css`, plus tailwind config if used), per B3. This is the single source of truth for colors, typography, spacing, radius, shadows, and motion.
- **Template selected** → read the full template file, take its token values into the CSS token file (B3).
- **URL provided** → fetch, validate it has colors and typography, take its values into the CSS token file.
- **Style description** → generate the values (aesthetic guide below) into the CSS token file.

**2. Write `design.md` as ART DIRECTION only** — never a copy of the token values, those live in CSS:

```yaml
---
name: <style>-design-system
source: generated            # or template:<name> | url:<url> | skill:frontend-design
character: "<2 to 3 sentences: the visual personality and mood>"
tokens: "real values live in app/globals.css (and tailwind config); read them there, never duplicated here"
---

## Build mandate
You are a senior product designer. Every page in this system ships as a complete, professional product surface: brand, real product-specific copy, a considered layout with hierarchy, all states (empty, loading, error), supporting content, and a footer where the page warrants one. Maximalist, not bare minimum, the quality of a top product or the chat app. Never a lone form on an empty page. Full disqualifier list: the UI guide's bar.

## Character & direction
<what makes this system distinct: the mood, the personality, the one or two moves that define it>

## Composition patterns
<how pages are assembled here: app shell, section rhythm, how auth / landing / list / detail pages lay out>

## Component & usage rules (do's and don'ts)
<accent usage (primary actions only, never decoration), elevation (hairline borders vs shadows), spacing rhythm, button and card conventions>

## Responsive & accessibility direction
<any project-specific direction beyond the implementation defaults>
---
```

**Aesthetic guide** (for a described style; informs the token VALUES you write to CSS and the character you record):
- **Cyberpunk**: near-black canvas, neon cyan/magenta accent, 0 to 2px radius, mono font, dense spacing, fast motion (80ms), harsh easing
- **Brutalist**: pure black/white, 0px radius, thick borders, oversized type, zero motion
- **Glassmorphism**: frosted canvas, translucent surfaces, 16 to 24px radius, slow transitions (200 to 400ms), gentle spring
- **Notion-like**: off-white canvas, Georgia display + Inter UI, 3px radius, generous line-height, fast subtle motion (100ms)
- **Apple consumer**: white canvas, system font stack, 10 to 20px radius, spring motion (200 to 350ms)
- **Named brand**: use that brand's documented colors and fonts; substitute proprietary fonts (see font installation)

Fill every design.md section with real, specific direction. No placeholders, and no token value dumps (values live in CSS).

### B3 — Create CSS token file

Create `app/globals.css`, `src/styles/tokens.css`, or add to an existing globals file. Define CSS custom properties for:
- All colors (light): `--color-canvas`, `--color-surface`, `--color-ink`, `--color-body`, `--color-muted`, `--color-accent`, `--color-on-accent`, `--color-border`, `--color-success`, `--color-error`
- Icon sizes: `--icon-sm: 16px`, `--icon-md: 20px`, `--icon-lg: 24px`
- Typography: `--font-sans`, size scale (`--text-xs` through `--text-4xl`), weight scale
- Spacing: `--space-xxs` through `--space-section`
- Radius: `--radius-sm` through `--radius-full`
- Motion: `--duration-instant` through `--duration-slow`, `--ease-standard`, `--ease-out`, `--ease-spring`

Apply dark overrides via the detected strategy (`.dark {}` or `@media (prefers-color-scheme: dark)`); only override tokens that differ in dark mode. If Tailwind is in use, also extend `tailwind.config.ts` under `theme.extend` with all token values, wiring color tokens via `var(--color-*)` so dark mode works automatically.

---
