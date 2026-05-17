import { redirect } from "next/navigation";

import { requireUserId, getOrCreateProfile } from "@/lib/auth-server";

import { RoleForm } from "./role-form";

export default async function OnboardingRolePage() {
  const userId = await requireUserId();
  const profile = await getOrCreateProfile(userId);

  if (profile.onboardingCompletedAt) {
    redirect("/dashboard");
  }
  if (profile.role && !profile.onboardingCompletedAt) {
    redirect("/onboarding/profile");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">How do you participate?</h1>
      <p className="mt-2 text-sm text-slate-600">
        Choose one. You can contact support later if you need to change this.
      </p>
      <RoleForm />
    </div>
  );
}
