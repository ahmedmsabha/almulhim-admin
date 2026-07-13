import { isApiError } from "@/lib/api/errors";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Map Nest Zod flatten errors (`BadRequestException`) onto form field names.
 * Returns an empty object when the body is not a Nest validation payload.
 */
export function nestFieldErrorsFromApiError(
  error: unknown,
): Record<string, string> {
  if (!isApiError(error) || error.status !== 400 || !isRecord(error.body)) {
    return {};
  }

  const errors = error.body.errors;
  if (!isRecord(errors)) return {};

  const fieldErrors = errors.fieldErrors;
  if (!isRecord(fieldErrors)) return {};

  const mapped: Record<string, string> = {};
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (!Array.isArray(messages) || messages.length === 0) continue;
    const first = messages.find((item) => typeof item === "string");
    if (typeof first === "string") {
      mapped[key === "priceAmount" ? "priceMajor" : key] = first;
    }
  }
  return mapped;
}
