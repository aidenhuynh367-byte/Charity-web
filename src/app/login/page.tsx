import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { authConfig } from "@/auth.config";
import { LanguageSelector } from "@/components/language-selector";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { t, type Dictionary } from "@/i18n/t";

import { LoginButtons } from "./login-buttons";
import { LoginSlideshow } from "./login-slideshow";

type LoginSearchParams = { [key: string]: string | string[] | undefined };

function loginErrorMessage(
  dict: Dictionary,
  code: string | undefined,
): string | null {
  switch (code) {
    case "stale_session":
      return t(dict, "login.error.staleSession");
    case "database":
      return t(dict, "login.error.database");
    case "migration":
      return t(dict, "login.error.migration");
    default:
      return null;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<LoginSearchParams>;
}) {
  const params = await searchParams;
  const errorCode = typeof params.error === "string" ? params.error : undefined;
  const noticeCode =
    typeof params.notice === "string" ? params.notice : undefined;
  const showMicrosoftLogin = params.showMSLogin === "Yes";
  const addOrg = typeof params.AddOrg === "string" ? params.AddOrg : null;
  const callbackUrl =
    typeof params.callbackUrl === "string" ? params.callbackUrl : null;

  const session = await auth();
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  if (errorCode === "stale_session" && session?.user) {
    await signOut({ redirectTo: "/login?notice=stale_session" });
  }

  if (session?.user?.id) {
    if (addOrg === "foobar") {
      redirect("/onboarding/role?AddOrg=foobar");
    }
    redirect("/dashboard");
  }

  const errorBanner = loginErrorMessage(dict, noticeCode ?? errorCode);
  const count = authConfig.providers?.length ?? 0;

  return (
    <div className="relative min-h-screen">
      <nav className="absolute right-4 top-4 flex items-center gap-4 text-base font-bold text-slate-900 sm:right-6 sm:top-6">
        <LanguageSelector locale={locale} label={t(dict, "nav.language")} />
        <Link href="/faq" className="hover:text-slate-700">
          {t(dict, "nav.faq")}
        </Link>
      </nav>
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
        <header className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/mainlogo.png"
            alt={t(dict, "brand.alt")}
            width={280}
            height={140}
            className="h-auto w-56 sm:w-72"
            priority
          />
          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t(dict, "brand.name")}
          </p>
        </header>
        <p className="text-sm leading-relaxed text-slate-600">
          {t(dict, "login.intro")}
        </p>
        <LoginSlideshow />
        {errorBanner ? (
          <p className="mt-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            {errorBanner}
          </p>
        ) : null}
        {count === 0 ? (
          <p className="mt-6 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {t(dict, "login.error.noProviders")}
          </p>
        ) : (
          <LoginButtons
            showMicrosoftLogin={showMicrosoftLogin}
            callbackUrl={callbackUrl}
            addOrg={addOrg}
          />
        )}
      </div>
    </div>
  );
}
