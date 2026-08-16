"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { deleteCharityImage } from "@/app/actions/charity-images";
import { useI18n } from "@/components/i18n-provider";

export function DeletePhotoForm({ id }: { id: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!window.confirm(t("photos.deleteConfirm"))) return;
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          await deleteCharityImage(fd);
          router.refresh();
        });
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={isPending}
        className="text-sm text-red-600 hover:underline disabled:opacity-60"
      >
        {t("photos.delete")}
      </button>
    </form>
  );
}
