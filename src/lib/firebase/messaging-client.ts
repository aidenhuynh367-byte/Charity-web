"use client";

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
} from "firebase/messaging";

function readWebConfig(): Record<string, string> | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  if (!apiKey || !authDomain || !projectId || !messagingSenderId || !appId) {
    return null;
  }
  return { apiKey, authDomain, projectId, messagingSenderId, appId };
}

function getOrInitApp(): FirebaseApp | null {
  const cfg = readWebConfig();
  if (!cfg) return null;
  if (!getApps().length) {
    return initializeApp(cfg);
  }
  return getApps()[0] ?? null;
}

let foregroundHandlerAttached = false;

function attachForegroundHandler(messaging: Messaging) {
  if (foregroundHandlerAttached) return;
  foregroundHandlerAttached = true;
  onMessage(messaging, (payload) => {
    const title =
      payload.notification?.title ??
      (typeof payload.data?.title === "string" ? payload.data.title : null) ??
      "Notification";
    const body =
      payload.notification?.body ??
      (typeof payload.data?.body === "string" ? payload.data.body : undefined);
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    try {
      new Notification(title, body ? { body } : undefined);
    } catch {
      // ignore
    }
  });
}

export async function registerFcmServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    return await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/",
    });
  } catch {
    return null;
  }
}

/**
 * Requests notification permission (if needed), registers the FCM SW, attaches a
 * minimal foreground handler, and returns the FCM registration token.
 */
export async function getFcmTokenForCurrentDevice(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim();
  if (!vapidKey) return null;

  if (!(await isSupported())) return null;

  const app = getOrInitApp();
  if (!app) return null;

  const reg = await registerFcmServiceWorker();
  if (!reg) return null;

  const permission =
    Notification.permission === "default"
      ? await Notification.requestPermission()
      : Notification.permission;
  if (permission !== "granted") return null;

  try {
    const messaging = getMessaging(app);
    attachForegroundHandler(messaging);
    return await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: reg,
    });
  } catch {
    return null;
  }
}
