"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    src: "/New HP Image 1.jpeg",
    alt: "",
  },
  {
    src: "/New HP Image 2.jpeg",
    alt: "",
  },
  {
    src: "/New HP Image 3.jpeg",
    alt: "",
  },
  {
    src: "/New HP Image 4.jpeg",
    alt: "",
  },
  {
    src: "/New HP Image 5.jpeg",
    alt: "",
  },
  {
    src: "/New HP Image 6.jpeg",
    alt: "",
  },
] as const;

const INTERVAL_MS = 3000;

export function LoginSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative mt-6 aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
      {SLIDES.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          sizes="(max-width: 448px) 100vw, 448px"
          className={`object-cover transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          priority={i === 0}
        />
      ))}
    </div>
  );
}
