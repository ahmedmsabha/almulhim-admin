import "server-only";

import { auth } from "@clerk/nextjs/server";

import { requireAdmin } from "@/lib/auth";
import { rejectSubscription } from "@/lib/subscriptions/fetch-subscriptions";

const OPEN_STATUSES = new Set([
  "pending_review",
  "pending_approval",
  "active",
  "suspended",
]);

export type DevCheckoutInput = {
  planId: string;
  senderName: string;
  receipt: File;
};

export type DevCheckoutResult = {
  subscriptionId: string;
  studentEmail: string;
};

function apiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }
  return base;
}

function clerkSecret(): string {
  const secret = process.env.CLERK_SECRET_KEY?.trim();
  if (!secret) {
    throw new Error("CLERK_SECRET_KEY is not set");
  }
  return secret;
}

async function clerkFetch<T>(
  pathname: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`https://api.clerk.com/v1${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${clerkSecret()}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    throw new Error(
      `Clerk ${pathname} failed (${res.status}): ${typeof body === "string" ? body : JSON.stringify(body)}`,
    );
  }
  return body as T;
}

type ClerkUser = {
  id: string;
  email_addresses?: { email_address?: string }[];
};

async function nestJson(
  token: string,
  path: string,
  init: RequestInit = {},
): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: res.status, body };
}

async function mintStudentJwt(): Promise<{ token: string; email: string }> {
  const listed = await clerkFetch<ClerkUser[] | { data?: ClerkUser[] }>(
    "/users?limit=50",
  );
  const users = Array.isArray(listed) ? listed : (listed.data ?? []);
  let student = users.find((user) =>
    (user.email_addresses ?? []).some((entry) =>
      /student|verify|test/i.test(entry.email_address ?? ""),
    ),
  );

  let email =
    student?.email_addresses?.[0]?.email_address ??
    `verify.student.${Date.now()}@example.com`;

  if (!student) {
    student = await clerkFetch<ClerkUser>("/users", {
      method: "POST",
      body: JSON.stringify({
        email_address: [email],
        first_name: "Ahmad",
        last_name: "Al-Masri",
        skip_password_requirement: true,
      }),
    });
    email = student.email_addresses?.[0]?.email_address ?? email;
  }

  const session = await clerkFetch<{ id: string }>("/sessions", {
    method: "POST",
    body: JSON.stringify({ user_id: student.id }),
  });
  const tokenRes = await clerkFetch<{ jwt?: string; token?: string }>(
    `/sessions/${session.id}/tokens`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );
  const token = tokenRes.jwt ?? tokenRes.token;
  if (!token) {
    throw new Error("Clerk session token response had no JWT");
  }
  return { token, email };
}

async function ensureRegisteredStudent(studentToken: string) {
  let me = await nestJson(studentToken, "/users/me");
  if (me.status === 200) return;

  const reg = await nestJson(studentToken, "/users/register", {
    method: "POST",
    body: JSON.stringify({
      fullName: "Ahmad Al-Masri",
      phoneNumber: "0599000712",
      telegramUsername: "ahmad_verify",
      region: "gaza",
    }),
  });
  if (reg.status !== 200 && reg.status !== 201) {
    throw new Error(
      `Student register failed (${reg.status}): ${JSON.stringify(reg.body)}`,
    );
  }
  me = await nestJson(studentToken, "/users/me");
  if (me.status !== 200) {
    throw new Error(
      `Student /users/me failed (${me.status}): ${JSON.stringify(me.body)}`,
    );
  }
}

async function clearPendingIfNeeded(
  studentToken: string,
  adminToken: string,
) {
  const mine = await nestJson(studentToken, "/subscriptions/me");
  if (mine.status !== 200 || !mine.body || typeof mine.body !== "object") {
    return;
  }
  const row = mine.body as { id?: string; status?: string };
  if (!row.id || !row.status || !OPEN_STATUSES.has(row.status)) return;

  if (row.status === "pending_review" || row.status === "pending_approval") {
    await rejectSubscription(adminToken, row.id, {
      rejectionReason: "Cleared by admin test checkout before a new seed.",
    });
    return;
  }

  throw new Error(
    `Test student already has an open ${row.status} subscription (${row.id}). Approve/reject/suspend it from the queue, then retry.`,
  );
}

/**
 * Dev-only: act as a test student against Nest (presign → R2 PUT → submit)
 * so Gemini receipt verification (`gemini-3.5-flash`) runs for real. Returns
 * the new subscription id for the live admin detail screen.
 */
export async function runDevSubscriptionCheckout(
  input: DevCheckoutInput,
): Promise<DevCheckoutResult> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Test checkout is disabled in production");
  }

  await requireAdmin();
  const session = await auth();
  const adminToken = await session.getToken();
  if (!adminToken) {
    throw new Error("Admin session has no Bearer token");
  }

  const contentType = input.receipt.type;
  if (
    contentType !== "image/jpeg" &&
    contentType !== "image/png" &&
    contentType !== "image/webp"
  ) {
    throw new Error("Receipt must be JPEG, PNG, or WebP");
  }
  if (input.receipt.size > 5 * 1024 * 1024) {
    throw new Error("Receipt must be 5MB or smaller");
  }
  const senderName = input.senderName.trim();
  if (senderName.length < 2 || senderName.length > 120) {
    throw new Error("Sender name must be 2–120 characters");
  }
  if (!input.planId.trim()) {
    throw new Error("Plan is required");
  }

  const { token: studentToken, email } = await mintStudentJwt();
  await ensureRegisteredStudent(studentToken);
  await clearPendingIfNeeded(studentToken, adminToken);

  const upload = await nestJson(
    studentToken,
    "/subscriptions/receipt-upload-url",
    {
      method: "POST",
      body: JSON.stringify({ contentType }),
    },
  );
  if (upload.status !== 200 && upload.status !== 201) {
    throw new Error(
      `Presign failed (${upload.status}): ${JSON.stringify(upload.body)}`,
    );
  }
  const uploadBody = upload.body as {
    uploadUrl?: string;
    receiptStorageKey?: string;
  };
  if (!uploadBody.uploadUrl || !uploadBody.receiptStorageKey) {
    throw new Error("Presign response missing uploadUrl or receiptStorageKey");
  }

  const bytes = Buffer.from(await input.receipt.arrayBuffer());
  const put = await fetch(uploadBody.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: bytes,
  });
  if (!put.ok) {
    const text = await put.text();
    throw new Error(`R2 PUT failed (${put.status}): ${text.slice(0, 200)}`);
  }

  const submit = await nestJson(studentToken, "/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      planId: input.planId,
      senderName,
      receiptStorageKey: uploadBody.receiptStorageKey,
    }),
  });
  if (submit.status !== 200 && submit.status !== 201) {
    throw new Error(
      `Submit failed (${submit.status}): ${JSON.stringify(submit.body)}`,
    );
  }
  const submitBody = submit.body as { id?: string };
  if (!submitBody.id) {
    throw new Error("Submit response missing subscription id");
  }

  return { subscriptionId: submitBody.id, studentEmail: email };
}
