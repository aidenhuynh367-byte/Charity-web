"use server";

import { signIn } from "@/auth";
import { getConfiguredProviderIds } from "@/auth.config";

const allowedProviders = new Set(["google", "azure-ad"]);

export async function loginWith(provider: string) {
  if (!allowedProviders.has(provider)) {
    throw new Error("Unknown sign-in provider.");
  }
  if (!getConfiguredProviderIds().includes(provider)) {
    throw new Error(
      "This sign-in method is not configured. Add the client ID and secret to .env and restart the dev server.",
    );
  }
  await signIn(provider, { redirectTo: "/onboarding/role" });
}
