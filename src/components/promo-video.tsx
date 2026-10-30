"use client";

import { useEffect, useRef, useState } from "react";

// The 15-second homepage promo (rendered from scripts/promo-video). The page
// ships only the poster: the video has preload="none" and starts from here, so
// it never competes with the hero text. Readers who ask for reduced motion get
// the poster and a play button; everyone else gets a muted loop they can pause.
export function PromoVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Autoplay can be refused (data saver, low power mode): then the poster stays.
    video.play().catch(() => {});
  }, []);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  return (
    <figure className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-xl">
      <video
        ref={ref}
        className="block aspect-video w-full"
        width={1280}
        height={720}
        poster="/video/trustlio-home-promo-poster.webp"
        preload="none"
        muted
        loop
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        aria-label="Trustlio Home in 15 seconds: too many “best” picks? We check the evidence first, with a Trust Score of five pillars, 100 points and public sources, for gadgets picked for small homes."
      >
        <source src="/video/trustlio-home-promo.mp4" type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 bottom-3 grid h-10 w-10 place-items-center rounded-full bg-foreground/75 text-white backdrop-blur transition hover:bg-foreground"
        aria-label={playing ? "Pause video" : "Play video"}
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          {playing ? <path d="M4 3h3v10H4zM9 3h3v10H9z" /> : <path d="M5 3l8 5-8 5z" />}
        </svg>
      </button>
    </figure>
  );
}
