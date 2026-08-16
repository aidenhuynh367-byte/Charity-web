"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setLocaleAction } from "@/app/actions/locale";
import { localeLabels, locales, type Locale } from "@/i18n/config";

type Props = {
  locale: Locale;
  label: string;
};

export function LanguageSelector({ locale, label }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
      <span className="sr-only">{label}</span>
      <select
        name="locale"
        value={locale}
        disabled={pending}
        className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-60"
        onChange={(e) => {
          const next = e.target.value as Locale;
          const fd = new FormData();
          fd.set("locale", next);
          startTransition(async () => {
            await setLocaleAction(fd);
            router.refresh();
          });
        }}
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {localeLabels[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
