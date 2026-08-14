import { DonationListStatus, Role } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { contributorLabel } from "@/lib/contributor-label";
import {
  listDonationThankYouImages,
  thankYouImageForList,
} from "@/lib/donation-thank-you-images";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ userId: string }> };

export default async function CharityThankYousPage({ params }: Props) {
  const { userId: targetUserId } = await params;

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
    "Charity";

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
        ← Back to charity profile
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        {charityName} thank-yous
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Contributors who completed donations with this organization.
      </p>

      {lists.length === 0 ? (
        <p className="mt-10 text-sm text-slate-600">
          No completed donation lists yet.
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
                    No image
                  </div>
                )}
                <p className="px-3 py-3 text-center text-sm text-slate-800">
                  Thank you {name} for your generosity.
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
