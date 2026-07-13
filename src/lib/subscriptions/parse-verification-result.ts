/**
 * Display layer over Nest `verificationResult` (`ReceiptVerificationResult` v1).
 * Tolerates null and malformed payloads for the queue AI column and detail panel.
 */

import type {
  ReceiptVerificationResult,
  VerificationCheck,
} from "@/lib/subscriptions/types";

export type VerificationOutcome = "pass" | "warn" | "fail";

export type VerificationDisplay = {
  outcome: VerificationOutcome | null;
  summary: string;
};

export type VerificationCheckRow = {
  key: "recipientMatch" | "senderMatch" | "notDuplicate";
  label: string;
  check: VerificationCheck;
};

export type VerificationPanelModel = {
  kind: "awaiting" | "invalid" | "ready";
  overallPassed: boolean | null;
  summary: string;
  notes: string | null;
  error: string | null;
  aiEnabled: boolean | null;
  model: string | null;
  transactionReference: string | null;
  checks: VerificationCheckRow[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function isCheck(value: unknown): value is VerificationCheck {
  const record = asRecord(value);
  if (!record) return false;
  if (typeof record.passed !== "boolean") return false;
  if (record.detected !== null && typeof record.detected !== "string") {
    return false;
  }
  if (record.reason !== null && typeof record.reason !== "string") {
    return false;
  }
  return true;
}

export function isReceiptVerificationResult(
  value: unknown,
): value is ReceiptVerificationResult {
  const record = asRecord(value);
  if (!record) return false;
  if (record.version !== 1) return false;
  if (typeof record.passed !== "boolean") return false;
  if (typeof record.verifiedAt !== "string") return false;
  if (typeof record.aiEnabled !== "boolean") return false;
  if (record.model !== null && typeof record.model !== "string") return false;
  if (record.error !== null && typeof record.error !== "string") return false;
  if (record.notes !== null && typeof record.notes !== "string") return false;
  const checks = asRecord(record.checks);
  if (!checks) return false;
  if (!isCheck(checks.recipientMatch)) return false;
  if (!isCheck(checks.senderMatch)) return false;
  if (!isCheck(checks.notDuplicate)) return false;
  return true;
}

function legacyOutcome(record: Record<string, unknown>): VerificationOutcome | null {
  const raw =
    typeof record.outcome === "string"
      ? record.outcome
      : typeof record.status === "string"
        ? record.status
        : typeof record.result === "string"
          ? record.result
          : null;
  if (!raw) {
    if (typeof record.ok === "boolean") return record.ok ? "pass" : "fail";
    return null;
  }
  const normalized = raw.trim().toLowerCase();
  if (normalized === "pass" || normalized === "ok" || normalized === "success") {
    return "pass";
  }
  if (normalized === "warn" || normalized === "warning") return "warn";
  if (normalized === "fail" || normalized === "failed" || normalized === "error") {
    return "fail";
  }
  return null;
}

/**
 * Short label for the pending queue AI column.
 */
export function parseVerificationResult(
  verificationResult: unknown,
): VerificationDisplay {
  if (verificationResult == null) {
    return { outcome: null, summary: "Awaiting AI" };
  }

  if (isReceiptVerificationResult(verificationResult)) {
    if (verificationResult.error) {
      return { outcome: "fail", summary: verificationResult.error };
    }
    if (!verificationResult.aiEnabled) {
      return {
        outcome: verificationResult.passed ? "pass" : "warn",
        summary: verificationResult.notes?.trim() || "AI skipped",
      };
    }
    const failed = (
      [
        verificationResult.checks.recipientMatch,
        verificationResult.checks.senderMatch,
        verificationResult.checks.notDuplicate,
      ] as VerificationCheck[]
    ).filter((check) => !check.passed);
    if (verificationResult.passed) {
      return {
        outcome: "pass",
        summary: verificationResult.notes?.trim() || "All checks passed",
      };
    }
    if (failed.length === 1) {
      return {
        outcome: "fail",
        summary: failed[0]?.reason?.trim() || "One check failed",
      };
    }
    return {
      outcome: failed.length > 0 ? "fail" : "warn",
      summary: verificationResult.notes?.trim() || "Review needed",
    };
  }

  if (typeof verificationResult === "string") {
    const trimmed = verificationResult.trim();
    if (!trimmed) return { outcome: null, summary: "—" };
    return { outcome: null, summary: trimmed };
  }

  const record = asRecord(verificationResult);
  if (!record) {
    return { outcome: null, summary: "—" };
  }

  const outcome = legacyOutcome(record);
  const summaryKeys = ["summary", "notes", "message", "reason", "detail"] as const;
  let summary: string | null = null;
  for (const key of summaryKeys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      summary = value.trim();
      break;
    }
  }

  if (!outcome && !summary) {
    return { outcome: null, summary: "—" };
  }

  return {
    outcome,
    summary: summary ?? (outcome === "pass" ? "Document matches" : "Review needed"),
  };
}

/**
 * Rich model for the receipt review AI check panel.
 */
export function buildVerificationPanel(
  verificationResult: unknown,
): VerificationPanelModel {
  if (verificationResult == null) {
    return {
      kind: "awaiting",
      overallPassed: null,
      summary: "Awaiting AI verification",
      notes: null,
      error: null,
      aiEnabled: null,
      model: null,
      transactionReference: null,
      checks: [],
    };
  }

  if (!isReceiptVerificationResult(verificationResult)) {
    const short = parseVerificationResult(verificationResult);
    return {
      kind: "invalid",
      overallPassed: short.outcome === "pass" ? true : short.outcome === "fail" ? false : null,
      summary: short.summary,
      notes: null,
      error: null,
      aiEnabled: null,
      model: null,
      transactionReference: null,
      checks: [],
    };
  }

  const txn =
    verificationResult.checks.notDuplicate.transactionReference ??
    verificationResult.checks.notDuplicate.detected;

  return {
    kind: "ready",
    overallPassed: verificationResult.passed,
    summary: verificationResult.passed
      ? "AI checks passed"
      : verificationResult.error?.trim() || "AI checks need review",
    notes: verificationResult.notes,
    error: verificationResult.error,
    aiEnabled: verificationResult.aiEnabled,
    model: verificationResult.model,
    transactionReference: txn,
    checks: [
      {
        key: "recipientMatch",
        label: "Recipient match",
        check: verificationResult.checks.recipientMatch,
      },
      {
        key: "senderMatch",
        label: "Sender match",
        check: verificationResult.checks.senderMatch,
      },
      {
        key: "notDuplicate",
        label: "Not a duplicate",
        check: verificationResult.checks.notDuplicate,
      },
    ],
  };
}
