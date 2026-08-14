import {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";

export type CountryDialOption = {
  value: CountryCode;
  label: string;
};

/** ISO 3166-1 alpha-2 codes excluded from the phone country dropdown. */
const EXCLUDED_COUNTRY_CODES = new Set<CountryCode>(["IL"]);

/** Sorted list for `<select>`: country name + dial code; value is ISO 3166-1 alpha-2. */
export function getSortedCountryDialOptions(): CountryDialOption[] {
  const codes = getCountries().filter(
    (code) => !EXCLUDED_COUNTRY_CODES.has(code as CountryCode),
  );
  const intl = new Intl.DisplayNames(["en"], { type: "region" });
  return codes
    .map((code) => {
      const cc = code as CountryCode;
      const dial = getCountryCallingCode(cc);
      const name = intl.of(code) ?? code;
      return {
        value: cc,
        label: `${name} (+${dial})`,
      };
    })
    // Sort by ISO code so order is identical on Node and in the browser.
    .sort((a, b) => a.value.localeCompare(b.value, "en"));
}
