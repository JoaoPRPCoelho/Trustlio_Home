import type { Metadata } from "next";
import { Breadcrumbs, JsonLd, PageShell } from "@/components/layout";
import { AffiliateDisclosure, ExampleBanner } from "@/components/notices";
import { ProductGallery } from "@/components/media";
import { BuyButtons } from "@/components/product";
import {
  EvidenceTag,
  FitScoreBreakdown,
  TrustScoreBreakdown,
  SourcesDisclosure,
  TrustScoreBadge,
  TrustSources,
} from "@/components/trust-score";
import { formatPriceBand } from "@/lib/affiliate";
import { getProduct, getProducts } from "@/lib/data";
import { hubPath, reviewPath } from "@/lib/paths";
import { site, subcategories } from "@/lib/site";
import { productReview } from "@/lib/structured-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProducts()
    .filter((p) => subcategories[p.subcategories[0]].live)
    .map((p) => ({ subcategory: p.subcategories[0], product: p.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[subcategory]/reviews/[product]">): Promise<Metadata> {
  const product = getProduct((await params).product);
  return {
    title: `${product.name} review`,
    description: product.summary,
    alternates: { canonical: reviewPath(product) },
    robots: product.example ? { index: false, follow: false } : undefined,
  };
}

export default async function ReviewPage({
  params,
}: PageProps<"/[subcategory]/reviews/[product]">) {
  const product = getProduct((await params).product);
  const sub = product.subcategories[0];

  return (
    <PageShell>
      <Breadcrumbs
        crumbs={[
          { name: "Home", path: "/" },
          { name: subcategories[sub].name, path: hubPath(sub) },
          { name: `${product.name} review`, path: reviewPath(product) },
        ]}
      />
      {product.example && <ExampleBanner />}
      <AffiliateDisclosure />
      <header className="rise flex flex-col-reverse gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Review · {subcategories[sub].name}
          </p>
          <h1 className="font-display text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
            {product.name} review
          </h1>
          <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <span className="font-medium text-foreground">{formatPriceBand(product.priceBand)}</span>
            <EvidenceTag level={product.evidence} />
            <span>· Last verified {product.lastVerified}</span>
          </p>
        </div>
        <TrustScoreBadge trust={product.trustScore} size="lg" />
      </header>

      <ProductGallery name={product.name} images={product.images} videos={product.videos} />

      <section className="space-y-4 rounded-2xl border-l-4 border-gold bg-surface p-5 shadow-sm sm:p-6">
        <h2 className="font-display text-2xl font-semibold">Verdict</h2>
        <p className="text-lg leading-relaxed">{product.summary}</p>
        <p>
          <span className="font-semibold">Best for:</span> {product.idealFor.join(" · ")}
        </p>
        <BuyButtons product={product} />
      </section>

      <TrustScoreBreakdown
        trust={product.trustScore}
        data={product.trust}
        handsOnTested={product.evidence === "hands-on-tested"}
      />

      {product.fitScore && product.rubricName && (
        <FitScoreBreakdown fit={product.fitScore} rubricName={product.rubricName} />
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-accent-soft/60 p-5">
          <h2 className="font-display text-xl font-semibold text-accent">Pros</h2>
          <ul className="mt-3 space-y-2">
            {product.pros.map((p) => (
              <li key={p} className="flex gap-2">
                <span className="text-accent" aria-hidden="true">+</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-warn-soft/70 p-5">
          <h2 className="font-display text-xl font-semibold text-warn">Cons</h2>
          <ul className="mt-3 space-y-2">
            {product.cons.map((c) => (
              <li key={c} className="flex gap-2">
                <span className="text-warn" aria-hidden="true">−</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>


      <section>
        <h2 className="font-display text-2xl font-semibold">Key specs</h2>
        <table className="mt-3 w-full overflow-hidden rounded-2xl bg-surface text-sm shadow-sm">
          <tbody>
            {Object.entries(product.specs).map(([key, value]) => (
              <tr key={key} className="border-b border-border last:border-0 odd:bg-background/50">
                <th scope="row" className="w-2/5 px-4 py-2.5 text-left font-normal text-muted">
                  {key}
                </th>
                <td className="px-4 py-2.5 font-medium">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <SourcesDisclosure title="Sources behind the Trust Score" count={product.trust.sources.length} open>
        <TrustSources data={product.trust} />
      </SourcesDisclosure>

      {product.fitScore && (
        <SourcesDisclosure title="Sources behind the fit rating" count={product.fitScore.lines.length}>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {product.fitScore.lines.map((line) => (
              <li key={line.id}>
                <span className="font-medium">{line.name}:</span>{" "}
                {line.source.startsWith("http") ? (
                  <a href={line.source} className="underline" rel="nofollow noopener">
                    {line.source}
                  </a>
                ) : (
                  line.source
                )}
                {line.note && <span className="text-muted"> ({line.note})</span>}
              </li>
            ))}
          </ul>
        </SourcesDisclosure>
      )}

      <JsonLd data={productReview(product, site.defaultAuthor)} />
    </PageShell>
  );
}
