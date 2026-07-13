import { apiFetch } from "@/lib/api/api-fetch";

export type AdminMe = {
  id: string;
  email?: string;
  role: string;
  name?: string;
};

function parseAdminMe(payload: unknown): AdminMe | null {
  if (!payload || typeof payload !== "object") return null;

  const root = payload as Record<string, unknown>;
  const candidate =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root.user && typeof root.user === "object"
        ? (root.user as Record<string, unknown>)
        : root;

  const role = candidate.role;
  if (typeof role !== "string") return null;

  const idValue = candidate.id ?? candidate.userId ?? candidate.clerkId;
  const id = idValue != null ? String(idValue) : "";
  if (!id) return null;

  return {
    id,
    role,
    email: typeof candidate.email === "string" ? candidate.email : undefined,
    name:
      typeof candidate.name === "string"
        ? candidate.name
        : typeof candidate.fullName === "string"
          ? candidate.fullName
          : undefined,
  };
}

/**
 * Profile fetch for the admin gate via shared apiFetch.
 */
export async function fetchAdminMe(token: string): Promise<AdminMe> {
  const body = await apiFetch<unknown>("/users/me", { token });
  const me = parseAdminMe(body);
  if (!me) {
    throw new Error("[auth/fetchAdminMe] unexpected profile shape");
  }
  return me;
}
