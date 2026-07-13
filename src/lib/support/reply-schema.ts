import { z } from "zod";

/** Matches Nest `replySupportRequestSchema`. */
export const replySupportSchema = z.object({
  reply: z.string().trim().min(1, "Reply is required").max(5000),
});

export type ReplySupportFormValues = z.infer<typeof replySupportSchema>;
