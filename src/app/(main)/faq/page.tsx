import Link from "next/link";

import { FAQ_ITEMS } from "@/lib/faq-content";

export default function FaqPage() {
  return (
    <main>
      <h1 className="text-2xl font-bold text-slate-900">FAQ</h1>
      <p className="mt-2 text-sm text-slate-600">
        Common questions about how Charity Link works.
      </p>

      <dl className="mt-8 space-y-6">
        {FAQ_ITEMS.map((item) => (
          <div key={item.question}>
            <dt className="text-base font-semibold text-slate-900">
              {item.question}
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-slate-700">
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-10 text-sm text-slate-500">
        Still have questions? Visit the{" "}
        <Link href="/about" className="underline hover:text-slate-800">
          About
        </Link>{" "}
        page or update your profile contact details so charities can reach you.
      </p>
    </main>
  );
}
