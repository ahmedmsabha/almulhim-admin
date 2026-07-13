<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Build approach

Facade — clickable screens on placeholder data first, then wire the real backend behind interfaces that already exist.

## Agent skills

- [shadcn](.agents/skills/shadcn/) — `shadcn/ui`, UI primitives and composition for this app (base-lyra, Phosphor)
- [imprint](.agents/skills/imprint/) — capture UI patterns into `.context/ui-registry.md` after building components

## Context files

- [src/components/dashboard/AGENTS.md](src/components/dashboard/AGENTS.md) — Analytics Dashboard UI + live `DashboardStats` fetch (ADR 0003 / 0004)
- [src/components/students/AGENTS.md](src/components/students/AGENTS.md) — Students list + detail/devices (ADR 0005 / 0006)
- [src/components/plans/AGENTS.md](src/components/plans/AGENTS.md) — Plans UI + CRUD (ADR 0007)
- [src/components/subscriptions/AGENTS.md](src/components/subscriptions/AGENTS.md) — Subscriptions queue mock (ADR 0008)
- [src/components/content/AGENTS.md](src/components/content/AGENTS.md) — Content tree wire + CRUD/media (ADR 0010 / 0011)
- [src/components/announcements/AGENTS.md](src/components/announcements/AGENTS.md) — Announcements composer + list CRUD (ADR 0012)
- [src/components/support/AGENTS.md](src/components/support/AGENTS.md) — Support Inbox mock + live wire (ADR 0013 / 0014)
- Design / tokens live under `.context/` (`ui-registry.md`, `ui-rules.md`, `ui-tokens.md`); run `/audit` to fold a fuller root AGENTS.md from those.
