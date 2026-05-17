import type { ZodError } from "zod";

const FIELD_TITLES: Record<string, string> = {
  organizationName: "Organization name",
  address: "Google Maps link",
  displayName: "Name",
  phoneCountry: "Phone number",
  phoneNationalNumber: "Phone number",
  charityWhatsappCountry: "WhatsApp number",
  charityWhatsappNationalNumber: "WhatsApp number",
  contributorWhatsappCountry: "WhatsApp number",
  contributorWhatsappNationalNumber: "WhatsApp number",
  charityEmail: "Email",
};

/** First Zod issue as `Title: message` for forms (client or server). */
export function formatZodFormError(error: ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Invalid input.";
  const key = issue.path[0];
  const title =
    typeof key === "string" && FIELD_TITLES[key] ? FIELD_TITLES[key] : "Field";
  return `${title}: ${issue.message}`;
}
