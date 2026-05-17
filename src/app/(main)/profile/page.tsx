import { logoutAction } from "@/app/actions/auth";
import { requireUserId, getOrCreateProfile } from "@/lib/auth-server";

import { ProfileEditForm } from "./profile-edit-form";

export default async function ProfilePage() {
  const userId = await requireUserId();
  const profile = await getOrCreateProfile(userId);

  return (
    <main>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your profile</h1>
          <p className="mt-1 text-sm text-slate-600">
            View and update the information you provided at signup.
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Sign out
          </button>
        </form>
      </div>
      <ProfileEditForm role={profile.role!} initial={profile} />
    </main>
  );
}
