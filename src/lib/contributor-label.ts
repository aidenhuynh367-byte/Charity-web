export type ContributorLabelUser = {
  name: string | null;
  email: string | null;
  profile: { displayName: string | null } | null;
};

export function contributorLabel(user: ContributorLabelUser): string {
  const fromProfile = user.profile?.displayName?.trim();
  if (fromProfile) return fromProfile;
  const fromName = user.name?.trim();
  if (fromName) return fromName;
  if (user.email) return user.email;
  return "Contributor";
}
