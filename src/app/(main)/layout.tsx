import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

import { LanguageSelector } from "@/components/language-selector";
import { requireUserId, getOrCreateProfile } from "@/lib/auth-server";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { t } from "@/i18n/t";

/**
 * Dashboard + profile: require completed onboarding.
 */
export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await requireUserId();
  const profile = await getOrCreateProfile(userId);
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  if (!profile.role) {
    redirect("/onboarding/role");
  }
  if (!profile.onboardingCompletedAt) {
    redirect("/onboarding/profile");
  }

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
          <Link href="/dashboard" className="hover:text-slate-900">
            {t(dict, "nav.home")}
          </Link>
          {profile.role === Role.CONTRIBUTOR ? (
            <Link href="/donation-lists" className="hover:text-slate-900">
              {t(dict, "nav.donationLists")}
            </Link>
          ) : null}
          {profile.role === Role.CHARITY_ORGANIZATION ? (
            <Link
              href="/master-donation-lists"
              className="hover:text-slate-900"
            >
              {t(dict, "nav.masterDonationLists")}
            </Link>
          ) : null}
          <Link href="/profile" className="hover:text-slate-900">
            {t(dict, "nav.profile")}
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
