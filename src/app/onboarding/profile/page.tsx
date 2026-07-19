import { redirect } from "next/navigation";

import { Role } from "@prisma/client";

import { requireUserId, getOrCreateProfile } from "@/lib/auth-server";

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

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Your profile</h1>
      <p className="mt-2 text-sm text-slate-600">
        {profile.role === Role.CHARITY_ORGANIZATION
          ? "Enter your organization details."
          : "Enter your name, location, and WhatsApp number."}
      </p>
      <ProfileOnboardingForm role={profile.role} initial={profile} />
    </div>
  );
}
