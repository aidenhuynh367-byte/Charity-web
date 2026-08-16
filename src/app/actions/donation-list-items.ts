"use server";

import { DonationListStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import {
  actionError,
  toActionFailure,
  type ActionFormState,
} from "@/lib/action-result";
import { removePublicUploadFile, saveDonationItemImage } from "@/lib/donation-item-upload";
import { requireContributor } from "@/lib/auth-server";
import { donationListItemDescriptionSchema } from "@/lib/validation/donation-list-item";
import { prisma } from "@/lib/prisma";

export type DonationListItemFormState = ActionFormState;

function collectImageFiles(formData: FormData): File[] {
  const f1 = formData.get("image1");
  const f2 = formData.get("image2");
  const out: File[] = [];
  if (f1 instanceof File && f1.size > 0) out.push(f1);
  if (f2 instanceof File && f2.size > 0) out.push(f2);
  return out;
}

export async function createDonationListItem(
  _prev: DonationListItemFormState,
  formData: FormData,
): Promise<DonationListItemFormState> {
  try {
    const { userId } = await requireContributor();

    const donationListId = formData.get("donationListId");
    if (typeof donationListId !== "string" || !donationListId) {
      return {
        error: actionError("MISSING_LIST_ID", "Missing donation list."),
      };
    }

    const list = await prisma.donationList.findFirst({
      where: { id: donationListId, contributorId: userId },
    });
    if (!list) {
      return {
        error: actionError(
          "LIST_NOT_FOUND",
          "List not found or access denied.",
        ),
      };
    }
    if (list.status !== DonationListStatus.NOT_SUBMITTED) {
      return {
        error: actionError(
          "LIST_ALREADY_SUBMITTED",
          "You can only add items while the list is not submitted.",
        ),
      };
    }

    const parsed = donationListItemDescriptionSchema.safeParse({
      description: formData.get("description"),
    });
    if (!parsed.success) {
      const msg =
        parsed.error.flatten().fieldErrors.description?.[0] ??
        "Invalid description.";
      return { error: actionError("INVALID_DESCRIPTION", msg) };
    }

    const images = collectImageFiles(formData);
    if (images.length < 1) {
      return {
        error: actionError(
          "IMAGES_REQUIRED",
          "Add at least one image (up to two).",
        ),
      };
    }
    if (images.length > 2) {
      return {
        error: actionError(
          "TOO_MANY_IMAGES",
          "You can upload at most two images.",
        ),
      };
    }

    let imageUrl1: string | null = null;
    let imageUrl2: string | null = null;
    try {
      imageUrl1 = await saveDonationItemImage(images[0]!);
      if (images[1]) {
        imageUrl2 = await saveDonationItemImage(images[1]);
      }
    } catch (e) {
      await removePublicUploadFile(imageUrl1);
      await removePublicUploadFile(imageUrl2);
      const message = e instanceof Error ? e.message : "Image upload failed.";
      return { error: actionError("IMAGE_UPLOAD_FAILED", message) };
    }

    try {
      await prisma.donationListItem.create({
        data: {
          description: parsed.data.description,
          imageUrl1,
          imageUrl2,
          donationListId: list.id,
        },
      });
    } catch (e) {
      await removePublicUploadFile(imageUrl1);
      await removePublicUploadFile(imageUrl2);
      throw e;
    }

    revalidatePath("/donation-lists");
    revalidatePath(`/donation-lists/${list.id}`);
    redirect(`/donation-lists/${list.id}`);
  } catch (e) {
    if (isRedirectError(e)) throw e;
    return { error: toActionFailure(e, "CREATE_ITEM_FAILED") };
  }
}

export async function deleteDonationListItem(formData: FormData) {
  const { userId } = await requireContributor();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    throw new Error("Missing item id.");
  }

  const item = await prisma.donationListItem.findFirst({
    where: {
      id,
      donationList: { contributorId: userId },
    },
    include: { donationList: true },
  });
  if (!item) {
    throw new Error("Item not found or access denied.");
  }
  if (item.donationList.status !== DonationListStatus.NOT_SUBMITTED) {
    throw new Error("You can only remove items while the list is not submitted.");
  }

  await removePublicUploadFile(item.imageUrl1);
  await removePublicUploadFile(item.imageUrl2);

  await prisma.donationListItem.delete({ where: { id: item.id } });

  revalidatePath("/donation-lists");
  revalidatePath(`/donation-lists/${item.donationListId}`);
  redirect(`/donation-lists/${item.donationListId}`);
}
