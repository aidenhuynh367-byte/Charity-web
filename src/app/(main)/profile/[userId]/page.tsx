import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Role, type Profile } from "@prisma/client";
import { getCountryCallingCode, type CountryCode } from "libphonenumber-js";

import { requireUserId, getOrCreateProfile } from "@/lib/auth-server";
import { CharityPhotoGrid } from "@/components/charity-photo-grid";
import { prisma } from "@/lib/prisma";
import { profileWhatsappToE164 } from "@/lib/profile-whatsapp-e164";

function formatPhoneLine(
  country: string | null | undefined,
  national: string | null | undefined,
): string {
  const c = country?.trim();
  const n = national?.trim();
  if (!c || !n) return "—";
  const cc = c.toUpperCase() as CountryCode;
  try {
    const dial = getCountryCallingCode(cc);
    return `+${dial} ${n}`;
  } catch {
    return `${c} ${n}`;
  }
}

function googleMapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function whatsappChatUrl(e164: string): string {
  return `https://wa.me/${e164.replace(/\D/g, "")}`;
}

type Props = { params: Promise<{ userId: string }> };

export default async function ProfileReadOnlyPage({ params }: Props) {
  const { userId: targetUserId } = await params;
  const viewerId = await requireUserId();
  const viewerProfile = await getOrCreateProfile(viewerId);

  if (targetUserId === viewerId) {
    redirect("/profile");
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: { profile: true },
  });

  if (!target?.profile?.role) {
    notFound();
  }

  const targetRole = target.profile.role;
  const viewerRole = viewerProfile.role;

  if (
    viewerRole === Role.CHARITY_ORGANIZATION &&
    targetRole === Role.CONTRIBUTOR
  ) {
    return (
      <ContributorProfileReadOnly
        displayName={
          target.profile.displayName?.trim() ||
          target.name?.trim() ||
          target.email ||
          "Contributor"
        }
        profile={target.profile}
      />
    );
  }

  if (
    viewerRole === Role.CONTRIBUTOR &&
    targetRole === Role.CHARITY_ORGANIZATION
  ) {
    const images = await prisma.charityImage.findMany({
      where: { charityId: targetUserId },
      orderBy: { createdAt: "desc" },
      select: { id: true, imageUrl: true, caption: true },
    });
    return (
      <CharityProfileReadOnly
        organizationName={
          target.profile.organizationName?.trim() ||
          target.name?.trim() ||
          "Charity organization"
        }
        profile={target.profile}
        images={images}
      />
    );
  }

  redirect("/dashboard");
}

function ContributorProfileReadOnly({
  displayName,
  profile,
}: {
  displayName: string;
  profile: Profile;
}) {
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
            {formatPhoneLine(
              profile.contributorWhatsappCountry,
              profile.contributorWhatsappNationalNumber,
            )}
          </dd>
        </div>
      </dl>
    </main>
  );
}

function CharityProfileReadOnly({
  organizationName,
  profile,
  images,
}: {
  organizationName: string;
  profile: Profile;
  images: { id: string; imageUrl: string; caption: string | null }[];
}) {
  const address = profile.address?.trim() || "";
  const email = profile.charityEmail?.trim() || "";
  const phoneLabel = formatPhoneLine(
    profile.phoneCountry,
    profile.phoneNationalNumber,
  );
  const phoneE164 = profileWhatsappToE164(
    profile.phoneCountry,
    profile.phoneNationalNumber,
  );
  const whatsappLabel = formatPhoneLine(
    profile.charityWhatsappCountry,
    profile.charityWhatsappNationalNumber,
  );
  const whatsappE164 = profileWhatsappToE164(
    profile.charityWhatsappCountry,
    profile.charityWhatsappNationalNumber,
  );

  return (
    <main>
      <Link
        href="/donation-lists"
        className="text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Back to donation lists
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Charity organization profile
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Read-only view.
          </p>
        </div>
      </div>

      <dl className="mt-8 space-y-4 text-sm">
        <div>
          <dt className="font-medium text-slate-500">Organization name</dt>
          <dd className="text-slate-900">{organizationName}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Address</dt>
          <dd className="text-slate-900">
            {address ? (
              <a
                href={googleMapsSearchUrl(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-700"
              >
                {address}
              </a>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Location</dt>
          <dd className="text-slate-900">
            {profile.charityLocation?.trim() || "—"}
          </dd>
        </div>
        <div>
          <dt className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-base font-bold text-slate-900">
            <span>WhatsApp number</span>
            <span className="text-base font-bold text-red-600">
              Whatsapp is the preferred way to communicate with the charity
              organization.
            </span>
          </dt>
          <dd className="mt-1 text-base font-bold text-slate-900">
            {whatsappE164 ? (
              <a
                href={whatsappChatUrl(whatsappE164)}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-700"
              >
                {whatsappLabel}
              </a>
            ) : (
              whatsappLabel
            )}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Phone number</dt>
          <dd className="text-slate-900">
            {phoneE164 ? (
              <a
                href={`tel:${phoneE164}`}
                className="underline hover:text-slate-700"
              >
                {phoneLabel}
              </a>
            ) : (
              phoneLabel
            )}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Email</dt>
          <dd className="text-slate-900">
            {email ? (
              <a
                href={`mailto:${email}`}
                className="underline hover:text-slate-700"
              >
                {email}
              </a>
            ) : (
              "—"
            )}
          </dd>
        </div>
      </dl>

      <section className="mt-10 border-t border-slate-200 pt-8">
        <h2 className="text-lg font-semibold text-slate-900">Photos</h2>
        <CharityPhotoGrid images={images} />
      </section>
    </main>
  );
}
