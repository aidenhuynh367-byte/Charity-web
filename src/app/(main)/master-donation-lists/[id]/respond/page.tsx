import Link from "next/link";
import { notFound } from "next/navigation";
import { DonationListItemReviewStatus, DonationListStatus } from "@prisma/client";

import { requireCharityOrganization } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

import { CharityResponseForm } from "./charity-response-form";

type Props = { params: Promise<{ id: string }> };

export default async function RespondToContributorPage({ params }: Props) {
  const { id } = await params;
  await requireCharityOrganization();

  const list = await prisma.donationList.findFirst({
    where: { id, status: DonationListStatus.SUBMITTED },
    include: { items: true },
  });
  if (!list) notFound();

  if (list.items.length === 0) {
    notFound();
  }
  const allReviewed = list.items.every(
    (i) => i.reviewStatus === DonationListItemReviewStatus.REVIEWED,
  );
  if (!allReviewed) {
    notFound();
  }

  return (
    <main>
      <Link
        href="/master-donation-lists"
        className="text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Back to master donation lists
      </Link>
      <Link
        href={`/master-donation-lists/${list.id}`}
        className="ml-4 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        View list
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        Respond To Contributor
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        List: <span className="font-medium text-slate-800">{list.name}</span>
      </p>
      {list.charityRespondedAt ? (
        <p className="mt-2 text-xs text-slate-500">
          Last updated {list.charityRespondedAt.toLocaleString()}
        </p>
      ) : null}
      <CharityResponseForm
        key={list.charityRespondedAt?.toISOString() ?? "draft"}
        listId={list.id}
        defaultMessage={list.charityResponseMessage ?? ""}
      />
    </main>
  );
}
