import Link from "next/link";

import { NewDonationListForm } from "./new-donation-list-form";

export default function NewDonationListPage() {
  return (
    <main>
      <Link
        href="/donation-lists"
        className="text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Back to donation lists
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        New donation list
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Enter a name. Status starts as &quot;Not submitted&quot; and the
        creation time is set automatically.
      </p>
      <NewDonationListForm />
    </main>
  );
}
