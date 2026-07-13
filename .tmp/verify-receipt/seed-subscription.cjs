/**
 * One-shot verify seed: create receipt upload via Nest (student JWT), PUT to R2, submit subscription.
 * Usage: node .tmp/verify-receipt/seed-subscription.mjs
 * Reads CLERK_SECRET_KEY from almulhim-admin/.env and API from NEXT_PUBLIC_API_URL.
 * Does not print secrets.
 */
const fs = require("fs");
const path = require("path");

const ADMIN_ENV = path.join(__dirname, "../../.env");
const RECEIPT = path.join(__dirname, "payment-receipt.png");
const API = "http://localhost:3001";

function readEnvKey(file, key) {
  const text = fs.readFileSync(file, "utf8");
  const re = new RegExp(`^${key}=(.*)$`, "m");
  const m = text.match(re);
  if (!m) throw new Error(`Missing ${key}`);
  let v = m[1].trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  return v.replace(/^\s+/, "");
}

async function clerk(pathname, init = {}) {
  const secret = readEnvKey(ADMIN_ENV, "CLERK_SECRET_KEY");
  const res = await fetch(`https://api.clerk.com/v1${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    throw new Error(`Clerk ${pathname} ${res.status}: ${typeof body === "string" ? body : JSON.stringify(body)}`);
  }
  return body;
}

async function api(token, pathname, init = {}) {
  const res = await fetch(`${API}${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(init.body && !(init.body instanceof Buffer) ? { "Content-Type": "application/json" } : {}),
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: res.status, body };
}

async function main() {
  if (!fs.existsSync(RECEIPT)) throw new Error(`Missing receipt at ${RECEIPT}`);

  const users = await clerk("/users?limit=50");
  const list = Array.isArray(users) ? users : users.data || [];
  console.log("clerk_users", list.length);

  // Prefer a non-admin student: look for email containing student, else create one
  let student = list.find((u) => {
    const emails = (u.email_addresses || []).map((e) => e.email_address || "");
    return emails.some((e) => /student|verify|test/i.test(e));
  });

  if (!student) {
    const email = `verify.student.${Date.now()}@example.com`;
    student = await clerk("/users", {
      method: "POST",
      body: JSON.stringify({
        email_address: [email],
        first_name: "Ahmad",
        last_name: "Al-Masri",
        skip_password_requirement: true,
      }),
    });
    console.log("created_student", student.id, email);
  } else {
    const emails = (student.email_addresses || []).map((e) => e.email_address).join(",");
    console.log("reuse_student", student.id, emails);
  }

  // Create session + JWT for Nest
  const session = await clerk("/sessions", {
    method: "POST",
    body: JSON.stringify({ user_id: student.id }),
  });
  const tokenRes = await clerk(`/sessions/${session.id}/tokens`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  const token = tokenRes.jwt || tokenRes.token;
  if (!token) throw new Error("No JWT from Clerk session tokens");
  console.log("got_student_jwt", true);

  // Ensure registered student on Nest
  let me = await api(token, "/users/me");
  console.log("users/me", me.status, me.body && (me.body.role || me.body.message || me.body.error));
  if (me.status === 404 || me.status === 401 || (me.body && me.body.message === "User not registered")) {
    const reg = await api(token, "/users/register", {
      method: "POST",
      body: JSON.stringify({
        fullName: "Ahmad Al-Masri",
        phoneNumber: "0599000712",
        telegramUsername: "ahmad_verify",
        region: "gaza",
      }),
    });
    console.log("register", reg.status, reg.body && (reg.body.id || reg.body.message || reg.body.error));
    me = await api(token, "/users/me");
  }
  if (me.status !== 200) {
    throw new Error(`Cannot get registered student: ${me.status} ${JSON.stringify(me.body)}`);
  }
  console.log("student_db_id", me.body.id, "role", me.body.role);

  // If open subscription exists, report and stop (or reject first via admin later)
  const mine = await api(token, "/subscriptions/me");
  console.log("subscriptions/me", mine.status, mine.body && (mine.body.status || mine.body.message));

  // Plans with ids
  const plans = await api(token, "/plans");
  console.log("plans", plans.status, Array.isArray(plans.body?.plans) ? plans.body.plans.map((p) => ({ id: p.id, name: p.name, priceAmount: p.priceAmount })) : plans.body);
  const monthly = (plans.body?.plans || []).find((p) => p.priceAmount === 3000) || plans.body?.plans?.[0];
  if (!monthly) throw new Error("No plan available");

  // Presign
  const upload = await api(token, "/subscriptions/receipt-upload-url", {
    method: "POST",
    body: JSON.stringify({ contentType: "image/png" }),
  });
  console.log("presign", upload.status, upload.body && {
    key: upload.body.receiptStorageKey,
    expires: upload.body.expiresInSeconds,
    hasUrl: Boolean(upload.body.uploadUrl),
  });
  if (upload.status !== 200 && upload.status !== 201) {
    throw new Error(`Presign failed: ${JSON.stringify(upload.body)}`);
  }

  const png = fs.readFileSync(RECEIPT);
  const put = await fetch(upload.body.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/png" },
    body: png,
  });
  console.log("r2_put", put.status);
  if (!put.ok) {
    const t = await put.text();
    throw new Error(`R2 PUT failed ${put.status}: ${t.slice(0, 200)}`);
  }

  const submit = await api(token, "/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      planId: monthly.id,
      senderName: "Ahmad Al-Masri",
      receiptStorageKey: upload.body.receiptStorageKey,
    }),
  });
  console.log("submit", submit.status, submit.body && {
    id: submit.body.id,
    status: submit.body.status,
    verifiedAt: submit.body.verifiedAt,
    verificationPassed: submit.body.verificationResult?.passed,
  });
  if (submit.status !== 200 && submit.status !== 201) {
    throw new Error(`Submit failed: ${JSON.stringify(submit.body)}`);
  }

  // Poll for AI verification
  for (let i = 0; i < 12; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const detail = await api(token, "/subscriptions/me");
    const vr = detail.body?.verificationResult;
    console.log("poll", i, detail.body?.status, vr && {
      passed: vr.passed,
      aiEnabled: vr.aiEnabled,
      model: vr.model,
      error: vr.error,
      txn: vr.checks?.notDuplicate?.transactionReference,
    });
    if (vr && (vr.verifiedAt || vr.passed === true || vr.passed === false || vr.error)) {
      fs.writeFileSync(
        path.join(__dirname, "seed-result.json"),
        JSON.stringify({ subscriptionId: submit.body.id, detail: detail.body }, null, 2),
      );
      console.log("DONE", submit.body.id);
      return;
    }
  }
  fs.writeFileSync(
    path.join(__dirname, "seed-result.json"),
    JSON.stringify({ subscriptionId: submit.body.id, note: "AI still pending after polls" }, null, 2),
  );
  console.log("DONE_PENDING_AI", submit.body.id);
}

main().catch((err) => {
  console.error("SEED_FAIL", err.message);
  if (err.cause) console.error("SEED_CAUSE", err.cause);
  process.exit(1);
});
