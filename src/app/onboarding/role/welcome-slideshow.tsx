"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  { src: "/image1.webp", alt: "Donation story 1" },
  { src: "/image2.webp", alt: "Donation story 2" },
  { src: "/image3.webp", alt: "Donation story 3" },
  { src: "/thankyou.png", alt: "Thank you" },
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
    <div className="mt-8 overflow-hidden rounded-xl bg-slate-100">
      <div className="relative aspect-[4/3] w-full">
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          sizes="(max-width: 512px) 100vw, 512px"
          className="object-contain"
          priority={index === 0}
        />
      </div>
    </div>
  );
}
