import { DonationListItemCharityDecision, DonationListStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteDonationListItem } from "@/app/actions/donation-list-items";
import { requireContributor } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

function formatStatus(status: string) {
  return status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function charityDecisionLabel(decision: DonationListItemCharityDecision) {
  return decision === DonationListItemCharityDecision.ACCEPT
    ? "Accept"
    : "Not Accept";
}

type Props = { params: Promise<{ id: string }> };

export default async function DonationListDetailPage({ params }: Props) {
  const { id } = await params;
  const { userId } = await requireContributor();

  const list = await prisma.donationList.findFirst({
    where: { id, contributorId: userId },
    include: {
      items: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!list) notFound();

  return (
    <main>
      <Link
        href="/donation-lists"
        className="text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Back to donation lists
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">{list.name}</h1>
        {list.status === DonationListStatus.NOT_SUBMITTED ? (
          <Link
            href={`/donation-lists/${id}/items/new`}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Add donation list item
          </Link>
        ) : null}
      </div>
      <dl className="mt-6 space-y-3 text-sm">
        <div>
          <dt className="font-medium text-slate-500">Status</dt>
          <dd className="text-slate-900">{formatStatus(list.status)}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Created</dt>
          <dd className="text-slate-900">
            {list.createdAt.toLocaleString()}
          </dd>
        </div>
      </dl>
      {(list.status === DonationListStatus.REVIEWED ||
        list.status === DonationListStatus.COMPLETED) &&
      list.charityResponseMessage ? (
        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
          <p className="font-medium text-slate-500">Message from charity</p>
          <p className="mt-1 whitespace-pre-wrap text-slate-900">
            {list.charityResponseMessage}
          </p>
          {list.charityRespondedAt ? (
            <p className="mt-2 text-xs text-slate-500">
              {list.charityRespondedAt.toLocaleString()}
            </p>
          ) : null}
        </div>
      ) : null}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Items</h2>
        {list.items.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            No items yet. Use &quot;Add donation list item&quot; to add one.
          </p>
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
                    {list.status === DonationListStatus.REVIEWED ||
                    list.status === DonationListStatus.COMPLETED ? (
                      <p className="mt-3 text-sm font-medium text-slate-800">
                        Charity response:{" "}
                        <span className="font-semibold text-slate-900">
                          {item.charityDecision
                            ? charityDecisionLabel(item.charityDecision)
                            : "—"}
                        </span>
                      </p>
                    ) : null}
                    {list.status === DonationListStatus.NOT_SUBMITTED ? (
                      <form action={deleteDonationListItem} className="mt-3">
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          type="submit"
                          className="rounded border border-red-200 bg-white px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                        >
                          Remove item
                        </button>
                      </form>
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
