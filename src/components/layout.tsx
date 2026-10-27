import Link from "next/link";
import { site, subcategories } from "@/lib/site";
import { breadcrumbs } from "@/lib/structured-data";

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
            {i > 0 && <span className="mx-2">/</span>}
            {i < crumbs.length - 1 ? (
              <Link href={c.path} className="hover:underline">
                {c.name}
              </Link>
            ) : (
              <span>{c.name}</span>
            )}
          </span>
        ))}
      </nav>
      <JsonLd data={breadcrumbs(crumbs)} />
    </>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4">
        <Link href="/" className="whitespace-nowrap text-lg font-semibold">
          {site.name}
        </Link>
        <nav className="flex flex-wrap gap-x-4 gap-y-1 whitespace-nowrap text-sm">
          {Object.entries(subcategories)
            .filter(([, s]) => s.live)
            .map(([id, s]) => (
              <Link key={id} href={`/${id}/`} className="hover:underline">
                {s.name}
              </Link>
            ))}
          <Link href="/methodology/trust-score/" className="hover:underline">
            How we score
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto max-w-4xl space-y-3 px-4 py-8 text-sm text-muted">
        <nav className="flex flex-wrap gap-4">
          <Link href="/about/">About</Link>
          <Link href="/methodology/trust-score/">Trust score methodology</Link>
          <Link href="/disclosure/">Affiliate disclosure</Link>
          <Link href="/privacy/">Privacy</Link>
        </nav>
        <p>As an Amazon Associate we earn from qualifying purchases.</p>
        <p>© {new Date().getFullYear()} {site.name}</p>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-8">{children}</main>;
}
