"use client";

import type { FormEvent } from "react";
import { useId, useMemo } from "react";

import { getSortedCountryDialOptions } from "@/lib/country-dial-options";

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
  const options = useMemo(() => getSortedCountryDialOptions(), []);
  const uid = useId();

  const defaultC = defaultCountry?.trim().toUpperCase() ?? "";
  const defaultN = (defaultNational ?? "").replace(/\D/g, "");
  const countryDefault =
    defaultC && options.some((o) => o.value === defaultC) ? defaultC : "";

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
          defaultValue={countryDefault}
          required={required}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
        >
          <option value="" disabled={!!required}>
            Select country
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          id={`${uid}-national`}
          name={nationalFieldName}
          defaultValue={defaultN}
          required={required}
          inputMode="numeric"
          autoComplete="tel-national"
          pattern="[0-9]*"
          aria-label={`${label}, digits only`}
          onInput={stripNonDigits}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
          placeholder="Digits only"
        />
      </div>
    </fieldset>
  );
}
