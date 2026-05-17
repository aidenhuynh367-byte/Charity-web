"use server";

import { DonationListStatus, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { appPublicOrigin } from "@/lib/app-public-url";
import { requireContributor } from "@/lib/auth-server";
import { contributorLabel } from "@/lib/contributor-label";
import { prisma } from "@/lib/prisma";
import { profileWhatsappToE164 } from "@/lib/profile-whatsapp-e164";
import { sendWasenderTextMessage } from "@/lib/wasender";
import { donationListNameSchema } from "@/lib/validation/donation-list";

export type DonationListFormState = { error?: string } | null;

function parseNotifyCharityUserIds(): string[] | null {
  const raw = process.env.WASENDER_NOTIFY_CHARITY_USER_IDS?.trim();
  if (!raw) return null;
  const ids = raw
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.length > 0 ? ids : null;
}

export async function createDonationList(
  _prev: DonationListFormState,
  formData: FormData,
): Promise<DonationListFormState> {
  const { userId } = await requireContributor();

  const parsed = donationListNameSchema.safeParse({
    name: formData.get("name"),
  });
  if (!parsed.success) {
    const msg =
      parsed.error.flatten().fieldErrors.name?.[0] ?? "Invalid name.";
    return { error: msg };
  }

  const list = await prisma.donationList.create({
    data: {
      name: parsed.data.name,
      contributorId: userId,
    },
  });

  revalidatePath("/donation-lists");
  redirect(`/donation-lists/${list.id}`);
}

export async function deleteDonationList(formData: FormData) {
  const { userId } = await requireContributor();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    throw new Error("Missing list id.");
  }

  const deleted = await prisma.donationList.deleteMany({
    where: {
      id,
      contributorId: userId,
      status: DonationListStatus.NOT_SUBMITTED,
    },
  });
  if (deleted.count === 0) {
    throw new Error(
      "List not found, already submitted, or access denied.",
    );
  }

  revalidatePath("/donation-lists");
  redirect("/donation-lists");
}

export async function submitDonationList(formData: FormData) {
  const { userId } = await requireContributor();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    throw new Error("Missing list id.");
  }

  const updated = await prisma.donationList.updateMany({
    where: {
      id,
      contributorId: userId,
      status: DonationListStatus.NOT_SUBMITTED,
    },
    data: { status: DonationListStatus.SUBMITTED },
  });
  if (updated.count === 0) {
    throw new Error(
      "List not found, already submitted, or you do not have access.",
    );
  }

  try {
    const contributorUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    const contributorName = contributorUser
      ? contributorLabel(contributorUser)
      : "Contributor";
    const baseUrl = appPublicOrigin();
    const text = `${contributorName} has sent a donation list for your review, please check your account ${baseUrl}`;

    const filterIds = parseNotifyCharityUserIds();
    const charityProfiles = await prisma.profile.findMany({
      where: {
        role: Role.CHARITY_ORGANIZATION,
        charityWhatsappCountry: { not: null },
        charityWhatsappNationalNumber: { not: null },
        ...(filterIds?.length ? { userId: { in: filterIds } } : {}),
      },
    });

    const seenE164 = new Set<string>();
    for (const p of charityProfiles) {
      const e164 = profileWhatsappToE164(
        p.charityWhatsappCountry,
        p.charityWhatsappNationalNumber,
      );
      if (!e164) {
        continue;
      }
      if (seenE164.has(e164)) {
        continue;
      }
      seenE164.add(e164);
      await sendWasenderTextMessage(e164, text);
    }
  } catch (e) {
    console.error("[submitDonationList] Wasender notification error", e);
  }

  revalidatePath("/donation-lists");
  revalidatePath(`/donation-lists/${id}`);
  redirect("/donation-lists");
}
