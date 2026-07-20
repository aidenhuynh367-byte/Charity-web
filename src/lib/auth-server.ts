import { Prisma, Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requireUserId(): Promise<string> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) redirect("/login");
  return id;
}

/**
 * Ensures a Profile row exists. Requires a matching User row (OAuth creates it);
 * otherwise the FK insert throws and produced 500s for stale JWTs.
 */
export async function getOrCreateProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      redirect("/login?error=stale_session");
    }

    return await prisma.profile.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  } catch (e) {
    if (isRedirectError(e)) throw e;
    if (e instanceof Prisma.PrismaClientInitializationError) {
      console.error("[getOrCreateProfile] init", e.message);
      redirect("/login?error=database");
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("[getOrCreateProfile]", e.code, e.message);
      if (e.code === "P1001" || e.code === "P1017") {
        redirect("/login?error=database");
      }
      if (e.code === "P2021") {
        redirect("/login?error=migration");
      }
      if (e.code === "P2003") {
        redirect("/login?error=stale_session");
      }
    } else {
      console.error("[getOrCreateProfile]", e);
    }
    throw e;
  }
}

export async function requireContributor(): Promise<{
  userId: string;
  profile: Awaited<ReturnType<typeof getOrCreateProfile>>;
}> {
  const userId = await requireUserId();
  const profile = await getOrCreateProfile(userId);
  if (profile.role !== Role.CONTRIBUTOR) {
    redirect("/dashboard");
  }
  return { userId, profile };
}

export async function requireCharityOrganization(): Promise<{
  userId: string;
  profile: Awaited<ReturnType<typeof getOrCreateProfile>>;
}> {
  const userId = await requireUserId();
  const profile = await getOrCreateProfile(userId);
  if (profile.role !== Role.CHARITY_ORGANIZATION) {
    redirect("/dashboard");
  }
  return { userId, profile };
}
