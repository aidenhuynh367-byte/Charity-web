import Link from "next/link";

import { LanguageSelector } from "@/components/language-selector";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { t } from "@/i18n/t";

export async function PublicSiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <a
          href="https://thecharitylink.org"
          className="text-lg font-semibold text-slate-900 hover:text-slate-700"
        >
          {t(dict, "brand.name")}
        </a>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
          <LanguageSelector locale={locale} label={t(dict, "nav.language")} />
          <Link href="/login" className="hover:text-slate-900">
            {t(dict, "nav.signIn")}
          </Link>
          <Link href="/faq" className="hover:text-slate-900">
            {t(dict, "nav.faq")}
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
