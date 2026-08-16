type DictValue =
  | string
  | DictValue[]
  | { [key: string]: DictValue };

export type Dictionary = { [key: string]: DictValue };

/** Resolve nested key like "nav.home". Supports "{name}" placeholders. */
export function t(
  dict: Dictionary,
  key: string,
  params?: Record<string, string | number>,
): string {
  const parts = key.split(".");
  let cur: DictValue | undefined = dict;
  for (const part of parts) {
    if (cur == null || typeof cur === "string" || Array.isArray(cur)) {
      cur = undefined;
      break;
    }
    cur = cur[part];
  }
  let text = typeof cur === "string" ? cur : key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
  }
  return text;
}
