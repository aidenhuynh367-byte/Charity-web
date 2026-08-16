import type { Locale } from "./config";
import type { Dictionary } from "./t";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./messages/en.json").then((m) => m.default as Dictionary),
  id: () => import("./messages/id.json").then((m) => m.default as Dictionary),
  "zh-CN": () =>
    import("./messages/zh-CN.json").then((m) => m.default as Dictionary),
  fr: () => import("./messages/fr.json").then((m) => m.default as Dictionary),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
