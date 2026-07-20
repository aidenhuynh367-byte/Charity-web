"use server";

import { DonationListStatus, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { appPublicOrigin } from "@/lib/app-public-url";
import { requireContributor } from "@/lib/auth-server";
import { contributorLabel } from "@/lib/contributor-label";
import { routedCharityLocationForContributor } from "@/lib/donation-list-routing";
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

  const listId = formData.get("id");
  // Guard: Prisma ignores `undefined` in `where`, which would widen the update.
  if (typeof listId !== "string" || listId.length < 1) {
    throw new Error("Missing list id.");
  }

  const contributorUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
  const contributorLocation =
    contributorUser?.profile?.contributorLocation ?? null;
  const targetCharityLocation =
    routedCharityLocationForContributor(contributorLocation);

  const filterIds = parseNotifyCharityUserIds();
  const selectedCharity = await prisma.profile.findFirst({
    where: {
      role: Role.CHARITY_ORGANIZATION,
      charityLocation: targetCharityLocation,
      ...(filterIds?.length ? { userId: { in: filterIds } } : {}),
    },
    orderBy: { userId: "asc" },
  });
  if (!selectedCharity) {
    throw new Error(
      `No charity organization found for location "${targetCharityLocation}".`,
    );
  }

  // Atomic update of exactly one row: this id, this contributor, still not submitted.
  const updated = await prisma.donationList.updateMany({
    where: {
      AND: [
        { id: listId },
        { contributorId: userId },
        { status: DonationListStatus.NOT_SUBMITTED },
      ],
    },
    data: {
      status: DonationListStatus.SUBMITTED,
      charityId: selectedCharity.userId,
    },
  });
  if (updated.count !== 1) {
    throw new Error(
      "List not found, already submitted, or you do not have access.",
    );
  }

  const list = await prisma.donationList.findFirst({
    where: {
      id: listId,
      contributorId: userId,
      status: DonationListStatus.SUBMITTED,
      charityId: selectedCharity.userId,
    },
  });
  if (!list) {
    throw new Error("Submitted list could not be loaded.");
  }

  try {
    const contributorName = contributorUser
      ? contributorLabel(contributorUser)
      : "Contributor";
    const baseUrl = appPublicOrigin();
    const listUrl = `${baseUrl}/master-donation-lists/${list.id}`;
    const text = `${contributorName} has sent donation list "${list.name}" for your review: ${listUrl}`;

    const e164 = profileWhatsappToE164(
      selectedCharity.charityWhatsappCountry,
      selectedCharity.charityWhatsappNationalNumber,
    );
    if (e164) {
      await sendWasenderTextMessage(e164, text);
    }
  } catch (e) {
    console.error("[submitDonationList] Wasender notification error", e);
  }

  revalidatePath("/donation-lists");
  revalidatePath(`/donation-lists/${list.id}`);
  revalidatePath("/master-donation-lists");
  revalidatePath(`/master-donation-lists/${list.id}`);
  redirect("/donation-lists");
}
