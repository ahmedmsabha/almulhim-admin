import { apiFetch } from "@/lib/api/api-fetch";
import { ApiError } from "@/lib/api/errors";
import {
  parseDeleteStudentResponse,
  parseStudentListItem,
  parseStudentListResponse,
} from "@/lib/students/parse-students";
import type {
  DeleteStudentResponse,
  StudentListItem,
  StudentListQuery,
  StudentListResponse,
} from "@/lib/students/types";
import { STUDENT_PAGE_SIZE } from "@/lib/students/types";

export const STUDENTS_LIST_PATH = "/users";

export function studentDetailPath(userId: string) {
  return `/users/${userId}`;
}

export function studentDeactivatePath(userId: string) {
  return `/users/${userId}/deactivate`;
}

export function studentReactivatePath(userId: string) {
  return `/users/${userId}/reactivate`;
}

export function buildStudentsListPath(query: StudentListQuery = {}): string {
  const params = new URLSearchParams();
  const q = query.q?.trim();
  if (q) params.set("q", q);
  if (query.region) params.set("region", query.region);
  if (query.status) params.set("status", query.status);
  if (query.includeDeactivated) params.set("includeDeactivated", "true");
  const page = query.page && query.page > 0 ? Math.floor(query.page) : 1;
  params.set("page", String(page));
  params.set("pageSize", String(query.pageSize ?? STUDENT_PAGE_SIZE));
  const qs = params.toString();
  return `${STUDENTS_LIST_PATH}?${qs}`;
}

function requireToken(token: string, path: string) {
  if (!token) {
    throw new ApiError({
      kind: "unauthorized",
      message: `[students] missing Bearer token for ${path}`,
      path,
    });
  }
}

export async function fetchStudentsList(
  token: string,
  query: StudentListQuery = {},
): Promise<StudentListResponse> {
  const path = buildStudentsListPath(query);
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, { token });
  return parseStudentListResponse(payload, path);
}

export async function fetchStudentDetail(
  token: string,
  userId: string,
): Promise<StudentListItem> {
  const path = studentDetailPath(userId);
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, { token });
  return parseStudentListItem(payload, path);
}

export async function deactivateStudent(
  token: string,
  userId: string,
): Promise<StudentListItem> {
  const path = studentDeactivatePath(userId);
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, { token, method: "PATCH" });
  return parseStudentListItem(payload, path);
}

export async function reactivateStudent(
  token: string,
  userId: string,
): Promise<StudentListItem> {
  const path = studentReactivatePath(userId);
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, { token, method: "PATCH" });
  return parseStudentListItem(payload, path);
}

export async function deleteStudent(
  token: string,
  userId: string,
): Promise<DeleteStudentResponse> {
  const path = studentDetailPath(userId);
  requireToken(token, path);
  const payload = await apiFetch<unknown>(path, { token, method: "DELETE" });
  return parseDeleteStudentResponse(payload, path);
}
