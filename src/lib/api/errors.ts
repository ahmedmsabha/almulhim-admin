export type ApiErrorKind =
  | "authz"
  | "unauthorized"
  | "not_found"
  | "client"
  | "server"
  | "network"
  | "config"
  | "parse";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;
  readonly path: string;
  readonly body: unknown | null;

  constructor(options: {
    kind: ApiErrorKind;
    message: string;
    status?: number | null;
    path: string;
    body?: unknown | null;
    cause?: unknown;
  }) {
    super(options.message, { cause: options.cause });
    this.name = "ApiError";
    this.kind = options.kind;
    this.status = options.status ?? null;
    this.path = options.path;
    this.body = options.body ?? null;
  }

  get isAuthzMiss(): boolean {
    return this.kind === "authz" || this.status === 403 || this.status === 404;
  }

  get isTechnicalFailure(): boolean {
    return this.kind === "server" || this.kind === "network";
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
