"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  { src: "/New HP Image 1.jpeg", alt: "" },
  { src: "/New HP Image 2.jpeg", alt: "" },
  { src: "/New HP Image 3.jpeg", alt: "" },
  { src: "/New HP Image 4.jpeg", alt: "" },
  { src: "/New HP Image 5.jpeg", alt: "" },
  { src: "/New HP Image 6.jpeg", alt: "" },
] as const;

const INTERVAL_MS = 2000;

export function WelcomeSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  const slide = SLIDES[index];

  return (
    <div className="mx-auto mt-8 w-full max-w-sm overflow-hidden rounded-xl bg-slate-100 sm:max-w-md">
      <div className="relative aspect-[9/12.96] w-full">
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          sizes="(max-width: 448px) 100vw, 448px"
          className="object-contain"
          priority={index === 0}
        />
      </div>
    </div>
  );
}
