"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { isLocale, LOCALE_COOKIE } from "@/i18n/config";

export async function setLocaleAction(formData: FormData) {
  const raw = formData.get("locale");
  if (typeof raw !== "string" || !isLocale(raw)) return;

  const store = await cookies();
  store.set(LOCALE_COOKIE, raw, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}
