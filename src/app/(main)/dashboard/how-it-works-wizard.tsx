"use client";

import Image from "next/image";
import { useState } from "react";

import { useI18n } from "@/components/i18n-provider";
import type { Dictionary } from "@/i18n/t";

const STEP_IMAGES = [
  "/how-it-works/01-account-new.jpeg",
  "/how-it-works/02-list.webp",
  "/how-it-works/03-submit.webp",
  "/how-it-works/04-sent.webp",
  "/how-it-works/05-review.webp",
  "/how-it-works/06-coordinate.webp",
  "/how-it-works/07-deliver.webp",
] as const;

type HowItWorksStepCopy = {
  title: string;
  description: string;
  alt: string;
};

function howItWorksSteps(dict: Dictionary): HowItWorksStepCopy[] {
  const section = dict.howItWorks;
  if (!section || typeof section === "string" || Array.isArray(section)) {
    return [];
  }
  const list = section.steps;
  if (!Array.isArray(list)) return [];
  return list.filter(
    (item): item is HowItWorksStepCopy =>
      !!item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      typeof item.title === "string" &&
      typeof item.description === "string" &&
      typeof item.alt === "string",
  );
}

export function HowItWorksWizard() {
  const { t, dict } = useI18n();
  const [index, setIndex] = useState(0);
  const copySteps = howItWorksSteps(dict);
  const total = Math.min(copySteps.length, STEP_IMAGES.length);
  const safeIndex = total === 0 ? 0 : index % total;
  const copy = copySteps[safeIndex];
  const src = STEP_IMAGES[safeIndex];

  function goNext() {
    if (total === 0) return;
    setIndex((current) => (current + 1) % total);
  }

  if (!copy || !src) return null;

  return (
    <section className="mt-8" aria-label={t("howItWorks.aria")}>
      <h2 className="text-lg font-semibold text-slate-900">
        {t("howItWorks.title")}
      </h2>
      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="relative aspect-[4/3] w-full bg-slate-50">
          <Image
            key={src}
            src={src}
            alt={copy.alt}
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-contain p-2"
            priority={safeIndex === 0}
          />
        </div>
        <div className="border-t border-slate-100 px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {t("howItWorks.stepOf", { n: safeIndex + 1, total })}
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-900">
            {copy.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {copy.description}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-1.5" aria-hidden>
              {STEP_IMAGES.slice(0, total).map((imageSrc, i) => (
                <span
                  key={imageSrc}
                  className={`h-1.5 w-1.5 rounded-full ${
                    i === safeIndex ? "bg-slate-800" : "bg-slate-300"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={goNext}
              className="text-sm font-medium text-slate-900 underline underline-offset-2 hover:text-slate-700"
            >
              {t("howItWorks.next")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
