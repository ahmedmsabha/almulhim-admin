# ADR 0012 — Announcements UI + CRUD

**Status**: In Progress  
**Date**: 2026-07-13  
**Feature**: Announcements UI + CRUD (scope #14 / build-plan step 13)

## Context

`/announcements` is a placeholder. Nest already exposes admin announcement CRUD, publish/unpublish, and image upload under `/announcements/admin/*`. This is a **Wire** step: ship the Kinetic / stitch-aligned composer + list against live Nest contracts. Stitch pin, priority, delete, rich text, and reach/open-rate cards stay out (no Nest fields).

## Requirements

- **AC-1**: `/announcements` loads `AdminAnnouncementListResponse` from Nest `GET /announcements/admin` via TanStack Query (`adminKeys.announcements`).
- **AC-2**: Split layout: left composer, right list. List shows title, region badge, published/draft badge, date. Click row loads composer; **New** clears selection. Selection synced with `?id=`.
- **AC-3**: Composer fields: title, body (plain textarea `dir="rtl"`), region (`gaza` | `west_bank` | `both`). **Save** → `POST` (create) or `PATCH` (update) for those fields only. Zod + RHF; Nest `400` field errors mapped when present.
- **AC-4**: **Publish / Unpublish** via Nest `PATCH …/publish` and `…/unpublish` (Switch or equivalent). Create starts unpublished (`isPublished: false`). Update never flips publish state.
- **AC-5**: Image: after announcement exists, upload-url → **XMLHttpRequest** PUT (progress) → attach. MIME jpeg/png/webp; max **5MB** (Nest). Admin shows “Image attached” when `imageStorageKey` set (no signed preview URL). Replace = re-upload + attach (overwrites key).
- **AC-6**: Invalidate announcements list (and detail if used) on successful mutations. Loading / empty / error with retry. No mock fallback. No client PostHog (Nest captures publish server-side).
- **AC-7**: Out of scope: `/announcements/[id]` route, pin, priority, delete, rich text, stitch analytics cards, Nest admin `imageUrl`.

## Decisions

1. **Single page** `/announcements` with composer + list (stitch layout). No detail route this slice.

2. **Nest contracts** (Mulhim Backend `AdminAnnouncementsController`):

   | Action | Path |
   | --- | --- |
   | List all | `GET /announcements/admin` |
   | Get one | `GET /announcements/admin/:id` |
   | Create | `POST /announcements/admin` |
   | Update | `PATCH /announcements/admin/:id` |
   | Publish | `PATCH /announcements/admin/:id/publish` |
   | Unpublish | `PATCH /announcements/admin/:id/unpublish` |
   | Image upload-url | `POST /announcements/admin/:id/image-upload-url` |
   | Attach image | `PATCH /announcements/admin/:id/attach-image` |

   ```ts
   type AdminAnnouncementSummaryResponse = {
     id: string;
     title: string;
     body: string;
     region: "gaza" | "west_bank" | "both";
     imageStorageKey: string | null;
     isPublished: boolean;
     publishedAt: string | null;
     createdAt: string;
     updatedAt: string;
   };
   ```

   Create/update body: `title`, `body`, `region` (update partial, ≥1 field). Image upload-url: `contentType` enum. Attach: `storageKey`.

3. **Publish state**: boolean `isPublished` + dedicated endpoints (not a status enum; not pin).

4. **Image preview**: no Nest signed URL on admin DTO. Show attached indicator only. Local object URL for a just-picked file before upload is optional UX.

5. **Forms / query**: RHF + Zod (Plans/Content). `adminKeys.announcements.list()` / `.detail(id)`. List row fills composer (full body on summary).

6. **Analytics**: Nest `captureAnnouncementPublished` only. No client PostHog this slice.

7. **Stitch cuts**: pin, priority, delete, rich-text toolbar, TOTAL REACH / OPEN RATE cards.

## Feature design

| Concern | Choice |
| --- | --- |
| List | `GET /announcements/admin` |
| Create / update | `POST` / `PATCH` title+body+region |
| Publish | `PATCH …/publish` / `…/unpublish` |
| Image | upload-url → XHR PUT → attach |
| Selection | `?id=` |
| Auth | Existing `(gated)` + Bearer |
| Query keys | `adminKeys.announcements` |
| UI entry | `AnnouncementsContainer` on `/announcements` |

## Build plan

1. [x] Types + parse + fetch + form schema + Query hooks + mutations (CRUD, publish, image XHR). — AC-1, AC-3, AC-4, AC-5, AC-6
2. [x] Composer + list UI (skeleton, empty, error); `?id=` sync; Publish switch; image dropzone. — AC-2, AC-3, AC-4, AC-5, AC-6
3. [x] Wire `/announcements` page + announcements `AGENTS.md` + ui-registry + scope/tracker milestones. — AC-1…AC-7

## Consequences

- Admin cannot preview announcement images until Nest adds a signed `imageUrl` to the admin DTO.
- No hard delete for announcements (Nest has none).
- Product overview `/announcements/[id]` remains unimplemented by choice.
