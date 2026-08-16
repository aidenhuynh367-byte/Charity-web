import Link from "next/link";

import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { t, type Dictionary } from "@/i18n/t";

type FaqItem = {
  q: string;
  a: string;
  whatsappE164?: string;
};

function faqItems(dict: Dictionary): FaqItem[] {
  const items = dict.faq;
  if (!items || typeof items === "string" || Array.isArray(items)) return [];
  const list = items.items;
  if (!Array.isArray(list)) return [];
  return list.filter((item): item is FaqItem => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return false;
    if (typeof item.q !== "string" || typeof item.a !== "string") return false;
    return true;
  });
}

export default async function FaqPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const items = faqItems(dict);

  return (
    <main>
      <h1 className="text-2xl font-bold text-slate-900">
        {t(dict, "faq.title")}
      </h1>
      <p className="mt-2 text-sm text-slate-600">{t(dict, "faq.subtitle")}</p>

      <dl className="mt-8 space-y-6">
        {items.map((item) => (
          <div key={item.q}>
            <dt className="text-base font-semibold text-slate-900">{item.q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-slate-700">
              {item.whatsappE164 ? (
                <a
                  href={`https://wa.me/${item.whatsappE164}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-900 underline hover:text-slate-700"
                >
                  {item.a}
                </a>
              ) : (
                item.a
              )}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-10 text-sm text-slate-500">
        {t(dict, "faq.footer")}{" "}
        <Link href="/login" className="underline hover:text-slate-800">
          {t(dict, "faq.footerSignIn")}
        </Link>{" "}
        {t(dict, "faq.footerTail")}
      </p>
    </main>
  );
}
