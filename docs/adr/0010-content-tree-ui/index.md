# ADR 0010 — Content Tree UI (Wire)

**Status**: In Progress  
**Date**: 2026-07-12  
**Feature**: Content Tree UI (scope #7 / build-plan step 11)

## Context

`/content` is still a placeholder. Scope originally said Mock; architect locked a **Wire** step instead: browse and publish against live Nest admin content APIs, with shared AI search via `POST /content/search`. Create/edit hierarchy and media upload stay in step 12. Visual reference: `almulhim-admin-web-desgin/content_management/` (accordion tree + right pane). Stitch Media Vault, Storage Usage, New Unit, and Deploy Changes stay out.

## Requirements

- **AC-1**: `/content` loads `AdminContentTreeResponse` from Nest `GET /content/admin/tree` via TanStack Query (`adminKeys.content.tree()`).
- **AC-2**: Nested Unit → Chapter → Lesson accordion; unit row shows Nest `region` (`gaza` | `west_bank` | `both`); lesson rows show `accessLevel` (`preview` | `subscriber_only`) and publish state.
- **AC-3**: Selecting a lesson sets URL `?lessonId=`; right panel loads `GET /content/admin/lessons/:id` (title, accessLevel, publish, video/pdf summaries). No signed media playback. Missing/404 lesson → not-found in panel; tree stays. No `lessonId` → “Select a lesson” empty state. Auto-expand ancestors when `lessonId` is present.
- **AC-4**: Publish switches on unit, chapter, and lesson (lesson mirrored in detail). Both lesson switches read the same Query cache. `PATCH .../publish` | `.../unpublish`. Optimistic Plans pattern; invalidate tree (+ open lesson) on success; revert + inline error on failure. No confirm. No invented cascade UI.
- **AC-5**: URL `q` drives search. Empty `q` → full tree, no search API. Non-empty → instant client substring fallback (normalized, no tashkeel) with ancestor preservation, then debounced (~450ms) `POST /content/search` replaces matches; ancestors preserved identically. On `503`/search failure keep fallback.
- **AC-6**: Loading / empty tree / error + retry from live Query only. No `?state=` mock preview. No create/edit/upload this step.
- **AC-7**: On successful **publish** only, PostHog `admin_content_published` with `{ entityType, entityId }` (distinct from Nest `lesson_published`).

## Decisions

1. **Wire immediately** (not mock-first). Nest search already shipped.

2. **Nest contracts** (Mulhim Backend):

   | Action | Path |
   | --- | --- |
   | Admin tree | `GET /content/admin/tree` |
   | Lesson detail | `GET /content/admin/lessons/:id` |
   | Publish / unpublish | `PATCH /content/admin/{units\|chapters\|lessons}/:id/{publish\|unpublish}` |
   | Shared search | `POST /content/search` |

   Types mirror `admin-content.response.ts` / `ContentSearchResponse`. Region on **unit** only. Lesson access is `accessLevel`, not a free/premium invent.

3. **Single page** `/content` with `?lessonId=` + `q`. No nested `/content/units/[id]` routes this step.

4. **Search**: client flattens tree to `{ id, title, type, orderIndex }[]`; Nest returns `{ matchingIds }`. Matching is not an access-control boundary.

5. **UI**: Kinetic Level 1 cards; skip stitch Media Vault / storage / New Unit / Deploy. Deferred controls stay out or disabled if shown as chrome.

6. **Query**: existing `adminKeys.content.*`. Optimistic `setQueryData` so tree + detail stay in sync.

7. **Analytics**: `admin_content_published` on publish success only.

8. **Packages**: add shadcn `collapsible` / `accordion` as needed. Phosphor icons. No sonner required (inline errors like Plans).

## Feature design

| Concern | Choice |
| --- | --- |
| Tree | `GET /content/admin/tree` |
| Detail | `GET /content/admin/lessons/:id` |
| Publish | dedicated publish/unpublish PATCHes |
| Search | `POST /content/search` + client fallback |
| Auth | Existing `(gated)` + Bearer |
| Query keys | `adminKeys.content.tree` / `.lesson(id)` |
| UI entry | `ContentContainer` on `/content` |
| Visual source | stitch tree; Nest fields only |

## Build plan

1. [x] Types + parse + fetch (tree, lesson, publish, search) + flatten/filter helpers + Query/mutation hooks. — AC-1, AC-3, AC-4, AC-5, AC-7
2. [x] Content UI: toolbar, tree, lesson panel, skeleton, error; wire `/content` page. — AC-1…AC-6
3. [x] PostHog publish capture + area AGENTS.md + ui-registry + progress tracker / scope. — AC-7

## Consequences

- Scope #7 / step 11 becomes Wire; step 12 owns CRUD + media.
- Admin uses shared `POST /content/search` (same as Student Web / Mobile).
- Stitch Media Vault is intentionally incomplete vs design HTML until step 12.
