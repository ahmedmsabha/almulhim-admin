import { toast } from "sonner";

import { isApiError, type ApiError } from "@/lib/api/errors";

function nestMessage(body: unknown): string | null {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return null;
  }
  const message = (body as Record<string, unknown>).message;
  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }
  if (Array.isArray(message)) {
    const first = message.find((item) => typeof item === "string");
    if (typeof first === "string" && first.trim()) {
      return first.trim();
    }
  }
  return null;
}

function isTechnicalMessage(message: string): boolean {
  return (
    message.startsWith("[api/") ||
    message.startsWith("[plans]") ||
    message.startsWith("[content]") ||
    message.startsWith("[announcements]") ||
    message.startsWith("[subscriptions]") ||
    message.startsWith("[support]") ||
    message.startsWith("[devices]") ||
    message.startsWith("[students]")
  );
}

function messageFromApiError(error: ApiError): string {
  const fromBody = nestMessage(error.body);
  if (fromBody) return fromBody;

  switch (error.kind) {
    case "unauthorized":
      return "Your session expired. Sign in again and retry.";
    case "authz":
      return "You do not have permission for this action.";
    case "network":
    case "config":
      return "Could not reach the Mulhim Backend. Check the API and try again.";
    case "parse":
      return "The server returned an unexpected response.";
    case "server":
      return "The server failed to complete this action. Try again.";
    case "client":
      return "The request was rejected. Check your input and try again.";
    default:
      break;
  }

  if (isTechnicalMessage(error.message)) {
    return "Something went wrong. Try again.";
  }
  return error.message || "Something went wrong. Try again.";
}

/** Mutation failure toast. Prefer Nest body message, then kind map, never raw apiFetch strings. */
export function toastAdminError(error: unknown): void {
  if (isApiError(error)) {
    toast.error(messageFromApiError(error));
    return;
  }
  if (error instanceof Error && error.message && !isTechnicalMessage(error.message)) {
    toast.error(error.message);
    return;
  }
  toast.error("Something went wrong. Try again.");
}

/** Success toast when the UI has no other clear signal. */
export function toastAdminSuccess(message: string): void {
  toast.success(message);
}
