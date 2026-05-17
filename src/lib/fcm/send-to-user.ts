import { getFirebaseAdminMessaging } from "@/lib/firebase/admin";
import { prisma } from "@/lib/prisma";

const INVALID_TOKEN_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

export type WebPushPayload = {
  title: string;
  body: string;
  /** FCM data payload values must be strings. */
  data?: Record<string, string>;
};

/**
 * Sends a web push to every stored FCM token for the user. Removes tokens that
 * FCM reports as invalid or unregistered.
 */
export async function sendWebPushToUser(
  userId: string,
  message: WebPushPayload,
): Promise<{
  sent: number;
  failed: number;
  skippedNoAdmin: boolean;
  skippedNoTokens: boolean;
}> {
  const messaging = getFirebaseAdminMessaging();
  if (!messaging) {
    return {
      sent: 0,
      failed: 0,
      skippedNoAdmin: true,
      skippedNoTokens: false,
    };
  }

  const rows = await prisma.fcmWebToken.findMany({
    where: { userId },
    select: { id: true, token: true },
  });

  if (!rows.length) {
    return {
      sent: 0,
      failed: 0,
      skippedNoAdmin: false,
      skippedNoTokens: true,
    };
  }

  const tokens = rows.map((r) => r.token);

  const data =
    message.data &&
    Object.fromEntries(
      Object.entries(message.data).map(([k, v]) => [k, String(v)]),
    );

  const res = await messaging.sendEachForMulticast({
    tokens,
    notification: { title: message.title, body: message.body },
    ...(data && Object.keys(data).length > 0 ? { data } : {}),
  });

  const idsToDelete: string[] = [];
  res.responses.forEach((r, i) => {
    if (r.success) return;
    const code = r.error?.code;
    if (code && INVALID_TOKEN_CODES.has(code)) {
      const row = rows[i];
      if (row) idsToDelete.push(row.id);
    }
  });

  if (idsToDelete.length) {
    await prisma.fcmWebToken.deleteMany({
      where: { id: { in: idsToDelete } },
    });
  }

  return {
    sent: res.successCount,
    failed: res.failureCount,
    skippedNoAdmin: false,
    skippedNoTokens: false,
  };
}
