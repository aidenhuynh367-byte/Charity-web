import { DonationListStatus, Role } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { t } from "@/i18n/t";
import { contributorLabel } from "@/lib/contributor-label";
import {
  listDonationThankYouImages,
  thankYouImageForList,
} from "@/lib/donation-thank-you-images";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ userId: string }> };

export default async function CharityThankYousPage({ params }: Props) {
  const { userId: targetUserId } = await params;
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: { profile: true },
  });
  if (
    !target?.profile ||
    target.profile.role !== Role.CHARITY_ORGANIZATION
  ) {
    notFound();
  }

  const charityName =
    target.profile.organizationName?.trim() ||
    target.name?.trim() ||
    t(dict, "publicThankYous.fallbackName");

  const lists = await prisma.donationList.findMany({
    where: {
      charityId: targetUserId,
      status: DonationListStatus.COMPLETED,
    },
    orderBy: { completedAt: "desc" },
    include: {
      contributor: { include: { profile: true } },
    },
  });

  const thankYouImages = listDonationThankYouImages();

  return (
    <main>
      <Link
        href={`/profile/${targetUserId}`}
        className="text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        {t(dict, "publicThankYous.back")}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        {t(dict, "publicThankYous.title", { name: charityName })}
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        {t(dict, "publicThankYous.subtitle")}
      </p>

      {lists.length === 0 ? (
        <p className="mt-10 text-sm text-slate-600">
          {t(dict, "publicThankYous.empty")}
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => {
            const imageSrc = thankYouImageForList(list.id, thankYouImages);
            const name = contributorLabel(list.contributor);
            return (
              <Link
                key={list.id}
                href={`/contributor-thank-you/${list.id}`}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-slate-400"
              >
                {imageSrc ? (
                  <div className="relative aspect-square w-full bg-slate-50">
                    <Image
                      src={imageSrc}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-slate-100 text-sm text-slate-500">
                    {t(dict, "publicThankYous.noImage")}
                  </div>
                )}
                <p className="px-3 py-3 text-center text-sm text-slate-800">
                  {t(dict, "publicThankYous.card", { name })}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
