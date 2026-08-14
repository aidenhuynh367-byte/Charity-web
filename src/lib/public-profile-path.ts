/** Public charity profile and thank-yous (no sign-in required). */
export function isPublicProfilePath(path: string): boolean {
  if (path === "/profile") return false;
  if (/^\/profile\/[^/]+\/thank-yous\/?$/.test(path)) return true;
  if (/^\/profile\/[^/]+\/?$/.test(path)) return true;
  return false;
}
