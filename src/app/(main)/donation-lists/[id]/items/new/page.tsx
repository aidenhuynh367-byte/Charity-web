import { DonationListStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { t } from "@/i18n/t";
import { requireContributor } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

import { NewDonationListItemForm } from "./new-donation-list-item-form";

type Props = { params: Promise<{ id: string }> };

export default async function NewDonationListItemPage({ params }: Props) {
  const { id } = await params;
  const { userId } = await requireContributor();
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const list = await prisma.donationList.findFirst({
    where: { id, contributorId: userId },
  });
  if (!list) notFound();
  if (list.status !== DonationListStatus.NOT_SUBMITTED) notFound();

  return (
    <main>
      <Link
        href={`/donation-lists/${id}`}
        className="text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        {t(dict, "donationLists.itemBack")}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        {t(dict, "donationLists.addItemTitle")}
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        {t(dict, "donationLists.addItemHelp")}
      </p>
      <NewDonationListItemForm donationListId={id} />
    </main>
  );
}
