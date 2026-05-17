import { z } from "zod";

export const donationListNameSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
});

export type DonationListNameInput = z.infer<typeof donationListNameSchema>;
