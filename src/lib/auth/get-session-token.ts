import { auth } from "@clerk/nextjs/server";

/** Session JWT for Mulhim Backend Authorization: Bearer … */
export async function getSessionToken(): Promise<string | null> {
  const session = await auth();
  if (!session.userId) return null;
  return session.getToken();
}
