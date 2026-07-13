import { z } from "zod";

export const rejectSubscriptionSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "Rejection reason is required")
    .max(500, "Keep the reason under 500 characters"),
});

export type RejectSubscriptionFormValues = z.infer<
  typeof rejectSubscriptionSchema
>;
