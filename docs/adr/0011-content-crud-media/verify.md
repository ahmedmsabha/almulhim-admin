# Verify — ADR 0011 Content CRUD + Media Upload

Run against live Nest with admin session. Restart Nest after deploying media `DELETE` routes.

## Hierarchy

- [ ] **AC-1a**: New Unit from toolbar creates a unit; appears in tree after invalidate; sortOrder appended.
- [ ] **AC-1b**: Edit unit (title / region / description / sortOrder) persists via PATCH.
- [ ] **AC-1c**: Add chapter under unit; add lesson under chapter; create selects new `lessonId` in URL.
- [ ] **AC-1d**: Edit chapter / lesson metadata persists; no hierarchy delete controls.

## Media

- [ ] **AC-2**: Add video (mp4 ≤ 1 GB) shows XHR progress then attaches; list updates.
- [ ] **AC-2b**: Add PDF (≤ 50 MB) same flow; reject wrong MIME/size client-side.
- [ ] **AC-3**: Edit video/PDF title and sortOrder (duration for video) via PATCH.
- [ ] **AC-4**: Delete video/PDF confirms with AlertDialog; Nest removes row (R2 best-effort); list updates.
- [ ] **AC-4b**: Replace = delete + re-upload works.

## Cache / analytics

- [ ] **AC-5**: Successful create/update/attach/delete refreshes tree and open lesson (no stale panel).
- [ ] **AC-6**: PostHog `admin_content_media_attached` / `admin_content_media_deleted` fire on success only (not on metadata PATCH).
- [ ] **AC-7**: No Media Vault, nested content routes, or signed playback in this slice.
