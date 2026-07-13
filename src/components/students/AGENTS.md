# Students area

Conventions for the Students directory and student detail (devices) wire.

## File pointers

- List page: `src/app/(dashboard)/(gated)/students/page.tsx` (RSC; live list or `?state=` preview)
- Detail page: `src/app/(dashboard)/(gated)/students/[userId]/page.tsx`
- Containers: `StudentsListContainer`, `StudentDetailContainer`
- UI: `src/components/students/`
- Students fetch: `src/lib/students/fetch-students.ts`, hooks, `parse-students.ts`, `types.ts`
- Devices fetch: `src/lib/devices/` (list + reset mutations)
- Preview fixtures: `src/lib/students/mock-data.ts` (`?state=` only)
- Domain: `src/lib/domain/region.ts`, `src/lib/domain/subscription-status.ts`
- Shared status pills: `src/components/shared/StatusBadge.tsx`
- Visual registry: `.context/ui-registry.md`
- ADRs: `docs/adr/0005-students-list-ui-mock/`, `docs/adr/0006-student-detail-devices/`

## Conventions

- Render from typed Nest DTOs (`StudentListItem` includes `clerkId` + `deactivatedAt`, `StudentListResponse`, `AdminDeviceBindingListResponse`). No UI remapping of Nest fields.
- Live path: TanStack Query + Clerk `getToken` + `apiFetch`. List URL filters map to Nest query params (`includeDeactivated=true` optional).
- Query keys: `adminKeys.students.list(filters)`, `adminKeys.students.detail(userId)`, `adminKeys.devices.byUser(userId)`.
- Page stays a Server Component. Containers and interactive pieces are `"use client"`.
- Device UI shows `deviceType`, `boundAt`, `lastSeenAt` only (Nest does not return hashes).
- Reset one uses `DELETE .../bindings/:deviceType` (`web` | `mobile`). Reset all uses `DELETE .../bindings`. Confirm with `AlertDialog`. Capture `admin_device_reset` on success.
- Student lifecycle on detail: `PATCH .../deactivate`, `PATCH .../reactivate`, `DELETE /users/:userId` (confirm dialogs). Delete redirects to `/students`.
- Icons: Phosphor. Prefer `data-icon` on buttons.
- Profile links: plain `Link` to `/students/[userId]`.
- Fetch errors stay on the page with retry. Do not silent-fallback to mock data.

## Preview states

- Default: live Query via containers
- `?state=loading` → list skeleton (no fetch)
- `?state=empty` → `emptyStudentList` (no fetch)
