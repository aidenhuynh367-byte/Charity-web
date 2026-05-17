import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

import { requireUserId, getOrCreateProfile } from "@/lib/auth-server";

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

  if (!profile.role) {
    redirect("/onboarding/role");
  }
  if (!profile.onboardingCompletedAt) {
    redirect("/onboarding/profile");
  }

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <Link href="/dashboard" className="text-lg font-semibold text-slate-900">
          Charity & Contributors
        </Link>
        <nav className="flex flex-wrap gap-4 text-sm font-medium text-slate-600">
          <Link href="/dashboard" className="hover:text-slate-900">
            Home
          </Link>
          {profile.role === Role.CONTRIBUTOR ? (
            <Link href="/donation-lists" className="hover:text-slate-900">
              Donation lists
            </Link>
          ) : null}
          {profile.role === Role.CHARITY_ORGANIZATION ? (
            <Link href="/master-donation-lists" className="hover:text-slate-900">
              Master donation lists
            </Link>
          ) : null}
          <Link href="/profile" className="hover:text-slate-900">
            Profile
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
