"use client";

import { useActionState, useState, useTransition } from "react";

import {
  createDonationListItem,
  type DonationListItemFormState,
} from "@/app/actions/donation-list-items";
import {
  ActionErrorBox,
  LoadingSpinner,
} from "@/components/action-feedback";
import { useI18n } from "@/components/i18n-provider";
import { PhotoCaptureSlot } from "@/components/photo-capture-slot";
import { actionError, type ActionFailure } from "@/lib/action-result";
import { compressDonationImageIfNeeded } from "@/lib/donation-item-image-compress";

type Props = {
  donationListId: string;
};

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function NewDonationListItemForm({ donationListId }: Props) {
  const { t } = useI18n();
  const [state, formAction] = useActionState<
    DonationListItemFormState,
    FormData
  >(createDonationListItem, null);
  const [clientError, setClientError] = useState<ActionFailure | null>(null);
  const [isPending, startTransition] = useTransition();
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setClientError(null);

    const form = e.currentTarget;
    const fdIn = new FormData(form);
    const description = fdIn.get("description");
    if (typeof description !== "string") {
      setClientError(
        actionError("DESCRIPTION_REQUIRED", "Description is required."),
      );
      return;
    }

    if (!image1 || image1.size === 0) {
      setClientError(
        actionError(
          "IMAGES_REQUIRED",
          "Add at least one image (up to two).",
        ),
      );
      return;
    }
    for (const f of [image1, image2]) {
      if (!f || f.size === 0) continue;
      if (!ALLOWED_IMAGE_TYPES.has(f.type)) {
        setClientError(
          actionError(
            "INVALID_IMAGE_TYPE",
            "Images must be JPEG, PNG, WebP, or GIF.",
          ),
        );
        return;
      }
    }

    try {
      const compressed1 = await compressDonationImageIfNeeded(image1);
      const compressed2 =
        image2 && image2.size > 0
          ? await compressDonationImageIfNeeded(image2)
          : null;

      const fd = new FormData();
      fd.set("donationListId", donationListId);
      fd.set("description", description);
      fd.set("image1", compressed1);
      if (compressed2) fd.set("image2", compressed2);

      startTransition(() => {
        formAction(fd);
      });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not process images.";
      setClientError(actionError("IMAGE_PROCESS_FAILED", msg));
    }
  }

  const banner = clientError ?? state?.error ?? null;

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-lg space-y-6">
      {banner ? <ActionErrorBox error={banner} /> : null}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="description"
          className="text-sm font-medium text-slate-800"
        >
          {t("donationLists.description")}
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          maxLength={5000}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
          placeholder={t("donationLists.descriptionPlaceholder")}
        />
      </div>
      <div className="space-y-4">
        <p className="text-sm font-medium text-slate-800">
          {t("donationLists.imagesLabel")}
        </p>
        <p className="text-xs text-slate-500">
          {t("donationLists.imagesHelp")}
        </p>
        <PhotoCaptureSlot
          id="image1"
          label={t("donationLists.image1")}
          file={image1}
          onFileChange={setImage1}
        />
        <PhotoCaptureSlot
          id="image2"
          label={t("donationLists.image2")}
          file={image2}
          onFileChange={setImage2}
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {isPending ? (
          <LoadingSpinner
            label={t("donationLists.processing")}
          />
        ) : (
          t("donationLists.saveItem")
        )}
      </button>
    </form>
  );
}
