import { DonationListStatus } from "@prisma/client";
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

type Props = { params: Promise<{ listId: string }> };

export default async function ContributorThankYouPage({ params }: Props) {
  const { listId } = await params;
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const list = await prisma.donationList.findFirst({
    where: {
      id: listId,
      status: DonationListStatus.COMPLETED,
    },
    include: {
      contributor: { include: { profile: true } },
    },
  });
  if (!list) notFound();

  const imageSrc = thankYouImageForList(
    list.id,
    listDonationThankYouImages(),
  );
  const name = contributorLabel(list.contributor);

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">
        {t(dict, "contributorThankYou.title")}
      </h1>
      {imageSrc ? (
        <div className="relative mt-6 aspect-square w-full overflow-hidden rounded-xl bg-slate-100">
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="(max-width: 512px) 100vw, 512px"
            className="object-cover"
            priority
          />
        </div>
      ) : null}
      <p className="mt-6 text-center text-lg text-slate-800">
        {t(dict, "contributorThankYou.message", { name })}
      </p>
      <p className="mt-8 text-center text-sm text-slate-600">
        <Link
          href={`/contributor-thank-you/${list.id}/share`}
          className="font-medium underline hover:text-slate-900"
        >
          {t(dict, "contributorThankYou.shareLink")}
        </Link>
      </p>
      <p className="mt-4 text-center text-sm">
        <a
          href="https://thecharitylink.org"
          className="font-medium text-slate-900 underline hover:text-slate-700"
        >
          {t(dict, "brand.name")}
        </a>
      </p>
    </div>
  );
}
