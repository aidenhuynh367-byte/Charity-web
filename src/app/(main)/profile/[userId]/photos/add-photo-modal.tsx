"use client";

import { useActionState, useState, useTransition } from "react";

import {
  addCharityImage,
  type CharityImageFormState,
} from "@/app/actions/charity-images";
import { useI18n } from "@/components/i18n-provider";
import { PhotoCaptureSlot } from "@/components/photo-capture-slot";
import { compressDonationImageIfNeeded } from "@/lib/donation-item-image-compress";

export function AddPhotoModal() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<CharityImageFormState, FormData>(
    addCharityImage,
    null,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openModal() {
    setOpen(true);
    setClientError(null);
    setImageFile(null);
  }

  function closeModal() {
    setOpen(false);
    setImageFile(null);
    setClientError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setClientError(null);
    const form = e.currentTarget;
    const fdIn = new FormData(form);
    if (!imageFile) {
      setClientError("Select an image.");
      return;
    }
    const caption = fdIn.get("caption");
    if (typeof caption !== "string" || caption.trim().length === 0) {
      setClientError("Caption is required.");
      return;
    }

    try {
      const image = await compressDonationImageIfNeeded(imageFile);
      const fd = new FormData();
      fd.set("image", image);
      fd.set("caption", caption.trim().slice(0, 50));
      startTransition(() => formAction(fd));
    } catch (err) {
      setClientError(
        err instanceof Error ? err.message : "Could not process image.",
      );
    }
  }

  const banner = clientError ?? state?.error;

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
      >
        {t("photos.addOpen")}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="mx-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-lg font-medium text-slate-900">
              {t("photos.addTitle")}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {banner ? (
                <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {banner}
                </p>
              ) : null}
              <PhotoCaptureSlot
                id="charity-image"
                label={t("photos.image")}
                file={imageFile}
                onFileChange={setImageFile}
                overlayClassName="z-[60]"
              />
              <div>
                <label
                  htmlFor="caption"
                  className="text-sm font-medium text-slate-700"
                >
                  {t("photos.caption")}
                </label>
                <input
                  id="caption"
                  name="caption"
                  maxLength={50}
                  required
                  className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {isPending ? t("photos.saving") : t("photos.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
