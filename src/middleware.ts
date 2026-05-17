import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

/** Edge-safe: no Prisma. Uses same JWT/session settings as [auth.ts](src/auth.ts). */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/donation-lists/:path*",
    "/master-donation-lists/:path*",
    "/onboarding/:path*",
    "/profile/:path*",
    "/login",
  ],
};
