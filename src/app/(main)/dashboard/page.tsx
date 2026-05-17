import Link from "next/link";

import { requireUserId, getOrCreateProfile } from "@/lib/auth-server";

export default async function DashboardPage() {
  const userId = await requireUserId();
  const profile = await getOrCreateProfile(userId);

  const roleLabel =
    profile.role === "CHARITY_ORGANIZATION"
      ? "Charity organization"
      : "Contributor";

  const title =
    profile.role === "CHARITY_ORGANIZATION"
      ? profile.organizationName
      : profile.displayName;

  return (
    <main>
      <h1 className="text-2xl font-bold text-slate-900">Welcome</h1>
      <p className="mt-2 text-slate-600">
        You are signed in as a <strong>{roleLabel}</strong>
        {title ? (
          <>
            : <strong>{title}</strong>
          </>
        ) : null}
        .
      </p>
      <p className="mt-6 text-sm text-slate-500">
        Use the{" "}
        <Link className="underline" href="/profile">
          profile
        </Link>{" "}
        page to view
        or edit your details.
      </p>
    </main>
  );
}
