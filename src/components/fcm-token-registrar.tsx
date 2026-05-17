"use client";

import { useEffect } from "react";

import { getFcmTokenForCurrentDevice } from "@/lib/firebase/messaging-client";

type Props = {
  userId: string;
};

/**
 * Registers FCM for the signed-in user (after onboarding). Server trusts the
 * session cookie; only the device token is posted.
 */
export function FcmTokenRegistrar({ userId }: Props) {
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    void (async () => {
      try {
        const token = await getFcmTokenForCurrentDevice();
        if (cancelled || !token) return;

        console.log(token + "  this is it");

        const userAgent =
          typeof navigator !== "undefined" ? navigator.userAgent : undefined;

        const res = await fetch("/api/fcm/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ token, userAgent }),
        });

        if (!res.ok) {
          console.warn("[fcm] register failed:", res.status, await res.text());
        }
      } catch (e) {
        console.warn("[fcm] registration skipped:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return null;
}
