import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

import { requireUserId, getOrCreateProfile } from "@/lib/auth-server";
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

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col px-4 py-10">
      <div className="flex-1">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Welcome
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600 sm:text-xl">
          You can create a Contributor account to connect to a local charity and
          help them easily donate your gently used items. The children thank you
          for your generosity and support.
        </p>
        <WelcomeSlideshow />
      </div>
      <BeginContributorForm />
    </div>
  );
}
