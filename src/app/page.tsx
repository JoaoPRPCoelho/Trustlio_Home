import Link from "next/link";
import { GuideCard, ProductTile, SectionHeading } from "@/components/cards";
import { PromoVideo } from "@/components/promo-video";
import { getGuides, getProducts } from "@/lib/data";
import { hubPath } from "@/lib/paths";
import { site, subcategories } from "@/lib/site";
import type { SubcategoryId } from "@/lib/schemas";

const liveSubcategories = (
  Object.entries(subcategories) as [SubcategoryId, (typeof subcategories)[SubcategoryId]][]
).filter(([, s]) => s.live);

const pillarBlurbs: Record<string, string> = {
  evidence: "Two or more independent reviews that show real use, and whether they agree.",
  safety: "Recalls, certifications we could verify, and declared safety warnings.",
  specs: "Published dimensions and materials, and claims you can measure.",
  brand: "A real company with an address, a registered trademark and a track record.",
  warranty: "Warranty length, clear claim terms and spare parts.",
};

export default async function Home() {
  const guides = (await Promise.all(liveSubcategories.map(([id]) => getGuides(id)))).flat();
  const products = getProducts()
    .filter((p) => !p.example && p.trustScore.total !== null)
    .sort((a, b) => (b.trustScore.total ?? 0) - (a.trustScore.total ?? 0));
  const featured = products[0];

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 20%, var(--gold-soft), transparent 40%), radial-gradient(circle at 10% 90%, var(--accent-soft), transparent 45%)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:py-20 lg:grid-cols-[1.15fr_1fr]">
          <div className="rise space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
              Small-space living, scored
            </p>
            <h1 className="font-display text-4xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">
              Gadgets for small homes, <span className="text-accent italic">checked</span> before
              you buy.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted">{site.description}</p>
            <div className="flex flex-wrap gap-3">
              {liveSubcategories.map(([id, s]) => (
                <Link
                  key={id}
                  href={hubPath(id)}
                  className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-deep hover:shadow-md"
                >
                  Browse {s.name}
                </Link>
              ))}
              <Link
                href="/methodology/trust-score/"
                className="rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold transition hover:border-accent hover:text-accent"
              >
                How we score
              </Link>
            </div>
            <dl className="flex flex-wrap gap-x-8 gap-y-3 pt-2 text-sm">
              <div>
                <dt className="text-muted">Products scored</dt>
                <dd className="font-display text-2xl font-semibold">{products.length}</dd>
              </div>
              <div>
                <dt className="text-muted">Buying guides</dt>
                <dd className="font-display text-2xl font-semibold">{guides.length}</dd>
              </div>
              <div>
                <dt className="text-muted">Commission effect on scores</dt>
                <dd className="font-display text-2xl font-semibold">None</dd>
              </div>
            </dl>
          </div>

          <div className="rise relative [animation-delay:150ms]">
            <div
              className="absolute -inset-3 -rotate-2 rounded-3xl bg-brand/10"
              aria-hidden="true"
            />
            <PromoVideo />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-16">
        {/* Guides */}
        {guides.length > 0 && (
          <section className="space-y-8">
            <SectionHeading eyebrow="Start here" title="Latest buying guides">
              Who should buy what, in the first lines, then the evidence.
            </SectionHeading>
            <div className="grid gap-5 md:grid-cols-2">
              {guides.map((g) => (
                <GuideCard key={g.slug} guide={g} />
              ))}
            </div>
          </section>
        )}

        {/* Method */}
        {featured && (
          <section className="rounded-3xl bg-brand-deep px-6 py-12 text-white sm:px-10">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold">
                The Trust Score
              </p>
              <h2 className="font-display text-3xl font-semibold tracking-tight">
                Five pillars, 100 points, a source behind every check
              </h2>
              <p className="text-white/70">
                It answers one question: if you buy this, how likely is it to be safe, do what it
                claims, and be backed by a company that stands behind it?
              </p>
            </div>
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {featured.trustScore.pillars.map((p, i) => (
                <li
                  key={p.key}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
                >
                  <span className="font-display text-3xl font-semibold text-gold">{p.max}</span>
                  <span className="ml-1 text-xs text-white/60">pts</span>
                  <p className="mt-3 font-semibold">
                    <span className="sr-only">Pillar {i + 1}: </span>
                    {p.name}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-white/65">
                    {pillarBlurbs[p.key]}
                  </p>
                </li>
              ))}
            </ol>
            <Link
              href="/methodology/trust-score/"
              className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-deep transition hover:bg-gold-soft"
            >
              Read the full methodology
            </Link>
          </section>
        )}

        {/* Top scores */}
        {products.length > 0 && (
          <section className="space-y-8">
            <SectionHeading eyebrow="Highest Trust Scores" title="Products with the strongest evidence">
              A high Trust Score means strong public evidence. It doesn&apos;t mean the product is
              best for you: the guides cover fit and trade-offs.
            </SectionHeading>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.slice(0, 6).map((p) => (
                <li key={p.id}>
                  <ProductTile product={p} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Categories */}
        <section className="space-y-8">
          <SectionHeading eyebrow="Categories" title="What we cover" />
          <div className="grid gap-5 sm:grid-cols-2">
            {(
              Object.entries(subcategories) as [
                SubcategoryId,
                (typeof subcategories)[SubcategoryId],
              ][]
            ).map(([id, s]) =>
              s.live ? (
                <Link
                  key={id}
                  href={hubPath(id)}
                  className="group rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg"
                >
                  <h3 className="font-display text-2xl font-semibold group-hover:text-accent">
                    {s.name}
                  </h3>
                  <p className="mt-2 text-muted">{s.tagline}</p>
                  <p className="mt-4 text-sm font-semibold text-accent">Explore →</p>
                </Link>
              ) : (
                <div key={id} className="rounded-2xl border border-dashed border-border p-6">
                  <h3 className="font-display text-2xl font-semibold text-muted">{s.name}</h3>
                  <p className="mt-2 text-muted">{s.tagline}</p>
                  <p className="mt-4 text-sm font-medium text-muted">Coming later</p>
                </div>
              ),
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
