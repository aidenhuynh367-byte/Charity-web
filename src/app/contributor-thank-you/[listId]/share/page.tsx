import { DonationListStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ShareWidget } from "@/components/share-widget";
import { contributorLabel } from "@/lib/contributor-label";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ listId: string }> };

export default async function ContributorThankYouSharePage({ params }: Props) {
  const { listId } = await params;

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
  const shareText = `You can continue ${name}'s kindness and help those in need. Join TheCharityLink.org`;
  const homeUrl = "https://thecharitylink.org";

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-10">
      <Link
        href={`/contributor-thank-you/${list.id}`}
        className="text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Back
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Share kindness</h1>
      <p className="mt-2 text-sm text-slate-600">
        Share this message with your friends and community.
      </p>
      <ShareWidget url={homeUrl} title="TheCharityLink.org" text={shareText} />
    </div>
  );
}
