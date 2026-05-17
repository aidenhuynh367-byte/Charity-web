import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Role, type Profile } from "@prisma/client";
import { getCountryCallingCode, type CountryCode } from "libphonenumber-js";

import { requireUserId, getOrCreateProfile } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

function formatContributorWhatsappLine(profile: Profile): string {
  const c = profile.contributorWhatsappCountry?.trim();
  const n = profile.contributorWhatsappNationalNumber?.trim();
  if (!c || !n) return "—";
  const cc = c.toUpperCase() as CountryCode;
  try {
    const dial = getCountryCallingCode(cc);
    return `+${dial} ${n}`;
  } catch {
    return `${c} ${n}`;
  }
}

type Props = { params: Promise<{ userId: string }> };

export default async function ContributorProfileReadOnlyPage({ params }: Props) {
  const { userId: targetUserId } = await params;
  const viewerId = await requireUserId();
  const viewerProfile = await getOrCreateProfile(viewerId);

  if (viewerProfile.role !== Role.CHARITY_ORGANIZATION) {
    redirect("/dashboard");
  }

  if (targetUserId === viewerId) {
    redirect("/profile");
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: { profile: true },
  });

  if (!target?.profile || target.profile.role !== Role.CONTRIBUTOR) {
    notFound();
  }

  const displayName =
    target.profile.displayName?.trim() ||
    target.name?.trim() ||
    target.email ||
    "Contributor";

  return (
    <main>
      <Link
        href="/master-donation-lists"
        className="text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Back to master donation lists
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Contributor profile
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Read-only view. This page is visible to charity organizations only.
          </p>
        </div>
      </div>

      <dl className="mt-8 space-y-4 text-sm">
        <div>
          <dt className="font-medium text-slate-500">Name</dt>
          <dd className="text-slate-900">{displayName}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">WhatsApp number</dt>
          <dd className="text-slate-900">
            {formatContributorWhatsappLine(target.profile)}
          </dd>
        </div>
      </dl>
    </main>
  );
}
