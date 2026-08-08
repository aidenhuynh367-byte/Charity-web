/** Same-origin relative path only (blocks open redirects). */
export function safeInternalPath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const path = raw.trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return null;
  }
  return path;
}

export function charityOnboardingPathFromForm(formData: FormData): string {
  if (formData.get("AddOrg") === "foobar") {
    return "/onboarding/role?AddOrg=foobar";
  }
  return (
    safeInternalPath(formData.get("callbackUrl")) ?? "/onboarding/role"
  );
}
