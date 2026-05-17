import { z } from "zod";

export const roleSchema = z.object({
  role: z.enum(["CHARITY_ORGANIZATION", "CONTRIBUTOR"]),
});

function isAllowedGoogleMapsHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h === "maps.google.com" ||
    h === "www.google.com" ||
    h === "google.com" ||
    h === "goo.gl" ||
    h === "maps.app.goo.gl" ||
    h.endsWith(".google.com") ||
    h.endsWith(".goo.gl")
  );
}

/** Charity `address` stores a Google Maps share URL (paste from Share → Copy link). */
function charityGoogleMapsUrlSchema() {
  return z
    .string()
    .trim()
    .min(1, "Google Maps link is required.")
    .max(2048)
    .refine(
      (val) => {
        try {
          const u = new URL(val);
          if (u.protocol !== "https:" && u.protocol !== "http:") return false;
          return isAllowedGoogleMapsHost(u.hostname);
        } catch {
          return false;
        }
      },
      { message: "Must be a valid Google Maps link (Share → Copy link)." },
    );
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

/** Letters and digits only; min 5, max 200. Messages omit the label (caller adds via formatZodFormError). */
export function alphanumericNameSchema() {
  return z
    .string()
    .trim()
    .min(
      5,
      "Must be at least 5 characters and use only letters and numbers.",
    )
    .max(200, "Must be at most 200 characters.")
    .regex(
      /^[a-zA-Z0-9]+$/,
      "Must use only letters and numbers (no spaces or symbols).",
    );
}

export const charityProfileSchema = z.object({
  organizationName: alphanumericNameSchema(),
  address: charityGoogleMapsUrlSchema(),
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
  contributorWhatsappCountry: z
    .string()
    .trim()
    .min(1, "WhatsApp number is not a valid value.")
    .transform((s) => s.toUpperCase()),
  contributorWhatsappNationalNumber: nationalNumberDigitsSchema(),
});

export type CharityProfileInput = z.infer<typeof charityProfileSchema>;
export type ContributorProfileInput = z.infer<typeof contributorProfileSchema>;
