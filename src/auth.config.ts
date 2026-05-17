import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import AzureAD from "next-auth/providers/azure-ad";
import Instagram from "next-auth/providers/instagram";

/** Instagram Basic Display (deprecated) used api.instagram.com; current Meta apps use www + business scopes. */
const instagramOAuthLegacy =
  process.env.INSTAGRAM_OAUTH_LEGACY === "1" ||
  process.env.INSTAGRAM_OAUTH_LEGACY === "true";

function instagramAuthorizeScopes(): string {
  const fromEnv = process.env.INSTAGRAM_SCOPES?.trim();
  if (fromEnv) return fromEnv;
  return instagramOAuthLegacy
    ? "user_profile,user_media"
    : "instagram_business_basic";
}

/**
 * “Instagram API with Instagram Login” returns token JSON as `{ data: [{ access_token, user_id }] }`.
 * Auth.js expects a flat OAuth2 token body; normalize when present.
 */
async function instagramTokenConform(response: Response): Promise<Response> {
  try {
    const json: unknown = await response.clone().json();
    if (
      json &&
      typeof json === "object" &&
      "data" in json &&
      Array.isArray((json as { data: unknown }).data)
    ) {
      const row = (json as { data: Array<Record<string, unknown>> }).data[0];
      if (row && typeof row.access_token === "string") {
        const payload: Record<string, unknown> = {
          access_token: row.access_token,
          token_type: "bearer",
        };
        if (row.user_id != null) payload.user_id = row.user_id;
        return new Response(JSON.stringify(payload), {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
  } catch {
    return response;
  }
  return response;
}

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

  if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
    list.push(
      Facebook({
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
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

  if (process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
    list.push(
      Instagram({
        clientId: process.env.INSTAGRAM_CLIENT_ID,
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
        /** Instagram OAuth rejects PKCE; Auth.js defaults to `["pkce"]`. */
        checks: ["state"],
        authorization: {
          url: instagramOAuthLegacy
            ? "https://api.instagram.com/oauth/authorize"
            : "https://www.instagram.com/oauth/authorize",
          params: {
            response_type: "code",
            scope: instagramAuthorizeScopes(),
            ...(instagramOAuthLegacy
              ? {}
              : { enable_fb_login: "false" }),
          },
        },
        token: {
          url: "https://api.instagram.com/oauth/access_token",
          conform: instagramTokenConform,
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
  if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
    ids.push("facebook");
  }
  if (
    process.env.AZURE_AD_CLIENT_ID &&
    process.env.AZURE_AD_CLIENT_SECRET &&
    process.env.AZURE_AD_TENANT_ID
  ) {
    ids.push("azure-ad");
  }
  if (process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
    ids.push("instagram");
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
          return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

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
