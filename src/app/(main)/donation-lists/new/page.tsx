import Link from "next/link";

import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { t } from "@/i18n/t";

import { NewDonationListForm } from "./new-donation-list-form";

export default async function NewDonationListPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <main>
      <Link
        href="/donation-lists"
        className="text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        {t(dict, "donationLists.back")}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        {t(dict, "donationLists.newTitle")}
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        {t(dict, "donationLists.newHelp")}
      </p>
      <NewDonationListForm />
    </main>
  );
}
