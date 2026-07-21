import {
  DonationListItemReviewStatus,
  DonationListStatus,
} from "@prisma/client";
import Link from "next/link";

import { giveThanksForDonationList } from "@/app/actions/donation-list-thanks";
import { requireCharityOrganization } from "@/lib/auth-server";
import { contributorLabel } from "@/lib/contributor-label";
import { prisma } from "@/lib/prisma";

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export default async function MasterDonationListsPage() {
  const { userId } = await requireCharityOrganization();

  const lists = await prisma.donationList.findMany({
    where: {
      charityId: userId,
      status: {
        in: [
          DonationListStatus.SUBMITTED,
          DonationListStatus.REVIEWED,
          DonationListStatus.COMPLETED,
        ],
      },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      contributor: {
        include: { profile: true },
      },
      items: { select: { reviewStatus: true } },
    },
  });

  return (
    <main>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Master donation lists
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Submitted donation lists from contributors.
          </p>
        </div>
      </div>

      {lists.length === 0 ? (
        <p className="mt-10 text-sm text-slate-600">
          No submitted donation lists yet.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {lists.map((list) => {
            const canRespondToContributor =
              list.status === DonationListStatus.SUBMITTED &&
              list.items.length > 0 &&
              list.items.every(
                (i) => i.reviewStatus === DonationListItemReviewStatus.REVIEWED,
              );
            const canGiveThanks =
              list.status === DonationListStatus.REVIEWED;
            return (
              <li
                key={list.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/master-donation-lists/${list.id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {list.name}
                    </Link>
                    <span
                      className={
                        list.status === DonationListStatus.COMPLETED
                          ? "rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-900"
                          : list.status === DonationListStatus.REVIEWED
                            ? "rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-900"
                            : "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                      }
                      title="Status"
                    >
                      {formatStatus(list.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Created {list.createdAt.toLocaleString()}
                  </p>
                  {list.completedAt ? (
                    <p className="mt-1 text-xs text-slate-500">
                      Completed {list.completedAt.toLocaleString()}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-slate-600">
                    Contributor:{" "}
                    <Link
                      href={`/profile/${list.contributorId}`}
                      className="font-medium text-slate-900 underline hover:text-slate-700"
                    >
                      {contributorLabel(list.contributor)}
                    </Link>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {canRespondToContributor ? (
                    <Link
                      href={`/master-donation-lists/${list.id}/respond`}
                      className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                    >
                      Respond To Contributor
                    </Link>
                  ) : null}
                  {canGiveThanks ? (
                    <form action={giveThanksForDonationList}>
                      <input type="hidden" name="id" value={list.id} />
                      <button
                        type="submit"
                        className="shrink-0 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
                      >
                        Give Thanks
                      </button>
                    </form>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
