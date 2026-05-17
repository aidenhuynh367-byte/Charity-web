import {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";

export type CountryDialOption = {
  value: CountryCode;
  label: string;
};

/** Sorted list for `<select>`: country name + dial code; value is ISO 3166-1 alpha-2. */
export function getSortedCountryDialOptions(): CountryDialOption[] {
  const codes = getCountries();
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
    .sort((a, b) => a.label.localeCompare(b.label, "en"));
}
