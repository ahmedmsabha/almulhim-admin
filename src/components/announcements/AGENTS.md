# Announcements area

Conventions for Announcements UI + CRUD (live Nest wire, ADR 0012).

## File pointers

- Page: `src/app/(dashboard)/(gated)/announcements/page.tsx` (RSC → `AnnouncementsContainer`)
- UI: `src/components/announcements/`
- Fetch / hooks: `src/lib/announcements/`
- Query keys: `adminKeys.announcements.list()` / `.detail(id)`
- Visual registry: `.context/ui-registry.md`
- ADR: `docs/adr/0012-announcements-ui-crud/`

## Conventions

- Render from Nest `AdminAnnouncementSummary` / list response. Fields: title, body, region (`gaza` | `west_bank` | `both`), `imageStorageKey`, `isPublished`, timestamps.
- Live path only: TanStack Query + Clerk `getToken` + `apiFetch`. No mock fallback. No client PostHog (Nest captures publish).
- Single page: left composer, right list. Selection via `?id=`. New clears the query.
- Save = create (`POST`) or update (`PATCH`) title/body/region only. Publish/Unpublish = dedicated Nest endpoints via Switch.
- Image: after create, upload-url → XMLHttpRequest PUT (progress) → attach. Show “Image attached” when `imageStorageKey` is set (no signed admin preview). Limits: jpeg/png/webp ≤ 5 MB.
- Forms: Zod + RHF. Nest 400 field errors via `nestFieldErrorsFromApiError`.
- Region labels: reuse `CONTENT_REGION_LABELS` from content types (includes `both`).
- Page stays a Server Component. Container and interactive pieces are `"use client"`.
- Icons: Phosphor. Fetch errors stay on the page with retry.

## Out of scope here

- `/announcements/[id]` route
- Pin, priority, rich text, delete
- Stitch reach / open-rate cards
- Nest admin signed `imageUrl`
