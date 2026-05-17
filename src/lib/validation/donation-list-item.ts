import { z } from "zod";

export const donationListItemDescriptionSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(5000, "Description is too long"),
});
