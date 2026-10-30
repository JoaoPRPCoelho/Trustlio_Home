import Link from "next/link";
import { site, subcategories } from "@/lib/site";
import { breadcrumbs } from "@/lib/structured-data";
import { Logo } from "./logo";

export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here apart from a closing script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

// The manual snippet, so it works whether or not Cloudflare can inject it into
// static-asset responses. Turn off automatic setup in the dashboard to avoid
// counting visits twice.
export function Analytics() {
  if (!site.cloudflareAnalyticsToken) return null;
  return (
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token: site.cloudflareAnalyticsToken })}
    />
  );
}

export function Breadcrumbs({ crumbs }: { crumbs: { name: string; path: string }[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        {crumbs.map((c, i) => (
          <span key={c.path}>
            {i > 0 && <span className="mx-2 text-border">/</span>}
            {i < crumbs.length - 1 ? (
              <Link href={c.path} className="hover:text-accent">
                {c.name}
              </Link>
            ) : (
              <span className="text-foreground/70">{c.name}</span>
            )}
          </span>
        ))}
      </nav>
      <JsonLd data={breadcrumbs(crumbs)} />
    </>
  );
}

const navLinks = () => [
  ...Object.entries(subcategories)
    .filter(([, s]) => s.live)
    .map(([id, s]) => ({ href: `/${id}/`, label: s.name })),
  { href: "/methodology/trust-score/", label: "How we score" },
  { href: "/about/", label: "About" },
];

// The mobile menu is a native <details>, so it works without JavaScript.
export function SiteHeader() {
  const links = navLinks();
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="group">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 text-sm font-medium sm:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-foreground/80 transition hover:bg-accent-soft hover:text-accent"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <details className="relative sm:hidden">
          <summary
            className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-border bg-surface"
            aria-label="Menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </summary>
          <nav className="absolute right-0 mt-2 flex w-56 flex-col rounded-2xl border border-border bg-surface p-2 text-sm font-medium shadow-xl">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-xl px-3 py-2.5 hover:bg-accent-soft">
                {l.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-brand-deep text-white/75">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo tone="light" />
          <p className="max-w-sm text-sm leading-relaxed">
            Every pick gets a Trust Score from public, verifiable evidence, with a source behind
            every check. Commissions never change a score.
          </p>
        </div>
        <nav className="flex flex-col gap-2 text-sm" aria-label="Guides">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gold">Explore</p>
          {Object.entries(subcategories)
            .filter(([, s]) => s.live)
            .map(([id, s]) => (
              <Link key={id} href={`/${id}/`} className="hover:text-white">
                {s.name}
              </Link>
            ))}
          <Link href="/methodology/trust-score/" className="hover:text-white">
            Trust Score methodology
          </Link>
          <a href="/trust-score/data.json" className="hover:text-white">
            Open data (JSON)
          </a>
        </nav>
        <nav className="flex flex-col gap-2 text-sm" aria-label="About">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gold">About</p>
          <Link href="/about/" className="hover:text-white">
            About us
          </Link>
          <Link href="/disclosure/" className="hover:text-white">
            Affiliate disclosure
          </Link>
          <Link href="/privacy/" className="hover:text-white">
            Privacy
          </Link>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-5 text-xs text-white/55">
          <p>As an Amazon Associate we earn from qualifying purchases.</p>
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
        </div>
      </div>
    </footer>
  );
}

export function PageShell({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <main
      className={`mx-auto w-full flex-1 space-y-8 px-4 py-8 sm:py-10 ${wide ? "max-w-6xl" : "max-w-4xl"}`}
    >
      {children}
    </main>
  );
}
