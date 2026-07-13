# AI Workflow Rules — Mulhim Admin Web

## Approach

Build this Admin Web app incrementally using a spec-driven workflow. Context files define what to build, how to build it, and current progress. Always implement against these specs — do not infer product behavior from JobPilot templates or generic admin dashboards.

Primary specs:

1. `project-overview.md`
2. `architecture.md`
3. `ui-tokens.md` + `ui-rules.md` + `ui-registry.md`
4. `code-standards.md`
5. `library-docs.md`
6. `build-plan.md`
7. `progress-tracker.md`

Cross-system truth for API and domain rules: Mulhim Backend README + platform `ARCHITECTURE-2.md`.

## Scoping Rules

- Work on one build-plan step at a time
- Prefer small, verifiable increments
- Do not combine unrelated boundaries in one step (e.g. Content upload + Support inbox)

## When to Split Work

Split a step if it combines:

- Shell/layout changes and domain API wiring
- Multiple unrelated admin modules (e.g. Plans + Support)
- UI redesign and new business behavior not in context files

If a change cannot be verified end to end quickly, the scope is too broad — split it.

## Handling Missing Requirements

- Do not invent product behavior not defined in context files or the Backend README
- If ambiguous, resolve in the relevant context file before implementing
- If missing, add an open question in `progress-tracker.md` before continuing

## Protected Files

Do not modify unless explicitly instructed:

- `components/ui/*` shadcn primitives (unless adding a shadcn component via CLI)
- Third-party library internals
- Backend repository code from an Admin Web-only task

## MCP / Docs

- Use Context7 for Next.js, Clerk, TanStack Query, Zod, PostHog, Tailwind
- Prefer MCP over memory for fast-moving libraries

## Keeping Docs in Sync

Update the relevant context file when implementation changes:

- Architecture or API usage → `architecture.md` / `library-docs.md`
- Visual patterns → `ui-rules.md` / `ui-tokens.md` / `ui-registry.md`
- Conventions → `code-standards.md`
- Scope → `project-overview.md`
- Completion → `progress-tracker.md`

## Before Moving to the Next Unit

1. Current unit works end to end within its defined scope
2. No invariant in `architecture.md` was violated
3. `progress-tracker.md` reflects completed work
4. `npm run build` passes
