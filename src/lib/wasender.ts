import { parseWasenderWhatsappSessionId } from "@/lib/wasender-session-id";

const DEFAULT_BASE = "https://www.wasenderapi.com";
const STATUS_POLL_INTERVAL_MS = 500;
const STATUS_POLL_MAX_MS = 15_000;

function wasenderBaseUrl(): string {
  const raw = process.env.WASENDER_API_BASE_URL?.trim() || DEFAULT_BASE;
  return raw.replace(/\/+$/, "");
}

/**
 * Wasender: connect/disconnect (and GET /api/whatsapp-sessions/:id) require a personal
 * access token. Send-message and GET /api/status use the session (messaging) API key.
 * If only the messaging key is set, we send without connect/disconnect (messaging-only).
 */
function resolveWasenderTokens(): {
  patToken: string | null;
  messagingToken: string;
  hasSeparateMessagingKey: boolean;
} | null {
  const pat =
    process.env.WASENDER_PERSONAL_ACCESS_TOKEN?.trim() ||
    process.env.WASENDER_BEARER_TOKEN?.trim() ||
    null;
  const messagingExplicit =
    process.env.WASENDER_MESSAGING_API_KEY?.trim() ||
    process.env.WASENDER_API_KEY?.trim() ||
    null;
  const messagingToken = messagingExplicit ?? pat;
  if (!messagingToken) return null;
  return {
    patToken: pat,
    messagingToken,
    hasSeparateMessagingKey: Boolean(pat && messagingExplicit),
  };
}

export type WasenderRuntimeConfig = {
  baseUrl: string;
  sessionId: number;
  /** Present only when PAT is configured; required for connect/disconnect. */
  patToken: string | null;
  messagingToken: string;
  hasSeparateMessagingKey: boolean;
};

function getWasenderConfig(): WasenderRuntimeConfig | null {
  const tokens = resolveWasenderTokens();
  const sessionEnvRaw = process.env.WASENDER_WHATSAPP_SESSION_ID;
  const sidParsed = parseWasenderWhatsappSessionId(sessionEnvRaw);
  const sessionId = sidParsed.sessionId;
  if (!tokens || sessionId == null) {
    const reasons: string[] = [];
    if (!tokens) {
      reasons.push(
        "set_WASENDER_API_KEY_or_WASENDER_MESSAGING_API_KEY_or_WASENDER_PERSONAL_ACCESS_TOKEN",
      );
    }
    if (sidParsed.parseKind === "empty") {
      const trimmed = sessionEnvRaw?.trim() ?? "";
      const emptyQuotes = trimmed === '""' || trimmed === "''";
      reasons.push(
        sessionEnvRaw === undefined
          ? "WASENDER_WHATSAPP_SESSION_ID_unset"
          : emptyQuotes
            ? "WASENDER_WHATSAPP_SESSION_ID_empty_quotes_put_digits_between_quotes_or_use_unquoted_digits"
          : "WASENDER_WHATSAPP_SESSION_ID_blank",
      );
    } else if (sidParsed.parseKind === "invalid") {
      reasons.push("WASENDER_WHATSAPP_SESSION_ID_invalid");
    } else if (sessionId == null) {
      reasons.push("WASENDER_WHATSAPP_SESSION_ID_unusable");
    }
    const hint =
      "Set WASENDER_WHATSAPP_SESSION_ID to your numeric Wasender session id. Use WASENDER_API_KEY (or WASENDER_MESSAGING_API_KEY) for send-message; add WASENDER_PERSONAL_ACCESS_TOKEN if you want connect/disconnect. Restart `next dev` after editing .env.";
    if (process.env.NODE_ENV === "development") {
      console.warn("[wasender] Skipping WhatsApp:", reasons.join(" | "), "|", hint);
    } else {
      console.error("[wasender] Skipping WhatsApp:", reasons.join(" | "));
    }
    return null;
  }
  return {
    baseUrl: wasenderBaseUrl(),
    sessionId,
    patToken: tokens.patToken,
    messagingToken: tokens.messagingToken,
    hasSeparateMessagingKey: tokens.hasSeparateMessagingKey,
  };
}

function truncateBody(text: string, max = 400): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

async function readResponseSnippet(res: Response): Promise<string> {
  try {
    const text = await res.text();
    return truncateBody(text);
  } catch {
    return "";
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function wasenderFetch(
  baseUrl: string,
  token: string,
  method: "GET" | "POST",
  path: string,
  body?: Record<string, unknown>,
): Promise<Response> {
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

/** Disconnect using PAT only (session API key is rejected on this route). */
async function disconnectWasenderSession(
  baseUrl: string,
  patToken: string,
  sessionId: number,
): Promise<void> {
  const disconnectPath = `/api/whatsapp-sessions/${sessionId}/disconnect`;
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const disc = await wasenderFetch(
        baseUrl,
        patToken,
        "POST",
        disconnectPath,
      );
      if (disc.ok) {
        return;
      }
      console.warn(
        "[wasender] disconnect attempt failed",
        attempt,
        disc.status,
        await readResponseSnippet(disc),
      );
    } catch (e) {
      console.warn("[wasender] disconnect attempt error", attempt, e);
    }
    if (attempt < maxAttempts) {
      await sleep(300);
    }
  }
  console.error(
    "[wasender] disconnect failed after retries; session may still be connected.",
  );
}

function extractWasenderStatus(raw: unknown): string | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  if (typeof o.status === "string") return o.status;
  const d = o.data;
  if (d && typeof d === "object") {
    const st = (d as Record<string, unknown>).status;
    if (typeof st === "string") return st;
  }
  return undefined;
}

/**
 * Poll until the WhatsApp session reports connected, or a terminal failure / timeout.
 * With PAT: tries GET /api/whatsapp-sessions/{id} first, then GET /api/status.
 * Messaging-only: uses GET /api/status with the messaging token.
 */
async function waitUntilSessionConnected(
  baseUrl: string,
  sessionId: number,
  patToken: string | null,
  messagingToken: string,
): Promise<boolean> {
  const deadline = Date.now() + STATUS_POLL_MAX_MS;
  while (Date.now() < deadline) {
    let status: string | undefined;

    if (patToken) {
      const detailsRes = await wasenderFetch(
        baseUrl,
        patToken,
        "GET",
        `/api/whatsapp-sessions/${sessionId}`,
      );
      if (detailsRes.ok) {
        try {
          const raw = await detailsRes.json();
          status = extractWasenderStatus(raw)?.toLowerCase();
        } catch {
          status = undefined;
        }
      }
    }

    if (!status) {
      const stRes = await wasenderFetch(
        baseUrl,
        messagingToken,
        "GET",
        "/api/status",
      );
      if (stRes.ok) {
        try {
          const raw = await stRes.json();
          status = extractWasenderStatus(raw)?.toLowerCase();
        } catch {
          status = undefined;
        }
      }
    }

    if (status === "connected") return true;
    if (
      status === "need_scan" ||
      status === "logged_out" ||
      status === "expired"
    ) {
      console.warn(`[wasender] Session not ready (status=${status}).`);
      return false;
    }
    await sleep(STATUS_POLL_INTERVAL_MS);
  }
  console.warn("[wasender] Timed out waiting for session connected.");
  return false;
}

/**
 * Send one WhatsApp text via Wasender.
 * With PAT: connect → send → disconnect in `finally`.
 * Messaging API key only: send (and status poll) without connect/disconnect — Wasender
 * rejects session API keys on connect with 401.
 */
export async function sendWasenderTextMessage(
  toE164: string,
  text: string,
): Promise<void> {
  const config = getWasenderConfig();
  if (!config) {
    return;
  }

  const { baseUrl, sessionId, patToken, messagingToken } = config;
  const connectPath = `/api/whatsapp-sessions/${sessionId}/connect`;
  const postSendMessage = () =>
    wasenderFetch(baseUrl, messagingToken, "POST", "/api/send-message", {
      to: toE164,
      text,
    });

  /** Only disconnect after a successful connect (not messaging-only / 401 fallback). */
  let disconnectWithPat = false;
  /** PAT used for session-details poll; cleared when connect proves token is not a PAT. */
  let statusPollPatToken: string | null = patToken;

  try {
    let sendRes: Response;

    if (patToken) {
      const connectRes = await wasenderFetch(
        baseUrl,
        patToken,
        "POST",
        connectPath,
      );
      if (connectRes.ok) {
        type ConnectResponse = {
          success?: boolean;
          message?: string;
          data?: { status?: string };
        };
        let connectJson: ConnectResponse | null = null;
        try {
          connectJson = (await connectRes.json()) as ConnectResponse;
        } catch {
          connectJson = null;
        }
        const o = (connectJson ?? {}) as Record<string, unknown>;
        const dataObj =
          o.data && typeof o.data === "object"
            ? (o.data as Record<string, unknown>)
            : null;
        const connectMsg = [
          typeof o.message === "string" ? o.message : "",
          typeof o.error === "string" ? o.error : "",
          dataObj && typeof dataObj.message === "string"
            ? String(dataObj.message)
            : "",
        ]
          .join(" ")
          .trim();
        const patRequiredHint = /(?:valid\s+)?personal access token/i.test(
          connectMsg,
        );
        const successField = o.success;
        const successTruthy =
          successField === true ||
          successField === "true" ||
          successField === 1;
        /**
         * Wasender may return HTTP 200 with success:false, or omit success while
         * still describing a PAT error in message fields.
         */
        const connectRejectedAsPat = patRequiredHint && !successTruthy;

        if (connectRejectedAsPat) {
          console.warn(
            "[wasender] Connect rejected this token as a PAT (success:false). Sending with messaging API key only. Remove WASENDER_PERSONAL_ACCESS_TOKEN / WASENDER_BEARER_TOKEN if it is your session API key, or set a real PAT.",
          );
          disconnectWithPat = false;
          statusPollPatToken = null;
          sendRes = await postSendMessage();
        } else if (
          successField === false ||
          successField === "false" ||
          successField === 0
        ) {
          console.error(
            "[wasender] connect failed (API success:false)",
            connectMsg || "(no message)",
          );
          return;
        } else {
          disconnectWithPat = true;
          const connectStatus = connectJson?.data?.status?.toUpperCase();
          if (connectStatus === "NEED_SCAN") {
            console.warn("[wasender] Session NEED_SCAN; cannot send until paired.");
            return;
          }

          sendRes = await postSendMessage();
        }
      } else {
        const connectErrSnippet = await readResponseSnippet(connectRes);
        const connectHttp = Number(connectRes.status);
        /**
         * Wasender returns 401/403 when the connect token is not a PAT. Do not
         * rely on body shape; fall back to messaging-only send.
         */
        if (connectHttp === 401 || connectHttp === 403) {
          console.warn(
            `[wasender] Connect HTTP ${connectHttp}. Sending with messaging API key only (no connect/disconnect).`,
          );
          disconnectWithPat = false;
          statusPollPatToken = null;
          sendRes = await postSendMessage();
        } else {
          console.error(
            "[wasender] connect failed",
            connectRes.status,
            connectErrSnippet,
          );
          return;
        }
      }
    } else {
      sendRes = await postSendMessage();
    }

    if (!sendRes.ok) {
      const ready = await waitUntilSessionConnected(
        baseUrl,
        sessionId,
        statusPollPatToken,
        messagingToken,
      );
      if (ready) {
        sendRes = await postSendMessage();
      }
    }

    if (!sendRes.ok) {
      console.error(
        "[wasender] send-message failed",
        sendRes.status,
        await readResponseSnippet(sendRes),
      );
    }
  } catch (e) {
    console.error("[wasender] request error", e);
  } finally {
    if (disconnectWithPat && patToken) {
      await disconnectWasenderSession(baseUrl, patToken, sessionId);
    }
  }
}
