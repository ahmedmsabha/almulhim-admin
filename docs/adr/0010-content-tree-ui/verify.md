# Verify — Content Tree UI (Wire) · ADR 0010

## Steps

1. Sign in as admin → open `/content` → tree loads from Nest (AC-1). Loading skeleton then units or empty state.
2. Expand a unit/chapter → lessons show accessLevel + publish switch; unit row shows region (AC-2).
3. Click a lesson → URL has `?lessonId=` → right panel shows title, accessLevel, publish, videos/PDFs (or empty media lists). Refresh keeps selection (AC-3).
4. Open a bogus `?lessonId=` → not-found in panel; tree still visible (AC-3).
5. Toggle publish on unit, chapter, and lesson (tree + panel for lesson) → Nest updates; switches stay in sync; failure reverts with inline error (AC-4).
6. Type Arabic/partial `q` → instant filtered tree with ancestors; after ~450ms LLM may refine; empty `q` shows full tree; with AI off expect fallback only / 503 kept as fallback (AC-5).
7. Kill API or force error → error panel + Retry (AC-6).
8. Successful publish → PostHog event `admin_content_published` with `entityType` + `entityId`; unpublish does not fire (AC-7).

## Out of scope this verify

- Create/edit content, media upload, signed playback URLs.
