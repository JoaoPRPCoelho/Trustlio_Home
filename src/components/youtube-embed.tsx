"use client";

import { useState } from "react";

// A lite YouTube embed: the page ships a thumbnail and a link, and the real
// player (about 1 MB of scripts) loads only when the reader clicks play.
// Without JavaScript the link opens the video on YouTube. The player uses
// youtube-nocookie.com, YouTube's privacy-enhanced mode.
export function YouTubeEmbed({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        className="aspect-video w-full rounded-md"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        // YouTube refuses to play embeds that send no Referer (error 153).
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  return (
    <a
      href={`https://www.youtube.com/watch?v=${id}`}
      onClick={(e) => {
        e.preventDefault();
        setPlaying(true);
      }}
      className="group relative block aspect-video w-full overflow-hidden rounded-md bg-black"
      aria-label={`Play video: ${title}`}
    >
      {/* A plain img: the thumbnail is YouTube's, so there is nothing to optimize. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-14 w-20 items-center justify-center rounded-xl bg-[#ff0033] shadow-lg">
          <svg viewBox="0 0 24 24" className="h-8 w-8 fill-white" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </a>
  );
}
