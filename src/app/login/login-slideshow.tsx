"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    src: "/login-slideshow/01-courtyard.webp",
    alt: "Balinese orphanage courtyard in Bali",
  },
  {
    src: "/login-slideshow/02-study-hall.webp",
    alt: "Study hall at a children's home in Bali",
  },
  {
    src: "/login-slideshow/03-donations.webp",
    alt: "Donations prepared for children at a Bali orphanage",
  },
  {
    src: "/login-slideshow/04-entrance.webp",
    alt: "Entrance to a Balinese orphanage compound",
  },
  {
    src: "/login-slideshow/05-orphans.webp",
    alt: "Balinese children at a children's home courtyard",
  },
  {
    src: "/login-slideshow/06-orphans.webp",
    alt: "Balinese children reading together",
  },
  {
    src: "/login-slideshow/07-orphans.webp",
    alt: "Balinese children playing in an orphanage courtyard",
  },
  {
    src: "/login-slideshow/08-orphans.webp",
    alt: "Balinese children walking to their children's home",
  },
  {
    src: "/login-slideshow/09-orphans.webp",
    alt: "Balinese children sharing a meal together",
  },
  {
    src: "/login-slideshow/10-orphans.webp",
    alt: "Balinese children drawing and coloring",
  },
  {
    src: "/login-slideshow/11-orphans.webp",
    alt: "Balinese children practicing traditional arts",
  },
  {
    src: "/login-slideshow/12-orphans.webp",
    alt: "Balinese children together at their children's home",
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
