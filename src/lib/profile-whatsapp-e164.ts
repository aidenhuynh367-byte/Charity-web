import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

/** E.164 from profile ISO country + digits-only national subscriber number. */
export function profileWhatsappToE164(
  country: string | null | undefined,
  national: string | null | undefined,
): string | null {
  const c = country?.trim();
  const n = national?.trim();
  if (!c || !n) return null;
  const parsed = parsePhoneNumberFromString(n, c.toUpperCase() as CountryCode);
  if (!parsed?.isValid()) return null;
  return parsed.format("E.164");
}
