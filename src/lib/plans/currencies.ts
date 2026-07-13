/** Currencies shown in the plans UI. Nest storage is always ILS. */
export const PLAN_BASE_CURRENCY = "ILS" as const;

export type PlanDisplayCurrency = "ILS" | "USD" | "EGP";

export const PLAN_DISPLAY_CURRENCIES: ReadonlyArray<{
  code: PlanDisplayCurrency;
  label: string;
}> = [
  { code: "ILS", label: "ILS (₪)" },
  { code: "USD", label: "US Dollar ($)" },
  { code: "EGP", label: "Egyptian Pound (E£)" },
];
