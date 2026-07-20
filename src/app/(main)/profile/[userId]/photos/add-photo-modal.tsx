"use client";

import { useActionState, useState, useTransition } from "react";

import {
  addCharityImage,
  type CharityImageFormState,
} from "@/app/actions/charity-images";
import { compressDonationImageIfNeeded } from "@/lib/donation-item-image-compress";

export function AddPhotoModal() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<CharityImageFormState, FormData>(
    addCharityImage,
    null,
  );
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openModal() {
    setOpen(true);
    setClientError(null);
  }

  function closeModal() {
    setOpen(false);
    setFilePreview(null);
    setClientError(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.currentTarget.files?.[0];
    if (!f) {
      setFilePreview(null);
      return;
    }
    setFilePreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setClientError(null);
    const form = e.currentTarget;
    const fdIn = new FormData(form);
    const raw = form.querySelector<HTMLInputElement>("#charity-image")
      ?.files?.[0];
    if (!raw) {
      setClientError("Select an image.");
      return;
    }
    const caption = fdIn.get("caption");
    if (typeof caption !== "string" || caption.trim().length === 0) {
      setClientError("Caption is required.");
      return;
    }

    try {
      const image = await compressDonationImageIfNeeded(raw);
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
        Add a new photo
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="mx-auto w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-lg font-medium text-slate-900">Add a photo</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {banner ? (
                <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {banner}
                </p>
              ) : null}
              <div>
                <label
                  htmlFor="charity-image"
                  className="text-sm font-medium text-slate-700"
                >
                  Image
                </label>
                <input
                  id="charity-image"
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="mt-2 block w-full text-sm"
                  required
                />
              </div>
              {filePreview ? (
                // eslint-disable-next-line @next/next/no-img-element -- local preview blob
                <img
                  src={filePreview}
                  className="max-h-48 rounded-md object-contain"
                  alt="Preview"
                />
              ) : null}
              <div>
                <label
                  htmlFor="caption"
                  className="text-sm font-medium text-slate-700"
                >
                  Caption (max 50 characters)
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
