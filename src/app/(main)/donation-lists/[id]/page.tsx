import { DonationListItemCharityDecision, DonationListStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteDonationListItem } from "@/app/actions/donation-list-items";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { t, type Dictionary } from "@/i18n/t";
import { requireContributor } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

function charityDecisionLabel(
  dict: Dictionary,
  decision: DonationListItemCharityDecision,
) {
  return decision === DonationListItemCharityDecision.ACCEPT
    ? t(dict, "decision.accept")
    : t(dict, "decision.notAccept");
}

type Props = { params: Promise<{ id: string }> };

export default async function DonationListDetailPage({ params }: Props) {
  const { id } = await params;
  const { userId } = await requireContributor();
  const locale = await getLocale();
  const dict = await getDictionary(locale);

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
        {t(dict, "donationLists.back")}
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">{list.name}</h1>
        {list.status === DonationListStatus.NOT_SUBMITTED ? (
          <Link
            href={`/donation-lists/${id}/items/new`}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            {t(dict, "donationLists.addItem")}
          </Link>
        ) : null}
      </div>
      <dl className="mt-6 space-y-3 text-sm">
        <div>
          <dt className="font-medium text-slate-500">
            {t(dict, "donationLists.fieldStatus")}
          </dt>
          <dd className="text-slate-900">{t(dict, `status.${list.status}`)}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">
            {t(dict, "donationLists.fieldCreated")}
          </dt>
          <dd className="text-slate-900">
            {list.createdAt.toLocaleString()}
          </dd>
        </div>
      </dl>
      {(list.status === DonationListStatus.REVIEWED ||
        list.status === DonationListStatus.COMPLETED) &&
      list.charityResponseMessage ? (
        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
          <p className="font-medium text-slate-500">
            {t(dict, "donationLists.messageFromCharity")}
          </p>
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
        <h2 className="text-lg font-semibold text-slate-900">
          {t(dict, "donationLists.itemsTitle")}
        </h2>
        {list.items.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            {t(dict, "donationLists.itemsEmpty")}
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
                      {t(dict, "donationLists.itemAdded", {
                        date: item.createdAt.toLocaleString(),
                      })}
                    </p>
                    {list.status === DonationListStatus.REVIEWED ||
                    list.status === DonationListStatus.COMPLETED ? (
                      <p className="mt-3 text-sm font-medium text-slate-800">
                        {t(dict, "donationLists.charityResponse")}{" "}
                        <span className="font-semibold text-slate-900">
                          {item.charityDecision
                            ? charityDecisionLabel(dict, item.charityDecision)
                            : t(dict, "common.emDash")}
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
                          {t(dict, "donationLists.removeItem")}
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
