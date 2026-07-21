import {
  DonationListItemCharityDecision,
  DonationListStatus,
} from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireCharityOrganization } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

import { CharityItemReviewForm } from "../charity-item-review-form";

function formatStatus(status: string) {
  return status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function charityDecisionLabel(decision: DonationListItemCharityDecision) {
  return decision === DonationListItemCharityDecision.ACCEPT
    ? "Accept"
    : "Not Accept";
}

function contributorLabel(user: {
  name: string | null;
  email: string | null;
  profile: { displayName: string | null } | null;
}) {
  const fromProfile = user.profile?.displayName?.trim();
  if (fromProfile) return fromProfile;
  const fromName = user.name?.trim();
  if (fromName) return fromName;
  if (user.email) return user.email;
  return "Contributor";
}

type Props = { params: Promise<{ id: string }> };

export default async function MasterDonationListDetailPage({ params }: Props) {
  const { id } = await params;
  const { userId } = await requireCharityOrganization();

  const list = await prisma.donationList.findFirst({
    where: {
      id,
      charityId: userId,
      status: {
        in: [
          DonationListStatus.SUBMITTED,
          DonationListStatus.REVIEWED,
          DonationListStatus.COMPLETED,
        ],
      },
    },
    include: {
      items: { orderBy: { createdAt: "desc" } },
      contributor: { include: { profile: true } },
    },
  });
  if (!list) notFound();

  return (
    <main>
      <Link
        href="/master-donation-lists"
        className="text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Back to master donation lists
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">{list.name}</h1>
      </div>
      <dl className="mt-6 space-y-3 text-sm">
        <div>
          <dt className="font-medium text-slate-500">Status</dt>
          <dd className="text-slate-900">{formatStatus(list.status)}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Created</dt>
          <dd className="text-slate-900">{list.createdAt.toLocaleString()}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Contributor</dt>
          <dd className="text-slate-900">
            <Link
              href={`/profile/${list.contributorId}`}
              className="font-medium underline hover:text-slate-700"
            >
              {contributorLabel(list.contributor)}
            </Link>
          </dd>
        </div>
      </dl>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Items</h2>
        {list.items.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">This list has no items.</p>
        ) : (
          <ul className="mt-4 space-y-6">
            {list.items.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-wrap gap-4">
                  <div className="flex flex-wrap gap-2">
                    {item.imageUrl1 ? (
                      // eslint-disable-next-line @next/next/no-img-element -- user uploads from public/
                      <img
                        src={item.imageUrl1}
                        alt=""
                        className="h-28 w-28 rounded border border-slate-100 object-cover"
                      />
                    ) : null}
                    {item.imageUrl2 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl2}
                        alt=""
                        className="h-28 w-28 rounded border border-slate-100 object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="whitespace-pre-wrap text-sm text-slate-800">
                      {item.description}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Added {item.createdAt.toLocaleString()}
                    </p>
                    {list.status === DonationListStatus.SUBMITTED ? (
                      <CharityItemReviewForm
                        itemId={item.id}
                        charityDecision={item.charityDecision}
                      />
                    ) : item.charityDecision ? (
                      <p className="mt-3 border-t border-slate-100 pt-3 text-xs font-medium text-slate-600">
                        Your review:{" "}
                        <span className="text-slate-900">
                          {charityDecisionLabel(item.charityDecision)}
                        </span>
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
