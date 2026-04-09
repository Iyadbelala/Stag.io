"use client";

import { useState, useEffect, useCallback } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

export interface SlideData {
  title: string;
  icon: React.ReactNode;
}

interface SlideProps {
  slides: SlideData[];
  autoPlayMs?: number;
}

export default function Slide({ slides, autoPlayMs = 5000 }: SlideProps) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(
    () => setCurrent((i) => (i + 1) % slides.length),
    [slides.length]
  );

  const prev = useCallback(
    () => setCurrent((i) => (i - 1 + slides.length) % slides.length),
    [slides.length]
  );

  /* auto-play */
  useEffect(() => {
    const id = setInterval(next, autoPlayMs);
    return () => clearInterval(id);
  }, [next, autoPlayMs]);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Slide track */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className="flex w-full shrink-0 flex-col items-center px-4 text-center"
          >
            {/* Icon */}
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-coffee-gold/20 text-coffee-warm">
              {slide.icon}
            </div>
            <h3 className="mb-3 text-xl font-semibold text-coffee-dark">
              {slide.title}
            </h3>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-surface-sand bg-surface-white/80 p-2 text-coffee-dark shadow-sm backdrop-blur-sm transition-colors hover:bg-coffee-gold/20 cursor-pointer"
      >
        <HiChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-surface-sand bg-surface-white/80 p-2 text-coffee-dark shadow-sm backdrop-blur-sm transition-colors hover:bg-coffee-gold/20 cursor-pointer"
      >
        <HiChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="mt-8 flex items-center justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              idx === current
                ? "w-6 bg-coffee-warm"
                : "w-2 bg-coffee-warm/30 hover:bg-coffee-warm/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
