"use client";

import type { FormEvent } from "react";
import { useEffect, useId, useState } from "react";

import { useI18n } from "@/components/i18n-provider";
import {
  getSortedCountryDialOptions,
  type CountryDialOption,
} from "@/lib/country-dial-options";

type Props = {
  countryFieldName: string;
  nationalFieldName: string;
  label: string;
  defaultCountry?: string | null;
  defaultNational?: string | null;
  required?: boolean;
};

export function PhoneCountryFields({
  countryFieldName,
  nationalFieldName,
  label,
  defaultCountry,
  defaultNational,
  required,
}: Props) {
  const { t } = useI18n();
  const uid = useId();
  const initialCountry = defaultCountry?.trim().toUpperCase() ?? "";
  const initialNational = (defaultNational ?? "").replace(/\D/g, "");

  // Build options only on the client — Node vs browser Intl.DisplayNames can
  // disagree on region names and cause hydration text mismatches.
  const [options, setOptions] = useState<CountryDialOption[]>([]);
  const [country, setCountry] = useState(initialCountry);

  useEffect(() => {
    setOptions(getSortedCountryDialOptions());
  }, []);

  useEffect(() => {
    setCountry(defaultCountry?.trim().toUpperCase() ?? "");
  }, [defaultCountry]);

  function stripNonDigits(e: FormEvent<HTMLInputElement>) {
    const el = e.currentTarget;
    const cleaned = el.value.replace(/\D/g, "");
    if (el.value !== cleaned) el.value = cleaned;
  }

  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-1 px-0 text-sm font-medium text-slate-800">
        {label}
      </legend>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <select
          id={`${uid}-country`}
          name={countryFieldName}
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required={required}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
        >
          <option value="" disabled={!!required}>
            Select country
          </option>
          {country && !options.some((o) => o.value === country) ? (
            <option value={country}>{country}</option>
          ) : null}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          id={`${uid}-national`}
          name={nationalFieldName}
          defaultValue={initialNational}
          required={required}
          inputMode="numeric"
          autoComplete="tel-national"
          pattern="[0-9]*"
          aria-label={`${label}, digits only`}
          onInput={stripNonDigits}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
          placeholder={t("profile.digitsPlaceholder")}
        />
      </div>
    </fieldset>
  );
}
