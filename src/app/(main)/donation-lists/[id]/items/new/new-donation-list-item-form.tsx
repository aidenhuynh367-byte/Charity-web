"use client";

import { useActionState, useState, useTransition } from "react";

import {
  createDonationListItem,
  type DonationListItemFormState,
} from "@/app/actions/donation-list-items";
import { PhotoCaptureSlot } from "@/components/photo-capture-slot";
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
  const [state, formAction] = useActionState<
    DonationListItemFormState,
    FormData
  >(createDonationListItem, null);
  const [clientError, setClientError] = useState<string | null>(null);
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
      setClientError("Description is required.");
      return;
    }

    if (!image1 || image1.size === 0) {
      setClientError("Add at least one image (up to two).");
      return;
    }
    for (const f of [image1, image2]) {
      if (!f || f.size === 0) continue;
      if (!ALLOWED_IMAGE_TYPES.has(f.type)) {
        setClientError("Images must be JPEG, PNG, WebP, or GIF.");
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
      setClientError(msg);
    }
  }

  const banner = clientError ?? state?.error;

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-lg space-y-6">
      {banner ? (
        <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {banner}
        </p>
      ) : null}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="description"
          className="text-sm font-medium text-slate-800"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          maxLength={5000}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
          placeholder="Describe this donation item…"
        />
      </div>
      <div className="space-y-4">
        <p className="text-sm font-medium text-slate-800">
          Images (1 required, up to 2)
        </p>
        <p className="text-xs text-slate-500">
          JPEG, PNG, WebP, or GIF. Up to 2.5 MB per file before compression. Any
          file over 1 MB is resized in your browser to 1 MB or less, then
          uploaded.
        </p>
        <PhotoCaptureSlot
          id="image1"
          label="Image 1"
          file={image1}
          onFileChange={setImage1}
        />
        <PhotoCaptureSlot
          id="image2"
          label="Image 2 (optional)"
          file={image2}
          onFileChange={setImage2}
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {isPending ? "Processing…" : "Save item"}
      </button>
    </form>
  );
}
