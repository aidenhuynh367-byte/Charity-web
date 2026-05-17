import admin from "firebase-admin";

function initFromServiceAccountJson(): boolean {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return false;
  const cred = JSON.parse(raw) as admin.ServiceAccount;
  admin.initializeApp({ credential: admin.credential.cert(cred) });
  return true;
}

function initFromApplicationDefault(): boolean {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()) return false;
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
  return true;
}

/**
 * Firebase Admin for server-side FCM. Configure either
 * `FIREBASE_SERVICE_ACCOUNT_JSON` (single-line JSON) or
 * `GOOGLE_APPLICATION_CREDENTIALS` (path to service account file).
 */
export function getFirebaseAdminMessaging(): admin.messaging.Messaging | null {
  if (admin.apps.length > 0) {
    return admin.messaging();
  }

  try {
    if (initFromServiceAccountJson()) {
      return admin.messaging();
    }
    if (initFromApplicationDefault()) {
      return admin.messaging();
    }
  } catch (e) {
    console.error("[firebase-admin] initialization failed:", e);
    return null;
  }

  return null;
}
