"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { removePublicUploadFile, saveDonationItemImage } from "@/lib/donation-item-upload";
import { requireCharityOrganization } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export type CharityImageFormState = { error?: string } | null;

export async function addCharityImage(
  _prev: CharityImageFormState,
  formData: FormData,
) {
  const { userId } = await requireCharityOrganization();

  const file = formData.get("image");
  const captionRaw = formData.get("caption");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Select an image." };
  }
  if (typeof captionRaw !== "string" || captionRaw.trim().length === 0) {
    return { error: "Caption is required." };
  }
  const caption = captionRaw.trim().slice(0, 50);

  let imageUrl: string | null = null;
  try {
    imageUrl = await saveDonationItemImage(file);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Image upload failed.";
    return { error: message };
  }

  try {
    await prisma.charityImage.create({
      data: {
        charityId: userId,
        imageUrl,
        caption,
      },
    });
  } catch (e) {
    await removePublicUploadFile(imageUrl);
    throw e;
  }

  revalidatePath("/profile");
  revalidatePath(`/profile/${userId}/photos`);
  redirect(`/profile/${userId}/photos`);
}

export async function deleteCharityImage(formData: FormData) {
  const { userId } = await requireCharityOrganization();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    throw new Error("Missing id.");
  }

  const img = await prisma.charityImage.findUnique({ where: { id } });
  if (!img || img.charityId !== userId) {
    throw new Error("Not found or access denied.");
  }

  await removePublicUploadFile(img.imageUrl);
  await prisma.charityImage.delete({ where: { id } });

  revalidatePath("/profile");
  revalidatePath(`/profile/${userId}/photos`);
}

