import { ApiError, type ApiErrorKind } from "@/lib/api/errors";

export type ApiFetchOptions = {
  token?: string | null;
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  headers?: HeadersInit;
  cache?: RequestCache;
  signal?: AbortSignal;
};

function getBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!baseUrl) {
    throw new ApiError({
      kind: "config",
      message: "[api/apiFetch] NEXT_PUBLIC_API_URL is not set",
      path: "",
    });
  }
  return baseUrl;
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function kindFromStatus(status: number): ApiErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 403 || status === 404) return "authz";
  if (status >= 500) return "server";
  if (status >= 400) return "client";
  return "client";
}

/**
 * Framework-agnostic authenticated fetch for the Mulhim Backend.
 * Pass a Clerk JWT via `token`. Do not import Clerk here.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const normalizedPath = normalizePath(path);
  const url = `${getBaseUrl()}${normalizedPath}`;
  const method = options.method ?? "GET";

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: options.cache ?? "no-store",
      signal: options.signal,
    });
  } catch (cause) {
    throw new ApiError({
      kind: "network",
      message: `[api/apiFetch] network error for ${method} ${normalizedPath}`,
      path: normalizedPath,
      cause,
    });
  }

  if (!response.ok) {
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    throw new ApiError({
      kind: kindFromStatus(response.status),
      message: `[api/apiFetch] ${method} ${normalizedPath} returned ${response.status}`,
      status: response.status,
      path: normalizedPath,
      body,
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return (await response.json()) as T;
  } catch (cause) {
    throw new ApiError({
      kind: "parse",
      message: `[api/apiFetch] failed to parse JSON for ${method} ${normalizedPath}`,
      status: response.status,
      path: normalizedPath,
      cause,
    });
  }
}
