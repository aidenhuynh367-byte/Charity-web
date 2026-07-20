"use server";

import {
  DonationListItemCharityDecision,
  DonationListItemReviewStatus,
  DonationListStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { appPublicOrigin } from "@/lib/app-public-url";
import { requireCharityOrganization } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { profileWhatsappToE164 } from "@/lib/profile-whatsapp-e164";
import { sendWasenderTextMessage } from "@/lib/wasender";

const decisionSchema = z.enum(["ACCEPT", "NOT_ACCEPT"]);

export async function reviewDonationListItem(
  formData: FormData,
): Promise<{ error?: string }> {
  const { userId } = await requireCharityOrganization();

  const itemId = formData.get("itemId");
  const decisionRaw = formData.get("decision");
  if (typeof itemId !== "string" || !itemId) {
    return { error: "Missing item." };
  }
  const parsed = decisionSchema.safeParse(decisionRaw);
  if (!parsed.success) {
    return { error: "Choose Accept or Not accept." };
  }
  const decision =
    parsed.data === "ACCEPT"
      ? DonationListItemCharityDecision.ACCEPT
      : DonationListItemCharityDecision.NOT_ACCEPT;

  const item = await prisma.donationListItem.findFirst({
    where: {
      id: itemId,
      donationList: {
        charityId: userId,
        status: DonationListStatus.SUBMITTED,
      },
    },
    include: {
      donationList: true,
    },
  });
  if (!item || item.donationList.status !== DonationListStatus.SUBMITTED) {
    return { error: "Item not found or list is not submitted." };
  }

  await prisma.donationListItem.update({
    where: { id: item.id },
    data: {
      charityDecision: decision,
      reviewStatus: DonationListItemReviewStatus.REVIEWED,
    },
  });

  revalidatePath("/master-donation-lists");
  revalidatePath(`/master-donation-lists/${item.donationListId}`);
  return {};
}

const responseMessageSchema = z
  .string()
  .trim()
  .min(1, "Enter a message.")
  .max(8000, "Message is too long.");

export type CharityResponseFormState = { error?: string } | null;

export async function submitCharityResponseToContributor(
  _prev: CharityResponseFormState,
  formData: FormData,
): Promise<CharityResponseFormState> {
  const { userId, profile } = await requireCharityOrganization();
  const charityUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  const organizationName =
    profile.organizationName?.trim() ||
    charityUser?.name?.trim() ||
    "Charity";

  const listId = formData.get("listId");
  const messageRaw = formData.get("message");
  if (typeof listId !== "string" || !listId) {
    return { error: "Missing list." };
  }
  if (typeof messageRaw !== "string") {
    return { error: "Enter a message." };
  }
  const parsed = responseMessageSchema.safeParse(messageRaw);
  if (!parsed.success) {
    const msg = parsed.error.flatten().formErrors[0] ?? "Invalid message.";
    return { error: msg };
  }

  const list = await prisma.donationList.findFirst({
    where: {
      id: listId,
      charityId: userId,
      status: DonationListStatus.SUBMITTED,
    },
    include: {
      items: true,
      contributor: { include: { profile: true } },
    },
  });
  if (!list) {
    return { error: "List not found." };
  }
  if (list.items.length === 0) {
    return { error: "This list has no items to review." };
  }
  const allReviewed = list.items.every(
    (i) => i.reviewStatus === DonationListItemReviewStatus.REVIEWED,
  );
  if (!allReviewed) {
    return { error: "All items must be reviewed first." };
  }

  await prisma.donationList.update({
    where: { id: list.id },
    data: {
      charityResponseMessage: parsed.data,
      charityRespondedAt: new Date(),
      status: DonationListStatus.REVIEWED,
    },
  });

  try {
    const listUrl = `${appPublicOrigin()}/donation-lists/${list.id}`;
    const text = `${organizationName} has responded to you, please check your account ${listUrl}`;
    const prof = list.contributor.profile;
    const e164 = profileWhatsappToE164(
      prof?.contributorWhatsappCountry,
      prof?.contributorWhatsappNationalNumber,
    );
    if (e164) {
      await sendWasenderTextMessage(e164, text);
    }
  } catch (e) {
    console.error(
      "[submitCharityResponseToContributor] Wasender notification error",
      e,
    );
  }

  revalidatePath("/master-donation-lists");
  revalidatePath(`/master-donation-lists/${list.id}`);
  revalidatePath(`/master-donation-lists/${list.id}/respond`);
  revalidatePath("/donation-lists");
  revalidatePath(`/donation-lists/${list.id}`);
  redirect("/master-donation-lists");
}
