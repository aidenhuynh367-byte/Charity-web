import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

import Google from "next-auth/providers/google";
import AzureAD from "next-auth/providers/azure-ad";

import { safeInternalPath } from "@/lib/login-redirect";
import { isPublicProfilePath } from "@/lib/public-profile-path";

function providers() {
  const list: NextAuthConfig["providers"] = [];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    list.push(
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
    );
  }

  if (
    process.env.AZURE_AD_CLIENT_ID &&
    process.env.AZURE_AD_CLIENT_SECRET &&
    process.env.AZURE_AD_TENANT_ID
  ) {
    list.push(
      AzureAD({
        clientId: process.env.AZURE_AD_CLIENT_ID,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
        issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
        authorization: {
          params: {
            scope: "openid profile email offline_access",
          },
        },
        profile(profile) {
          const emailFromToken =
            typeof profile.email === "string" && profile.email.trim().length > 0
              ? profile.email.trim()
              : typeof profile.preferred_username === "string" &&
                  profile.preferred_username.trim().length > 0
                ? profile.preferred_username.trim()
                : undefined;
          return {
            id: profile.sub,
            name: profile.name ?? undefined,
            email: emailFromToken,
            image: null,
          };
        },
      }),
    );
  }

  return list;
}

/** Provider ids that have env configured (for guarding `signIn` server actions). */
export function getConfiguredProviderIds(): string[] {
  const ids: string[] = [];
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    ids.push("google");
  }
  if (
    process.env.AZURE_AD_CLIENT_ID &&
    process.env.AZURE_AD_CLIENT_SECRET &&
    process.env.AZURE_AD_TENANT_ID
  ) {
    ids.push("azure-ad");
  }
  return ids;
}

export const authConfig = {
  trustHost: true,
  providers: providers(),
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const path = nextUrl.pathname;
      const isLoggedIn = !!auth?.user;

      if (path.startsWith("/api/auth")) return true;
      if (path.startsWith("/login")) {
        if (isLoggedIn) {
          if (nextUrl.searchParams.get("AddOrg") === "foobar") {
            return NextResponse.redirect(
              new URL("/onboarding/role?AddOrg=foobar", nextUrl),
            );
          }
          const callback = safeInternalPath(
            nextUrl.searchParams.get("callbackUrl"),
          );
          if (callback) {
            return NextResponse.redirect(new URL(callback, nextUrl));
          }
          return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      if (isPublicProfilePath(path)) return true;

      const protectedPrefix =
        path.startsWith("/dashboard") ||
        path.startsWith("/onboarding") ||
        path.startsWith("/profile");

      if (protectedPrefix && !isLoggedIn) return false;

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      const pic = token.picture;
      if (typeof pic === "string" && pic.startsWith("data:")) {
        delete token.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      const img = session.user?.image;
      if (typeof img === "string" && img.startsWith("data:")) {
        session.user.image = null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
