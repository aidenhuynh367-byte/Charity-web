"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  { src: "/welcome-image1.jpeg", alt: "Welcome image 1" },
  { src: "/welcome-image2.jpeg", alt: "Welcome image 2" },
  { src: "/welcome-image3.jpeg", alt: "Welcome image 3" },
  { src: "/welcome-image4.jpeg", alt: "Welcome image 4" },
  { src: "/welcome-image5.jpeg", alt: "Welcome image 5" },
  { src: "/welcome-image6.jpeg", alt: "Welcome image 6" },
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
