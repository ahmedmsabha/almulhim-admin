# Memory — Mulhim Admin Web Context Pack

Last updated: Thursday Jul 9, 2026 ~2:30 PM (UTC+3)

## What was built

Full Mulhim Admin Web context pack in `ContextFiles/AdminWeb/current/`:

- `project-overview.md` — admin product scope, pages, flows, in/out of scope
- `architecture.md` — Next.js 16 admin client of NestJS API; folder layout; auth/API invariants
- `ui-tokens.md` — Kinetic Enterprise tokens (indigo, Hanken Grotesk / Inter / JetBrains Mono)
- `ui-rules.md` — sidebar shell, tables, badges, RTL, no JobPilot top-nav pattern
- `ui-registry.md` — empty living registry with expected layout/shared components
- `code-standards.md` — Next.js / Server Actions / API client conventions
- `library-docs.md` — Clerk, TanStack Query, Zod, PostHog, explicit non-use of Prisma/R2
- `build-plan.md` — 17 steps across 9 phases (shell → auth → modules → harden)
- `progress-tracker.md` — all steps unchecked; next = 01 App Shell
- `ai-workflow-rules.md` — spec-driven scoping
- `AGENTS.md` + `CLAUDE.md` — agent entrypoints

Sources used: Backend `README.md`, platform `ARCHITECTURE-2.md`, stitch Kinetic Enterprise `DESIGN.md` + admin module requirements. Replaced JobPilot (InsForge/Adzuna) templates.

## Decisions made

- Admin Web is UI-only against existing Mulhim Backend — no Prisma/R2 in this app
- Design system = Kinetic Enterprise (sidebar SaaS), not JobPilot purple top-nav
- npm only; Clerk only; admin role gated via backend
- Context files live in `current/` ready to copy into `admin-web/context/` (+ root AGENTS/CLAUDE)

## Problems solved

- JobPilot context files in AdminWeb folder were the wrong product — rewritten for Mulhim Admin
- `/remember` skill is not in this folder; used backend skill at `almulhim-backend/.agents/skills/remember/SKILL.md` for save format

## Current state

- Context documentation complete for Admin Web
- **Primary Figma:** AlMulhim Admin Panel (`C9llNwGWfmvXRdTbZpHU9c`) — Kinetic variables + components + instance swaps on all 8 screens
- Scratch Figma (`3siUYTszCY3Etmf27nLDWF`) deprecated; do not edit
- No Admin Web application code implemented in this session

## Next session starts with

1. Review **user** Figma file Components page — https://www.figma.com/design/C9llNwGWfmvXRdTbZpHU9c/AlMulhim-Admin-Panel
2. Optional: `TicketStatusBadge` for Support; full DataTable migration on Subscriptions/Students tables
3. Copy `current/*` into Admin Web repo as `context/` + root AGENTS/CLAUDE
4. Scaffold Next.js and start build-plan **01 App Shell + Design Tokens** (map StatusBadge/KpiCard to shadcn)

## Open questions

- Dashboard aggregates: dedicated API vs compose list endpoints + PostHog (step 05)
- Chart library choice (e.g. Recharts)
- Final repo path: standalone vs `apps/admin-web` monorepo
- Whether to deep-clean HTML and re-capture, or implement UI from Figma as-is
