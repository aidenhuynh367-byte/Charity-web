"use client";

import { useEffect, useState } from "react";

import { useI18n } from "@/components/i18n-provider";

type CharityPhoto = {
  id: string;
  imageUrl: string;
  caption: string | null;
};

export function CharityPhotoGrid({ images }: { images: CharityPhoto[] }) {
  const { t } = useI18n();
  const [active, setActive] = useState<CharityPhoto | null>(null);

  useEffect(() => {
    if (!active) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setActive(null);
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [active]);

  if (images.length === 0) {
    return <p className="mt-4 text-sm text-slate-600">{t("photos.empty")}</p>;
  }

  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img) => (
          <div
            key={img.id}
            className="overflow-hidden rounded-lg border border-slate-200 bg-white"
          >
            <button
              type="button"
              onClick={() => setActive(img)}
              className="block w-full cursor-zoom-in text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              aria-label={t("photos.viewFull")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- user uploads from public/ or GCS */}
              <img
                src={img.imageUrl}
                alt={img.caption || t("photos.alt")}
                className="h-48 w-full object-cover transition hover:opacity-95"
              />
            </button>
            {img.caption ? (
              <p className="px-3 py-2 text-sm text-slate-800">{img.caption}</p>
            ) : null}
          </div>
        ))}
      </div>

      {active ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.caption || t("photos.alt")}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            className="absolute right-4 top-4 rounded-md bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-white"
          >
            {t("photos.close")}
          </button>
          <div
            className="max-h-full max-w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- user uploads from public/ or GCS */}
            <img
              src={active.imageUrl}
              alt={active.caption || t("photos.alt")}
              className="max-h-[90vh] max-w-[min(100vw-2rem,1200px)] object-contain"
            />
            {active.caption ? (
              <p className="mt-3 text-center text-sm text-white">
                {active.caption}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
