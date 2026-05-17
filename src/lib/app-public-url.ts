/** Public origin for links in emails/messages (no trailing slash). */
export function appPublicOrigin(): string {
  const fromAuth = process.env.AUTH_URL?.trim().replace(/\/+$/, "") ?? "";
  if (fromAuth) return fromAuth;
  const fromPublic = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "") ?? "";
  if (fromPublic) return fromPublic;
  return "http://localhost:3000";
}
