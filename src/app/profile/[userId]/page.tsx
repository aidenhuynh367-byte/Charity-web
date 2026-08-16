import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Role, type Profile } from "@prisma/client";
import { getCountryCallingCode, type CountryCode } from "libphonenumber-js";

import { auth } from "@/auth";
import { CharityPhotoGrid } from "@/components/charity-photo-grid";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { t, type Dictionary } from "@/i18n/t";
import { getOrCreateProfile } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { profileWhatsappToE164 } from "@/lib/profile-whatsapp-e164";

function formatPhoneLine(
  dict: Dictionary,
  country: string | null | undefined,
  national: string | null | undefined,
): string {
  const c = country?.trim();
  const n = national?.trim();
  if (!c || !n) return t(dict, "common.emDash");
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
  const session = await auth();
  const viewerId = session?.user?.id ?? null;
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: { profile: true },
  });

  if (!target?.profile?.role) {
    notFound();
  }

  if (viewerId === targetUserId) {
    redirect("/profile");
  }

  const targetRole = target.profile.role;

  if (targetRole === Role.CHARITY_ORGANIZATION) {
    const images = await prisma.charityImage.findMany({
      where: { charityId: targetUserId },
      orderBy: { createdAt: "desc" },
      select: { id: true, imageUrl: true, caption: true },
    });
    const viewerProfile = viewerId
      ? await getOrCreateProfile(viewerId)
      : null;
    return (
      <CharityProfileReadOnly
        dict={dict}
        charityId={targetUserId}
        backHref={
          viewerProfile?.role === Role.CONTRIBUTOR ? "/donation-lists" : "/"
        }
        organizationName={
          target.profile.organizationName?.trim() ||
          target.name?.trim() ||
          t(dict, "publicProfile.charityFallback")
        }
        profile={target.profile}
        images={images}
      />
    );
  }

  if (!viewerId) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent(`/profile/${targetUserId}`)}`,
    );
  }

  const viewerProfile = await getOrCreateProfile(viewerId);

  if (
    viewerProfile.role === Role.CHARITY_ORGANIZATION &&
    targetRole === Role.CONTRIBUTOR
  ) {
    return (
      <ContributorProfileReadOnly
        dict={dict}
        displayName={
          target.profile.displayName?.trim() ||
          target.name?.trim() ||
          target.email ||
          t(dict, "publicProfile.contributorFallback")
        }
        profile={target.profile}
      />
    );
  }

  redirect("/dashboard");
}

function ContributorProfileReadOnly({
  dict,
  displayName,
  profile,
}: {
  dict: Dictionary;
  displayName: string;
  profile: Profile;
}) {
  const whatsappLabel = formatPhoneLine(
    dict,
    profile.contributorWhatsappCountry,
    profile.contributorWhatsappNationalNumber,
  );
  const whatsappE164 = profileWhatsappToE164(
    profile.contributorWhatsappCountry,
    profile.contributorWhatsappNationalNumber,
  );

  return (
    <main>
      <Link
        href="/master-donation-lists"
        className="text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        {t(dict, "publicProfile.contributorBack")}
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t(dict, "publicProfile.contributorTitle")}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {t(dict, "publicProfile.contributorSubtitle")}
          </p>
        </div>
      </div>

      <dl className="mt-8 space-y-4 text-sm">
        <div>
          <dt className="font-medium text-slate-500">
            {t(dict, "publicProfile.name")}
          </dt>
          <dd className="text-slate-900">{displayName}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">
            {t(dict, "publicProfile.whatsapp")}
          </dt>
          <dd className="text-slate-900">
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
      </dl>
    </main>
  );
}

function CharityProfileReadOnly({
  dict,
  charityId,
  backHref,
  organizationName,
  profile,
  images,
}: {
  dict: Dictionary;
  charityId: string;
  backHref: string;
  organizationName: string;
  profile: Profile;
  images: { id: string; imageUrl: string; caption: string | null }[];
}) {
  const address = profile.address?.trim() || "";
  const email = profile.charityEmail?.trim() || "";
  const phoneLabel = formatPhoneLine(
    dict,
    profile.phoneCountry,
    profile.phoneNationalNumber,
  );
  const phoneE164 = profileWhatsappToE164(
    profile.phoneCountry,
    profile.phoneNationalNumber,
  );
  const whatsappLabel = formatPhoneLine(
    dict,
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
        href={backHref}
        className="text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        {t(dict, "publicProfile.charityBack")}
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t(dict, "publicProfile.charityTitle")}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {t(dict, "publicProfile.charitySubtitle")}
          </p>
        </div>
      </div>

      <dl className="mt-8 space-y-4 text-sm">
        <div>
          <dt className="font-medium text-slate-500">
            {t(dict, "publicProfile.orgName")}
          </dt>
          <dd className="text-slate-900">{organizationName}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">
            {t(dict, "publicProfile.address")}
          </dt>
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
              t(dict, "common.emDash")
            )}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">
            {t(dict, "publicProfile.location")}
          </dt>
          <dd className="text-slate-900">
            {profile.charityLocation?.trim() || t(dict, "common.emDash")}
          </dd>
        </div>
        <div>
          <dt className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-base font-bold text-slate-900">
            <span>{t(dict, "publicProfile.whatsapp")}</span>
            <span className="text-base font-bold text-red-600">
              {t(dict, "publicProfile.whatsappHint")}
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
          <dt className="font-medium text-slate-500">
            {t(dict, "publicProfile.phone")}
          </dt>
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
          <dt className="font-medium text-slate-500">
            {t(dict, "publicProfile.email")}
          </dt>
          <dd className="text-slate-900">
            {email ? (
              <a
                href={`mailto:${email}`}
                className="underline hover:text-slate-700"
              >
                {email}
              </a>
            ) : (
              t(dict, "common.emDash")
            )}
          </dd>
        </div>
      </dl>

      <section className="mt-10 border-t border-slate-200 pt-8">
        <Link
          href={`/profile/${charityId}/thank-yous`}
          className="inline-flex rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          {t(dict, "publicProfile.thankYous")}
        </Link>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">
          {t(dict, "publicProfile.photos")}
        </h2>
        <CharityPhotoGrid images={images} />
      </section>
    </main>
  );
}
