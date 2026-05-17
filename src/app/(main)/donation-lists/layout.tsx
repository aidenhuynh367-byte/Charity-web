import { requireContributor } from "@/lib/auth-server";

export default async function DonationListsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireContributor();
  return <>{children}</>;
}
