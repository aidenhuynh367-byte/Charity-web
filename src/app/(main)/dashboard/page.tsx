import Link from "next/link";

import { WelcomeSlideshow } from "@/app/onboarding/role/welcome-slideshow";
import { ShareWidget } from "@/components/share-widget";
import { appPublicOrigin } from "@/lib/app-public-url";
import { requireUserId, getOrCreateProfile } from "@/lib/auth-server";

export default async function DashboardPage() {
  const userId = await requireUserId();
  const profile = await getOrCreateProfile(userId);

  const isCharity = profile.role === "CHARITY_ORGANIZATION";
  const title = isCharity ? profile.organizationName : profile.displayName;
  const contributorName = profile.displayName?.trim() || "Contributor";
  const appUrl = appPublicOrigin();

  return (
    <main>
      <h1 className="text-2xl font-bold text-slate-900">Welcome</h1>
      {isCharity ? (
        <>
          <p className="mt-2 text-slate-600">
            You are signed in as a <strong>Charity organization</strong>
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
            page to view or edit your details.
          </p>
        </>
      ) : (
        <>
          <p className="mt-6 text-slate-700">
            Hi {contributorName}, thank you for using the Charity Link app.
            Charity Link helps connect you with a local charity to help you
            donate your gently used items to help those in need. There are many
            local orphanages that need your kindness and support to help all
            the children in need. Please give whatever you can, every little
            bit helps.
          </p>
          <p className="mt-4 text-slate-700">
            Thanks again and please spread the word and share this to your
            friends, family, community!
          </p>
          <ShareWidget url={appUrl} />
          <WelcomeSlideshow />
        </>
      )}
    </main>
  );
}
