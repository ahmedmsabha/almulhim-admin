# ADR 0011 — Content CRUD + Media Upload

**Status**: In Progress  
**Date**: 2026-07-13  
**Feature**: Content CRUD + Media Upload (scope #13 / build-plan step 12)

## Context

Step 11 (ADR 0010) wired browse, search, and publish on `/content`. This step adds hierarchy create/update and lesson media upload/update/delete against Nest admin content APIs. Nest previously had no media delete; this slice adds `DELETE` for videos and PDFs in the Mulhim Backend first, then Admin Web.

## Requirements

- **AC-1**: Create/update **unit**, **chapter**, and **lesson** via Nest admin POST/PATCH; stay on single `/content` (dialogs from tree/toolbar). Auto-append `sortOrder` on create; editable on edit.
- **AC-2**: Lesson panel lists **videos[]** and **pdfs[]** (1–2 videos, many PDFs typical). Add video/PDF via Nest upload-url → **XMLHttpRequest** PUT (progress) → attach. Client validates MIME/size before upload-url.
- **AC-3**: Edit media metadata via Nest `PATCH` (title, sortOrder; duration for video). Replace file = delete + re-upload (no in-place byte replace).
- **AC-4**: Delete video/PDF with AlertDialog confirm → Nest `DELETE`. Nest: attempt R2 delete first, log on failure, **always** delete DB row (source of truth).
- **AC-5**: Invalidate `adminKeys.content.tree()` (+ open lesson) on successful mutations. No optimistic hierarchy create.
- **AC-6**: PostHog `admin_content_media_attached` / `admin_content_media_deleted` with `{ mediaType, lessonId }` on success only. No new events for hierarchy CRUD or metadata PATCH.
- **AC-7**: Out of scope: nested `/content/units/[id]` routes, Media Vault / storage chrome, unit/chapter/lesson delete, signed playback URLs.

## Decisions

1. **Single page + dialogs** for hierarchy; media on lesson detail panel (ADR 0010 surface).

2. **Nest contracts** (Mulhim Backend `AdminContentController`):

   | Action | Path |
   | --- | --- |
   | Create unit | `POST /content/admin/units` |
   | Update unit | `PATCH /content/admin/units/:id` |
   | Create chapter | `POST /content/admin/units/:unitId/chapters` |
   | Update chapter | `PATCH /content/admin/chapters/:id` |
   | Create lesson | `POST /content/admin/chapters/:chapterId/lessons` |
   | Update lesson | `PATCH /content/admin/lessons/:id` |
   | Video upload-url | `POST /content/admin/lessons/:lessonId/videos/upload-url` |
   | Attach video | `POST /content/admin/lessons/:lessonId/videos` |
   | Update video | `PATCH /content/admin/videos/:id` |
   | Delete video | `DELETE /content/admin/videos/:id` → `{ deleted: true, id }` |
   | PDF upload-url | `POST /content/admin/lessons/:lessonId/pdfs/upload-url` |
   | Attach PDF | `POST /content/admin/lessons/:lessonId/pdfs` |
   | Update PDF | `PATCH /content/admin/pdfs/:id` |
   | Delete PDF | `DELETE /content/admin/pdfs/:id` → `{ deleted: true, id }` |

   Limits: video `video/mp4` ≤ 1 GB; PDF ≤ 50 MB (Nest constants). Upload-url + attach stay on `apiFetch`; **only** the raw presigned PUT uses `XMLHttpRequest` + `xhr.upload.onprogress`.

3. **R2 delete ordering**: R2 `deleteObject` first (best-effort); on failure log and continue; always delete Prisma row so Admin never keeps orphaned DB pointers.

4. **Forms**: RHF + Zod (Plans pattern). Toolbar New Unit; tree row Add Chapter / Add Lesson + Edit.

5. **Delete UX**: AlertDialog (device-reset pattern). No confirm for attach or metadata PATCH.

6. **Analytics**: attach + delete PostHog only (see AC-6). Publish remains ADR 0010.

## Feature design

| Concern | Choice |
| --- | --- |
| Hierarchy | Dialogs on `/content` |
| Media | Lesson panel list + upload progress + edit + confirm delete |
| Upload PUT | XMLHttpRequest progress |
| Nest delete | R2 then DB always |
| Query | Invalidate tree + lesson |
| Auth | Existing `(gated)` + Bearer |

## Build plan

1. [x] Nest `DELETE` video/pdf + tests (R2 then DB).
2. [x] Admin types/fetch/hooks (CRUD, upload-url, XHR PUT, attach, media PATCH/DELETE).
3. [x] Hierarchy dialogs + tree/toolbar actions.
4. [x] Lesson panel media UI + PostHog + docs (AGENTS, registry, scope, tracker).

## Consequences

- Backend must deploy media DELETE before Admin delete UI works in production.
- Stitch Media Vault remains intentionally incomplete.
- Hierarchy hard-delete stays a future Nest + Admin slice if needed.
