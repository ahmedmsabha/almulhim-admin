import { z } from "zod";

import { PLAN_BASE_CURRENCY } from "@/lib/plans/currencies";
import { majorToMinor } from "@/lib/plans/money";

/** Form values use ILS major units; Nest always stores currency ILS. */
export const planFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  description: z.string().trim().max(2000),
  priceMajor: z.coerce.number().positive("Price must be greater than zero"),
  durationDays: z.coerce
    .number()
    .int("Duration must be a whole number")
    .positive("Duration must be greater than zero"),
  sortOrder: z.coerce
    .number()
    .int("Sort order must be a whole number")
    .min(0, "Sort order cannot be negative"),
  isActive: z.boolean(),
});

export type PlanFormValues = z.output<typeof planFormSchema>;
export type PlanFormInput = z.input<typeof planFormSchema>;

export function planFormToCreateBody(values: PlanFormValues) {
  const description = values.description.trim();
  return {
    name: values.name,
    ...(description ? { description } : {}),
    priceAmount: majorToMinor(values.priceMajor),
    currency: PLAN_BASE_CURRENCY,
    durationDays: values.durationDays,
    sortOrder: values.sortOrder,
  };
}

export function planFormToUpdateBody(values: PlanFormValues) {
  const description = values.description.trim();
  return {
    name: values.name,
    description: description.length > 0 ? description : null,
    priceAmount: majorToMinor(values.priceMajor),
    currency: PLAN_BASE_CURRENCY,
    durationDays: values.durationDays,
    sortOrder: values.sortOrder,
    isActive: values.isActive,
  };
}
