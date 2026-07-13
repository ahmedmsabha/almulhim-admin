# Content area

Conventions for the live Content Tree + CRUD/media (ADR 0010 / 0011).

## File pointers

- Page: `src/app/(dashboard)/(gated)/content/page.tsx` (RSC → `ContentContainer`)
- UI: `src/components/content/` (tree, dialogs, lesson panel, `LessonMediaSection`)
- Fetch / hooks: `src/lib/content/` (`fetch-content`, parse, filter/flatten, Query hooks, publish, search, mutations, XHR PUT)
- Query keys: `adminKeys.content.all()` / `.tree()` / `.search(q)` / `.lesson(id)` / `.unit(id)` / `.chapter(id)`
- Visual registry: `.context/ui-registry.md`
- ADRs: `docs/adr/0010-content-tree-ui/`, `docs/adr/0011-content-crud-media/`

## Conventions

- Render from Nest admin DTOs (`AdminContentTreeResponse`, `AdminLessonDetail`). Region lives on **units** (`gaza` | `west_bank` | `both`). Lesson access is `accessLevel` (`preview` | `subscriber_only`).
- Live path only: TanStack Query + Clerk `getToken` + `apiFetch`. No mock fallback, no `?state=` preview.
- Hierarchy: create/update unit · chapter · lesson via dialogs on the single `/content` page. Auto-append `sortOrder` on create; editable on edit. No Nest hierarchy delete.
- Media: lesson panel lists videos/PDFs. Upload = Nest upload-url → **XMLHttpRequest** PUT with progress → attach. Metadata via PATCH. Delete via AlertDialog → Nest `DELETE` (R2 then DB on Nest). Replace file = delete + re-upload.
- Limits: video `video/mp4` ≤ 1 GB; PDF ≤ 50 MB (`upload-constants.ts`).
- URL: `?lessonId=` selects the detail panel; `q` drives search.
- Search: `useQuery` on `adminKeys.content.search(q)` (debounced). Instant normalized substring fallback uses the **live toolbar draft**; while LLM is in flight with fallback hits, show filtered tree; otherwise show tree search skeleton. On `503`/error keep fallback.
- Publish switches on unit, chapter, and lesson (lesson mirrored in detail). Optimistic `setQueryData`. PostHog `admin_content_published` on publish only. Media: `admin_content_media_attached` / `admin_content_media_deleted` with `{ mediaType, lessonId }`.
- Mutations invalidate tree (+ open lesson) and search keys. No optimistic hierarchy create.
- Page stays a Server Component. Container and interactive pieces are `"use client"`.
- Icons: Phosphor. Fetch errors stay on the page with retry. Forms: RHF + Zod (Plans pattern); Nest 400 field errors via `nestFieldErrorsFromApiError`.

## Out of scope here

- Nested `/content/units/[id]` routes
- Media Vault / storage usage chrome
- Unit / chapter / lesson hard delete
- Signed media playback URLs
