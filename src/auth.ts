import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  events: {
    async createUser({ user }) {
      const userId = user.id;
      if (!userId) return;
      try {
        await prisma.profile.upsert({
          where: { userId },
          create: { userId },
          update: {},
        });
      } catch (e) {
        console.error("[auth] createUser profile upsert failed:", e);
        // Don’t block sign-in; layout uses getOrCreateProfile as a fallback.
      }
    },
  },
  callbacks: {
    ...authConfig.callbacks,
  },
});
