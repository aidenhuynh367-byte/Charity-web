import { z } from "zod";

import { CONTRIBUTOR_LOCATIONS } from "@/lib/contributor-locations";

export const roleSchema = z.object({
  role: z.enum(["CHARITY_ORGANIZATION", "CONTRIBUTOR"]),
});

/** Charity organization street / mailing address (free text). */
function charityAddressSchema() {
  return z
    .string()
    .trim()
    .min(5, "Address is required.")
    .max(500, "Address must be at most 500 characters.");
}

/** National subscriber part: digits only, at least 5. */
function nationalNumberDigitsSchema() {
  return z
    .string()
    .trim()
    .regex(
      /^\d{5,}$/,
      "Must be only numbers and at least 5 digits long.",
    );
}

/** Letters, digits, and spaces; min 5, max 200. Messages omit the label (caller adds via formatZodFormError). */
export function alphanumericNameSchema() {
  return z
    .string()
    .trim()
    .min(
      5,
      "Must be at least 5 characters and use only letters, numbers, and spaces.",
    )
    .max(200, "Must be at most 200 characters.")
    .regex(
      /^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/,
      "Must use only letters, numbers, and spaces (no symbols).",
    );
}

export const charityProfileSchema = z.object({
  organizationName: alphanumericNameSchema(),
  address: charityAddressSchema(),
  charityLocation: z.enum(CONTRIBUTOR_LOCATIONS, {
    errorMap: () => ({ message: "Please select a location." }),
  }),
  phoneCountry: z
    .string()
    .trim()
    .min(1, "Phone number is not a valid value.")
    .transform((s) => s.toUpperCase()),
  phoneNationalNumber: nationalNumberDigitsSchema(),
  charityWhatsappCountry: z
    .string()
    .trim()
    .min(1, "WhatsApp number is not a valid value.")
    .transform((s) => s.toUpperCase()),
  charityWhatsappNationalNumber: nationalNumberDigitsSchema(),
  charityEmail: z
    .string()
    .trim()
    .min(1, "Email is not a valid value.")
    .email("Email is not a valid value.")
    .transform((s) => s.toLowerCase()),
});

export const contributorProfileSchema = z.object({
  displayName: alphanumericNameSchema(),
  contributorLocation: z.enum(CONTRIBUTOR_LOCATIONS, {
    errorMap: () => ({ message: "Please select a location." }),
  }),
  contributorWhatsappCountry: z
    .string()
    .trim()
    .min(1, "WhatsApp number is not a valid value.")
    .transform((s) => s.toUpperCase()),
  contributorWhatsappNationalNumber: nationalNumberDigitsSchema(),
});

export type CharityProfileInput = z.infer<typeof charityProfileSchema>;
export type ContributorProfileInput = z.infer<typeof contributorProfileSchema>;
