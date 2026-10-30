// The Trustlio Home logo: the name in Fraunces, with a small house as the dot
// on the i. The visual is hidden from screen readers and crawlers, which get
// the plain name instead of the dotless "ı". The square icon (a "t" with the
// house) lives in src/app/icon.svg, with PNG exports for older browsers.

const House = ({ className }: { className: string }) => (
  <svg viewBox="0 0 12 11" className={className} aria-hidden="true">
    <path d="M1 5.4 6 1l5 4.4V10H1z" fill="var(--gold)" />
  </svg>
);

export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="sr-only">Trustlio Home</span>
      <span
        aria-hidden="true"
        className={`font-display text-[1.65rem] leading-none font-bold tracking-tight ${
          tone === "light" ? "text-white" : "text-foreground"
        }`}
      >
        trustl
        {/* The house is wider than the i's stem, so the i gets a little room
            of its own to keep the roof clear of the "l". */}
        <span className="relative mr-[0.02em] ml-[0.055em]">
          ı
          <House className="absolute top-[0.05em] left-1/2 w-[0.34em] -translate-x-1/2 transition-transform duration-300 group-hover:-translate-y-0.5" />
        </span>
        o
      </span>
      <span
        aria-hidden="true"
        className={`text-[0.7rem] font-semibold tracking-[0.2em] ${
          tone === "light" ? "text-white/60" : "text-accent"
        }`}
      >
        HOME
      </span>
    </span>
  );
}
