import {
  DonationListItemCharityDecision,
  DonationListStatus,
} from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { t, type Dictionary } from "@/i18n/t";
import { requireCharityOrganization } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

import { CharityItemReviewForm } from "../charity-item-review-form";

function charityDecisionLabel(
  dict: Dictionary,
  decision: DonationListItemCharityDecision,
) {
  return decision === DonationListItemCharityDecision.ACCEPT
    ? t(dict, "decision.accept")
    : t(dict, "decision.notAccept");
}

function contributorLabel(
  dict: Dictionary,
  user: {
    name: string | null;
    email: string | null;
    profile: { displayName: string | null } | null;
  },
) {
  const fromProfile = user.profile?.displayName?.trim();
  if (fromProfile) return fromProfile;
  const fromName = user.name?.trim();
  if (fromName) return fromName;
  if (user.email) return user.email;
  return t(dict, "masterLists.contributorFallback");
}

type Props = { params: Promise<{ id: string }> };

export default async function MasterDonationListDetailPage({ params }: Props) {
  const { id } = await params;
  const { userId } = await requireCharityOrganization();
  const locale = await getLocale();
  const dict = await getDictionary(locale);

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
        {t(dict, "masterLists.back")}
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">{list.name}</h1>
      </div>
      <dl className="mt-6 space-y-3 text-sm">
        <div>
          <dt className="font-medium text-slate-500">
            {t(dict, "masterLists.fieldStatus")}
          </dt>
          <dd className="text-slate-900">{t(dict, `status.${list.status}`)}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">
            {t(dict, "masterLists.fieldCreated")}
          </dt>
          <dd className="text-slate-900">{list.createdAt.toLocaleString()}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">
            {t(dict, "masterLists.fieldContributor")}
          </dt>
          <dd className="text-slate-900">
            <Link
              href={`/profile/${list.contributorId}`}
              className="font-medium underline hover:text-slate-700"
            >
              {contributorLabel(dict, list.contributor)}
            </Link>
          </dd>
        </div>
      </dl>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">
          {t(dict, "masterLists.itemsTitle")}
        </h2>
        {list.items.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            {t(dict, "masterLists.itemsEmpty")}
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
                      {t(dict, "masterLists.itemAdded", {
                        date: item.createdAt.toLocaleString(),
                      })}
                    </p>
                    {list.status === DonationListStatus.SUBMITTED ? (
                      <CharityItemReviewForm
                        itemId={item.id}
                        charityDecision={item.charityDecision}
                      />
                    ) : item.charityDecision ? (
                      <p className="mt-3 border-t border-slate-100 pt-3 text-xs font-medium text-slate-600">
                        {t(dict, "masterLists.yourReview")}{" "}
                        <span className="text-slate-900">
                          {charityDecisionLabel(dict, item.charityDecision)}
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
