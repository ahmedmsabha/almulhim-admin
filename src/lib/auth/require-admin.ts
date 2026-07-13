import { auth } from "@clerk/nextjs/server";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { isApiError } from "@/lib/api/errors";
import { fetchAdminMe, type AdminMe } from "@/lib/auth/fetch-admin-me";

/**
 * Clerk session + backend admin role.
 * Authz miss → /forbidden. Nest outage → rethrow to error boundary.
 */
export async function requireAdmin(): Promise<AdminMe> {
  const session = await auth();

  if (!session.userId) {
    redirect("/login");
  }

  const token = await session.getToken();
  if (!token) {
    redirect("/forbidden?reason=gate_failed");
  }

  try {
    const me = await fetchAdminMe(token);
    if (me.role !== "admin") {
      redirect("/forbidden");
    }
    return me;
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (isApiError(error) && error.isAuthzMiss) {
      redirect("/forbidden");
    }

    console.error("[auth/requireAdmin]", error);
    throw error;
  }
}
