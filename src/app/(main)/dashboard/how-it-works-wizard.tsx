"use client";

import Image from "next/image";
import { useState } from "react";

const STEPS = [
  {
    title: "Create an account",
    description:
      "The contributor creates an account to get started with Charity Link.",
    src: "/how-it-works/01-account-new.jpeg",
    alt: "Contributor creating an account",
  },
  {
    title: "Build your donation list",
    description:
      "The contributor creates a donation list and adds donation items.",
    src: "/how-it-works/02-list.webp",
    alt: "Contributor adding items to a donation list",
  },
  {
    title: "Submit your list",
    description: "The contributor submits the donation list.",
    src: "/how-it-works/03-submit.webp",
    alt: "Contributor submitting a donation list",
  },
  {
    title: "Sent to a nearby charity",
    description:
      "The donation list gets sent to a nearby orphanage / charity.",
    src: "/how-it-works/04-sent.webp",
    alt: "Donation list sent to a nearby charity",
  },
  {
    title: "Charity reviews and responds",
    description:
      "The charity reviews the items, confirms their needs, and responds to the contributor.",
    src: "/how-it-works/05-review.webp",
    alt: "Charity reviewing donation items",
  },
  {
    title: "Coordinate delivery",
    description:
      "The contributor then contacts the charity and coordinates a delivery time.",
    src: "/how-it-works/06-coordinate.webp",
    alt: "Contributor coordinating delivery with the charity",
  },
  {
    title: "Send your donation",
    description: "The contributor sends the donation to the charity.",
    src: "/how-it-works/07-deliver.webp",
    alt: "Contributor delivering donations to the charity",
  },
] as const;

export function HowItWorksWizard() {
  const [index, setIndex] = useState(0);
  const step = STEPS[index];

  function goNext() {
    setIndex((current) => (current + 1) % STEPS.length);
  }

  return (
    <section className="mt-8" aria-label="How Charity Link works">
      <h2 className="text-lg font-semibold text-slate-900">How it works</h2>
      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="relative aspect-[4/3] w-full bg-slate-50">
          <Image
            key={step.src}
            src={step.src}
            alt={step.alt}
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-contain p-2"
            priority={index === 0}
          />
        </div>
        <div className="border-t border-slate-100 px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Step {index + 1} of {STEPS.length}
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-900">
            {step.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {step.description}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-1.5" aria-hidden>
              {STEPS.map((_, i) => (
                <span
                  key={STEPS[i].src}
                  className={`h-1.5 w-1.5 rounded-full ${
                    i === index ? "bg-slate-800" : "bg-slate-300"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={goNext}
              className="text-sm font-medium text-slate-900 underline underline-offset-2 hover:text-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
