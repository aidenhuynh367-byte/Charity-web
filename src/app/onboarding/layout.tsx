import Link from "next/link";

import { LanguageSelector } from "@/components/language-selector";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { t } from "@/i18n/t";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <div>
      <header className="mx-auto flex max-w-lg items-center justify-between gap-4 px-4 pt-4">
        <Link
          href="https://thecharitylink.org"
          className="text-base font-semibold text-slate-900 hover:text-slate-700"
        >
          {t(dict, "brand.name")}
        </Link>
        <LanguageSelector locale={locale} label={t(dict, "nav.language")} />
      </header>
      {children}
    </div>
  );
}
