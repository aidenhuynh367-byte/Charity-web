/**
 * Normalize Wasender session id from env (BOM, ASCII/curly quotes).
 * Wasender expects a positive integer session id.
 */
export function normalizeWasenderWhatsappSessionIdRaw(
  raw: string | undefined,
): string {
  if (raw == null) return "";
  let s = String(raw).replace(/^\uFEFF/, "").trim();
  s = s.replace(/[\u201C\u201D\u2018\u2019]/g, "");
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s.trim();
}

export function parseWasenderWhatsappSessionId(raw: string | undefined): {
  sessionId: number | null;
  /** Safe to log (no secrets). */
  parseKind: "empty" | "invalid" | "ok";
} {
  const s = normalizeWasenderWhatsappSessionIdRaw(raw);
  if (!s) return { sessionId: null, parseKind: "empty" };

  if (/^\d+$/.test(s)) {
    const n = Number.parseInt(s, 10);
    if (Number.isFinite(n) && n >= 1) {
      return { sessionId: n, parseKind: "ok" };
    }
    return { sessionId: null, parseKind: "invalid" };
  }

  const m = s.match(/\d+/);
  if (!m) return { sessionId: null, parseKind: "invalid" };
  const n = Number.parseInt(m[0], 10);
  if (!Number.isFinite(n) || n < 1) {
    return { sessionId: null, parseKind: "invalid" };
  }
  return { sessionId: n, parseKind: "ok" };
}
