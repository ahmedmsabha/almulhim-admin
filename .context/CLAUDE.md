## Mulhim Admin Web — Application Building Context

Read the following files in order before implementing
or making any architectural decision:

1. `context/project-overview.md` — product definition,
   admin flows, and scope
2. `context/architecture.md` — system structure,
   API boundaries, and invariants
3. `context/ui-tokens.md` — Kinetic Enterprise colors,
   typography, spacing
4. `context/ui-rules.md` — layout shell, tables, badges,
   forms, RTL
5. `context/ui-registry.md` — existing components to reuse
6. `context/code-standards.md` — implementation rules
7. `context/library-docs.md` — Clerk, Query, Zod, PostHog
8. `context/ai-workflow-rules.md` — scoping and delivery
9. `context/build-plan.md` — stepped build plan
10. `context/progress-tracker.md` — current phase and next steps

Also follow `AGENTS.md` at the app root.

Update `context/progress-tracker.md` after each
meaningful implementation change.

If implementation changes architecture, scope, UI patterns,
or standards, update the relevant context file before continuing.

Cross-system references (not substitutes for Admin context):

- Mulhim Backend README — admin API routes and domain rules
- Platform ARCHITECTURE.md — four-app system overview
