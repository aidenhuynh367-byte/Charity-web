import Link from "next/link";
import { Role } from "@prisma/client";

import { logoutAction } from "@/app/actions/auth";
import { CharityPhotoGrid } from "@/components/charity-photo-grid";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { t } from "@/i18n/t";
import { requireUserId, getOrCreateProfile } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

import { ProfileEditForm } from "./profile-edit-form";

export default async function ProfilePage() {
  const userId = await requireUserId();
  const profile = await getOrCreateProfile(userId);
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const charityImages =
    profile.role === Role.CHARITY_ORGANIZATION
      ? await prisma.charityImage.findMany({
          where: { charityId: userId },
          orderBy: { createdAt: "desc" },
          select: { id: true, imageUrl: true, caption: true },
        })
      : [];

  return (
    <main>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t(dict, "profile.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {t(dict, "profile.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {profile.role === Role.CHARITY_ORGANIZATION ? (
            <>
              <Link
                href="/thank-you"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                {t(dict, "profile.thankYou")}
              </Link>
              <Link
                href={`/profile/${userId}/photos`}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                {t(dict, "profile.gotoPhotos")}
              </Link>
            </>
          ) : null}
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              {t(dict, "profile.signOut")}
            </button>
          </form>
        </div>
      </div>
      <ProfileEditForm role={profile.role!} initial={profile} />
      {profile.role === Role.CHARITY_ORGANIZATION ? (
        <section className="mt-10 border-t border-slate-200 pt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            {t(dict, "profile.photosTitle")}
          </h2>
          <CharityPhotoGrid images={charityImages} />
        </section>
      ) : null}
    </main>
  );
}
