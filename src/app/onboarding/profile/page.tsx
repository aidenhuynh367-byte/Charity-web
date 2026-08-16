import { redirect } from "next/navigation";

import { Role } from "@prisma/client";

import { requireUserId, getOrCreateProfile } from "@/lib/auth-server";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { t } from "@/i18n/t";

import { ProfileOnboardingForm } from "./profile-onboarding-form";

export default async function OnboardingProfilePage() {
  const userId = await requireUserId();
  const profile = await getOrCreateProfile(userId);

  if (profile.onboardingCompletedAt) {
    redirect("/dashboard");
  }
  if (!profile.role) {
    redirect("/onboarding/role");
  }

  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">
        {t(dict, "onboarding.profileTitle")}
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        {profile.role === Role.CHARITY_ORGANIZATION
          ? t(dict, "onboarding.profileSubtitleCharity")
          : t(dict, "onboarding.profileSubtitleContributor")}
      </p>
      <ProfileOnboardingForm role={profile.role} initial={profile} />
    </div>
  );
}
