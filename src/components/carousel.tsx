"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type CarouselThumb = { src: string; label: string; video: boolean };

// A scroll-snap track: every slide is in the HTML, and without JavaScript the
// reader can still swipe or scroll through it. The script only adds the arrows,
// the thumbnails and the "2 / 5" counter.
export function Carousel({ slides, thumbs, label }: { slides: ReactNode[]; thumbs: CarouselThumb[]; label: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setCurrent(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { root: el, threshold: 0.6 },
    );
    for (const child of Array.from(el.children)) observer.observe(child);
    return () => observer.disconnect();
  }, []);

  const go = (i: number) => {
    const el = track.current;
    const target = el?.children[(i + slides.length) % slides.length] as HTMLElement | undefined;
    if (el && target) el.scrollTo({ left: target.offsetLeft - el.offsetLeft, behavior: "smooth" });
  };

  const many = slides.length > 1;

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label}>
      <div className="relative">
        <div
          ref={track}
          tabIndex={0}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-xl [scrollbar-width:none] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent [&::-webkit-scrollbar]:hidden"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(current + 1);
            if (e.key === "ArrowLeft") go(current - 1);
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              data-index={i}
              className="w-full shrink-0 snap-center"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}: ${thumbs[i].label}`}
            >
              {slide}
            </div>
          ))}
        </div>
        {many && (
          <>
            <Arrow dir="prev" onClick={() => go(current - 1)} />
            <Arrow dir="next" onClick={() => go(current + 1)} />
            <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-brand-deep/80 px-2.5 py-0.5 text-xs font-medium text-white tabular-nums">
              {current + 1} / {slides.length}
            </span>
          </>
        )}
      </div>
      {many && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {thumbs.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show ${t.label}`}
              aria-current={i === current}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-surface transition ${
                i === current ? "border-accent" : "border-border opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.src} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
              {t.video && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white drop-shadow" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Arrow({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? "Previous" : "Next"}
      className={`absolute top-[40%] -translate-y-1/2 ${
        dir === "prev" ? "left-3" : "right-3"
      } flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface/90 text-foreground shadow-sm transition hover:shadow-md`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d={dir === "prev" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
      </svg>
    </button>
  );
}
