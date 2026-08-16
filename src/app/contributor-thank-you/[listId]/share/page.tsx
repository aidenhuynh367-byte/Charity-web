import { DonationListStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ShareWidget } from "@/components/share-widget";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { t } from "@/i18n/t";
import { contributorLabel } from "@/lib/contributor-label";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ listId: string }> };

export default async function ContributorThankYouSharePage({ params }: Props) {
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

  const name = contributorLabel(list.contributor);
  const shareText = t(dict, "contributorThankYou.shareText", { name });
  const homeUrl = "https://thecharitylink.org";

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-10">
      <Link
        href={`/contributor-thank-you/${list.id}`}
        className="text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        {t(dict, "contributorThankYou.shareBack")}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        {t(dict, "contributorThankYou.shareTitle")}
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        {t(dict, "contributorThankYou.shareSubtitle")}
      </p>
      <ShareWidget
        url={homeUrl}
        title={t(dict, "brand.name")}
        text={shareText}
      />
    </div>
  );
}
