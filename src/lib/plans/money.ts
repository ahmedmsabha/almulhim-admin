import {
  PLAN_BASE_CURRENCY,
  PLAN_DISPLAY_CURRENCIES,
  type PlanDisplayCurrency,
} from "@/lib/plans/currencies";
import type { IlsFxRates } from "@/lib/plans/fetch-fx-rates";

/** Convert Nest integer minor units to major units for form display. */
export function minorToMajor(priceAmount: number): number {
  return priceAmount / 100;
}

/** Convert major units from the form to Nest integer minor units. */
export function majorToMinor(major: number): number {
  return Math.round(major * 100);
}

export function formatMajorAmount(
  major: number,
  currency: string,
  options?: { fractionDigits?: number },
): string {
  const fractionDigits = options?.fractionDigits ?? 2;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(major);
  } catch {
    return `${major.toFixed(fractionDigits)} ${currency.toUpperCase()}`;
  }
}

/** Round up to the next whole unit (9.97 → 10, 4945.89 → 4946). */
export function ceilMajorAmount(major: number): number {
  if (!Number.isFinite(major) || major <= 0) return 0;
  return Math.ceil(major - Number.EPSILON);
}

export function formatPlanPrice(
  priceAmount: number,
  currency: string,
): string {
  return formatMajorAmount(minorToMajor(priceAmount), currency);
}

/**
 * Convert a plan's stored amount into ILS major units.
 * Plans are written as ILS; if Nest has another currency, invert the ILS-base rate.
 */
export function planAmountToIlsMajor(
  priceAmount: number,
  currency: string,
  fx: IlsFxRates | undefined,
): number {
  const major = minorToMajor(priceAmount);
  const code = currency.toUpperCase();
  if (code === PLAN_BASE_CURRENCY) return major;
  if (!fx) return major;

  const rate =
    fx.rates[code as PlanDisplayCurrency] ??
    undefined;
  if (typeof rate !== "number" || rate <= 0) return major;
  // fx.rates[USD] = USD per 1 ILS → ILS = foreign / rate
  return major / rate;
}

/** Convert ILS major → display currency using live rates. */
export function ilsMajorToDisplay(
  ilsMajor: number,
  target: PlanDisplayCurrency,
  fx: IlsFxRates | undefined,
): number | null {
  if (target === "ILS") return ilsMajor;
  if (!fx) return null;
  const rate = fx.rates[target];
  if (typeof rate !== "number" || rate <= 0) return null;
  return ilsMajor * rate;
}

export function formatPlanPriceTriple(
  priceAmount: number,
  currency: string,
  fx: IlsFxRates | undefined,
): { code: PlanDisplayCurrency; label: string; text: string }[] {
  const ilsMajor = planAmountToIlsMajor(priceAmount, currency, fx);

  return PLAN_DISPLAY_CURRENCIES.map(({ code, label }) => {
    const converted = ilsMajorToDisplay(ilsMajor, code, fx);
    if (converted === null && code !== "ILS") {
      return {
        code,
        label,
        text: "—",
      };
    }
    const roundedUp = ceilMajorAmount(converted ?? ilsMajor);
    return {
      code,
      label,
      text: formatMajorAmount(roundedUp, code, { fractionDigits: 0 }),
    };
  });
}
