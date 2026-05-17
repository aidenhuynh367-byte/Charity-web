import { NextResponse } from "next/server";

/** Keep in sync with `firebase` dependency for compat `importScripts` URLs. */
const FIREBASE_COMPAT_VERSION = "12.12.1";

/**
 * Serves the FCM web service worker at `/firebase-messaging-sw.js` with the
 * public Firebase web config inlined from env (no secrets).
 */
export function GET() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  };

  const body = `
importScripts("https://www.gstatic.com/firebasejs/${FIREBASE_COMPAT_VERSION}/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/${FIREBASE_COMPAT_VERSION}/firebase-messaging-compat.js");
firebase.initializeApp(${JSON.stringify(firebaseConfig)});
const messaging = firebase.messaging();
messaging.onBackgroundMessage(function (payload) {
  const title =
    payload.notification && payload.notification.title
      ? payload.notification.title
      : "Notification";
  const options = {
    body:
      payload.notification && payload.notification.body
        ? payload.notification.body
        : "",
    data: payload.data || {},
  };
  return self.registration.showNotification(title, options);
});
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=0",
    },
  });
}
