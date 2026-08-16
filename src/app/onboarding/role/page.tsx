import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

import { requireUserId, getOrCreateProfile } from "@/lib/auth-server";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { t } from "@/i18n/t";
import { prisma } from "@/lib/prisma";

import { BeginContributorForm } from "./begin-contributor-form";
import { WelcomeSlideshow } from "./welcome-slideshow";

type RoleSearchParams = { [key: string]: string | string[] | undefined };

export default async function OnboardingRolePage({
  searchParams,
}: {
  searchParams: Promise<RoleSearchParams>;
}) {
  const userId = await requireUserId();
  const profile = await getOrCreateProfile(userId);

  if (profile.onboardingCompletedAt) {
    redirect("/dashboard");
  }
  if (profile.role && !profile.onboardingCompletedAt) {
    redirect("/onboarding/profile");
  }

  const params = await searchParams;
  const addOrg = params.AddOrg === "foobar";

  if (addOrg) {
    await prisma.profile.upsert({
      where: { userId },
      create: { userId, role: Role.CHARITY_ORGANIZATION },
      update: { role: Role.CHARITY_ORGANIZATION },
    });
    redirect("/onboarding/profile");
  }

  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col px-4 pb-10 pt-1.5">
      <div>
        <p className="text-lg font-bold leading-relaxed text-slate-900 sm:text-xl">
          {t(dict, "onboarding.roleIntro")}
        </p>
        <WelcomeSlideshow />
      </div>
      <BeginContributorForm />
    </div>
  );
}
