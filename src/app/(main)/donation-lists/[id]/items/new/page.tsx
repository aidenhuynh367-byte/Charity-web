import { DonationListStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireContributor } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

import { NewDonationListItemForm } from "./new-donation-list-item-form";

type Props = { params: Promise<{ id: string }> };

export default async function NewDonationListItemPage({ params }: Props) {
  const { id } = await params;
  const { userId } = await requireContributor();

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
        ← Back to list
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        Add donation list item
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Enter a description and at least one image. You will return to your
        donation list after saving.
      </p>
      <NewDonationListItemForm donationListId={id} />
    </main>
  );
}
