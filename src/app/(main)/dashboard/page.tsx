import Link from "next/link";

import { ShareWidget } from "@/components/share-widget";
import { appPublicOrigin } from "@/lib/app-public-url";
import { requireUserId, getOrCreateProfile } from "@/lib/auth-server";

import { HowItWorksWizard } from "./how-it-works-wizard";

export default async function DashboardPage() {
  const userId = await requireUserId();
  const profile = await getOrCreateProfile(userId);

  const isCharity = profile.role === "CHARITY_ORGANIZATION";
  const title = isCharity ? profile.organizationName : profile.displayName;
  const contributorName = profile.displayName?.trim() || "Contributor";
  const appUrl = appPublicOrigin();

  return (
    <main>
      {isCharity ? (
        <>
          <h1 className="text-2xl font-bold text-slate-900">Welcome</h1>
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
          <Link
            href="/donation-lists/new"
            className="inline-flex rounded-lg bg-slate-900 px-5 py-3 text-base font-medium text-white hover:bg-slate-800"
          >
            Start Donating
          </Link>
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
          <HowItWorksWizard />
          <div className="mt-10">
            <ShareWidget url={appUrl} />
          </div>
        </>
      )}
    </main>
  );
}
