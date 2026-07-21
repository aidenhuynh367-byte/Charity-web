"use server";

import { DonationListStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { appPublicOrigin } from "@/lib/app-public-url";
import { requireCharityOrganization } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { profileWhatsappToE164 } from "@/lib/profile-whatsapp-e164";
import { sendWasenderTextMessage } from "@/lib/wasender";

export async function giveThanksForDonationList(formData: FormData) {
  const { userId } = await requireCharityOrganization();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    throw new Error("Missing list id.");
  }

  const list = await prisma.donationList.findFirst({
    where: {
      id,
      charityId: userId,
      status: DonationListStatus.REVIEWED,
    },
    include: {
      contributor: { include: { profile: true } },
    },
  });
  if (!list) {
    throw new Error("List not found or not eligible for Give Thanks.");
  }

  await prisma.donationList.update({
    where: { id: list.id },
    data: {
      status: DonationListStatus.COMPLETED,
      completedAt: new Date(),
    },
  });

  try {
    const origin = appPublicOrigin();
    const thankYouUrl = `${origin}/contributor-thank-you/${list.id}`;
    const shareUrl = `${origin}/contributor-thank-you/${list.id}/share`;
    const text = [
      "Thank you for your generosity, it is greatly appreciated. Your kindness will be remembered.",
      thankYouUrl,
      "",
      "Share this kindness with your friends, community to continue to help those in need.",
      shareUrl,
    ].join("\n");

    const prof = list.contributor.profile;
    const e164 = profileWhatsappToE164(
      prof?.contributorWhatsappCountry,
      prof?.contributorWhatsappNationalNumber,
    );
    if (e164) {
      await sendWasenderTextMessage(e164, text);
    }
  } catch (e) {
    console.error("[giveThanksForDonationList] Wasender notification error", e);
  }

  revalidatePath("/master-donation-lists");
  revalidatePath(`/master-donation-lists/${id}`);
  revalidatePath("/thank-you");
  revalidatePath(`/contributor-thank-you/${id}`);
  revalidatePath(`/contributor-thank-you/${id}/share`);
  revalidatePath("/donation-lists");
  revalidatePath(`/donation-lists/${id}`);
}
