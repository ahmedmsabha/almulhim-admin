import { ApiError } from "@/lib/api/errors";
import type { PlanDisplayCurrency } from "@/lib/plans/currencies";

/** Rates relative to 1 ILS → target currency (e.g. usd: how many USD per 1 ILS). */
export type IlsFxRates = {
  base: "ILS";
  date: string;
  rates: Record<PlanDisplayCurrency, number>;
};

const PRIMARY_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/ils.min.json";
const FALLBACK_URL =
  "https://latest.currency-api.pages.dev/v1/currencies/ils.min.json";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseIlsPayload(payload: unknown, path: string): IlsFxRates {
  if (!isRecord(payload) || !isRecord(payload.ils)) {
    throw new ApiError({
      kind: "parse",
      message: `[plans/fx] unexpected FX payload from ${path}`,
      path,
    });
  }

  const ils = payload.ils;
  const usd = ils.usd;
  const egp = ils.egp;
  const ilsSelf = ils.ils;

  if (
    typeof usd !== "number" ||
    typeof egp !== "number" ||
    (ilsSelf !== undefined && typeof ilsSelf !== "number")
  ) {
    throw new ApiError({
      kind: "parse",
      message: `[plans/fx] missing usd/egp rates from ${path}`,
      path,
    });
  }

  const date = typeof payload.date === "string" ? payload.date : "latest";

  return {
    base: "ILS",
    date,
    rates: {
      ILS: typeof ilsSelf === "number" ? ilsSelf : 1,
      USD: usd,
      EGP: egp,
    },
  };
}

async function fetchJson(url: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store" });
  } catch (cause) {
    throw new ApiError({
      kind: "network",
      message: `[plans/fx] network error for ${url}`,
      path: url,
      cause,
    });
  }

  if (!response.ok) {
    throw new ApiError({
      kind: "server",
      message: `[plans/fx] ${url} returned ${response.status}`,
      status: response.status,
      path: url,
    });
  }

  try {
    return await response.json();
  } catch (cause) {
    throw new ApiError({
      kind: "parse",
      message: `[plans/fx] failed to parse JSON from ${url}`,
      path: url,
      cause,
    });
  }
}

/** Live ILS→USD / ILS→EGP rates (free CDN + Cloudflare fallback). */
export async function fetchIlsFxRates(): Promise<IlsFxRates> {
  try {
    const payload = await fetchJson(PRIMARY_URL);
    return parseIlsPayload(payload, PRIMARY_URL);
  } catch {
    const payload = await fetchJson(FALLBACK_URL);
    return parseIlsPayload(payload, FALLBACK_URL);
  }
}
