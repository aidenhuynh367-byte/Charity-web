import Link from "next/link";

import { ShareWidget } from "@/components/share-widget";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { t } from "@/i18n/t";
import { appPublicOrigin } from "@/lib/app-public-url";
import { requireUserId, getOrCreateProfile } from "@/lib/auth-server";

import { HowItWorksWizard } from "./how-it-works-wizard";

export default async function DashboardPage() {
  const userId = await requireUserId();
  const profile = await getOrCreateProfile(userId);
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const isCharity = profile.role === "CHARITY_ORGANIZATION";
  const title = isCharity ? profile.organizationName : profile.displayName;
  const contributorName =
    profile.displayName?.trim() || t(dict, "dashboard.contributorFallback");
  const appUrl = appPublicOrigin();

  return (
    <main>
      {isCharity ? (
        <>
          <h1 className="text-2xl font-bold text-slate-900">
            {t(dict, "dashboard.welcome")}
          </h1>
          <p className="mt-2 text-slate-600">
            {t(dict, "dashboard.signedInAs")}{" "}
            <strong>{t(dict, "dashboard.charityRole")}</strong>
            {title ? (
              <>
                : <strong>{title}</strong>
              </>
            ) : null}
            .
          </p>
          <p className="mt-6 text-sm text-slate-500">
            {t(dict, "dashboard.profileHint")}{" "}
            <Link className="underline" href="/profile">
              {t(dict, "dashboard.profileLink")}
            </Link>{" "}
            {t(dict, "dashboard.profileHintTail")}
          </p>
        </>
      ) : (
        <>
          <Link
            href="/donation-lists/new"
            className="inline-flex rounded-lg bg-slate-900 px-5 py-3 text-base font-medium text-white hover:bg-slate-800"
          >
            {t(dict, "dashboard.startDonating")}
          </Link>
          <p className="mt-6 text-slate-700">
            {t(dict, "dashboard.greeting", { name: contributorName })}
          </p>
          <p className="mt-4 text-slate-700">
            {t(dict, "dashboard.sharePrompt")}
          </p>
          <HowItWorksWizard />
          <div className="mt-10">
            <ShareWidget url={appUrl} />
          </div>
        </>
      )}
    </main>
  );
}
