import { DonationListStatus } from "@prisma/client";
import Link from "next/link";

import {
  deleteDonationList,
  submitDonationList,
} from "@/app/actions/donation-lists";
import { PendingActionForm } from "@/components/pending-action-form";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { t } from "@/i18n/t";
import { requireContributor } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export default async function DonationListsPage() {
  const { userId } = await requireContributor();
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const lists = await prisma.donationList.findMany({
    where: { contributorId: userId },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      charity: {
        include: { profile: true },
      },
      _count: {
        select: { items: true },
      },
    },
  });

  return (
    <main>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t(dict, "donationLists.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {t(dict, "donationLists.subtitle")}
          </p>
        </div>
        <Link
          href="/donation-lists/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          {t(dict, "donationLists.new")}
        </Link>
      </div>

      {lists.length === 0 ? (
        <p className="mt-10 text-sm text-slate-600">
          {t(dict, "donationLists.empty")}{" "}
          <Link className="font-medium underline" href="/donation-lists/new">
            {t(dict, "donationLists.createOne")}
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {lists.map((list) => (
            <li
              key={list.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/donation-lists/${list.id}`}
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
                          : list.status === DonationListStatus.SUBMITTED
                            ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                            : "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900"
                    }
                    title={t(dict, "donationLists.fieldStatus")}
                  >
                    {t(dict, `status.${list.status}`)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {t(dict, "donationLists.created", {
                    date: list.createdAt.toLocaleString(),
                  })}
                </p>
                {list.charityId && list.charity ? (
                  <p className="mt-1 text-xs text-slate-600">
                    {t(dict, "donationLists.charityLabel")}{" "}
                    <Link
                      href={`/profile/${list.charityId}`}
                      className="font-medium text-slate-900 underline hover:text-slate-700"
                    >
                      {list.charity.profile?.organizationName?.trim() ||
                        list.charity.name?.trim() ||
                        t(dict, "donationLists.charityFallback")}
                    </Link>
                  </p>
                ) : null}
                {(list.status === DonationListStatus.REVIEWED ||
                  list.status === DonationListStatus.COMPLETED) &&
                list.charityResponseMessage ? (
                  <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800">
                    <p className="font-medium text-slate-600">
                      {t(dict, "donationLists.messageFromCharity")}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">
                      {list.charityResponseMessage}
                    </p>
                    {list.charityRespondedAt ? (
                      <p className="mt-2 text-slate-500">
                        {list.charityRespondedAt.toLocaleString()}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(list.status === DonationListStatus.REVIEWED ||
                  list.status === DonationListStatus.COMPLETED) &&
                list.charityId ? (
                  <Link
                    href={`/profile/${list.charityId}`}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                  >
                    {t(dict, "donationLists.contactCharity")}
                  </Link>
                ) : null}
                {list.status === DonationListStatus.NOT_SUBMITTED &&
                list._count.items > 0 ? (
                  <PendingActionForm
                    action={submitDonationList}
                    hiddenFields={{ id: list.id }}
                    buttonClassName="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    {t(dict, "donationLists.submit")}
                  </PendingActionForm>
                ) : null}
                {list.status === DonationListStatus.NOT_SUBMITTED ? (
                  <PendingActionForm
                    action={deleteDonationList}
                    hiddenFields={{ id: list.id }}
                    buttonClassName="rounded border border-red-200 bg-white px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    {t(dict, "donationLists.remove")}
                  </PendingActionForm>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
