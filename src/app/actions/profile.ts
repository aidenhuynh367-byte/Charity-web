"use server";

import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ZodError } from "zod";

import { auth } from "@/auth";
import {
  charityProfileSchema,
  contributorProfileSchema,
  roleSchema,
} from "@/lib/validation/profile";
import { formText } from "@/lib/form-text";
import { prisma } from "@/lib/prisma";
import { formatZodFormError } from "@/lib/validation/zod-form-error";

export type FormState = { error?: string; ok?: boolean } | null;

function firstZodError(err: ZodError) {
  return formatZodFormError(err);
}

export async function setRoleAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in." };

  const parsed = roleSchema.safeParse({ role: formText(formData, "role") });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, role: parsed.data.role },
    update: { role: parsed.data.role },
  });

  revalidatePath("/onboarding/profile");
  redirect("/onboarding/profile");
}

export async function completeOnboardingProfileAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in." };
  const userId = session.user.id;

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile?.role) redirect("/onboarding/role");

  const now = new Date();

  if (profile.role === Role.CHARITY_ORGANIZATION) {
    const parsed = charityProfileSchema.safeParse({
      organizationName: formText(formData, "organizationName"),
      address: formText(formData, "address"),
      phoneCountry: formText(formData, "phoneCountry"),
      phoneNationalNumber: formText(formData, "phoneNationalNumber"),
      charityWhatsappCountry: formText(formData, "charityWhatsappCountry"),
      charityWhatsappNationalNumber: formText(
        formData,
        "charityWhatsappNationalNumber",
      ),
      charityEmail: formText(formData, "charityEmail"),
    });
    if (!parsed.success) return { error: firstZodError(parsed.error) };

    await prisma.profile.update({
      where: { userId },
      data: {
        organizationName: parsed.data.organizationName,
        address: parsed.data.address,
        phoneCountry: parsed.data.phoneCountry,
        phoneNationalNumber: parsed.data.phoneNationalNumber,
        charityWhatsappCountry: parsed.data.charityWhatsappCountry,
        charityWhatsappNationalNumber: parsed.data.charityWhatsappNationalNumber,
        charityEmail: parsed.data.charityEmail,
        displayName: null,
        contributorWhatsappCountry: null,
        contributorWhatsappNationalNumber: null,
        onboardingCompletedAt: now,
      },
    });
  } else {
    const parsed = contributorProfileSchema.safeParse({
      displayName: formText(formData, "displayName"),
      contributorWhatsappCountry: formText(
        formData,
        "contributorWhatsappCountry",
      ),
      contributorWhatsappNationalNumber: formText(
        formData,
        "contributorWhatsappNationalNumber",
      ),
    });
    if (!parsed.success) return { error: firstZodError(parsed.error) };

    await prisma.profile.update({
      where: { userId },
      data: {
        displayName: parsed.data.displayName,
        contributorWhatsappCountry: parsed.data.contributorWhatsappCountry,
        contributorWhatsappNationalNumber:
          parsed.data.contributorWhatsappNationalNumber,
        organizationName: null,
        address: null,
        phoneCountry: null,
        phoneNationalNumber: null,
        charityWhatsappCountry: null,
        charityWhatsappNationalNumber: null,
        charityEmail: null,
        onboardingCompletedAt: now,
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  redirect("/dashboard");
}

export async function updateProfileAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in." };
  const userId = session.user.id;

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile?.role) redirect("/onboarding/role");
  if (!profile.onboardingCompletedAt) redirect("/onboarding/profile");

  if (profile.role === Role.CHARITY_ORGANIZATION) {
    const parsed = charityProfileSchema.safeParse({
      organizationName: formText(formData, "organizationName"),
      address: formText(formData, "address"),
      phoneCountry: formText(formData, "phoneCountry"),
      phoneNationalNumber: formText(formData, "phoneNationalNumber"),
      charityWhatsappCountry: formText(formData, "charityWhatsappCountry"),
      charityWhatsappNationalNumber: formText(
        formData,
        "charityWhatsappNationalNumber",
      ),
      charityEmail: formText(formData, "charityEmail"),
    });
    if (!parsed.success) return { error: firstZodError(parsed.error) };

    await prisma.profile.update({
      where: { userId },
      data: {
        organizationName: parsed.data.organizationName,
        address: parsed.data.address,
        phoneCountry: parsed.data.phoneCountry,
        phoneNationalNumber: parsed.data.phoneNationalNumber,
        charityWhatsappCountry: parsed.data.charityWhatsappCountry,
        charityWhatsappNationalNumber: parsed.data.charityWhatsappNationalNumber,
        charityEmail: parsed.data.charityEmail,
        displayName: null,
        contributorWhatsappCountry: null,
        contributorWhatsappNationalNumber: null,
      },
    });
  } else {
    const parsed = contributorProfileSchema.safeParse({
      displayName: formText(formData, "displayName"),
      contributorWhatsappCountry: formText(
        formData,
        "contributorWhatsappCountry",
      ),
      contributorWhatsappNationalNumber: formText(
        formData,
        "contributorWhatsappNationalNumber",
      ),
    });
    if (!parsed.success) return { error: firstZodError(parsed.error) };

    await prisma.profile.update({
      where: { userId },
      data: {
        displayName: parsed.data.displayName,
        contributorWhatsappCountry: parsed.data.contributorWhatsappCountry,
        contributorWhatsappNationalNumber:
          parsed.data.contributorWhatsappNationalNumber,
        organizationName: null,
        address: null,
        phoneCountry: null,
        phoneNationalNumber: null,
        charityWhatsappCountry: null,
        charityWhatsappNationalNumber: null,
        charityEmail: null,
      },
    });
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}
