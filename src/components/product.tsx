import Link from "next/link";
import { formatPriceBand } from "@/lib/affiliate";
import { getProduct, type ProductView } from "@/lib/data";
import { reviewPath } from "@/lib/paths";
import { type ComparisonColumn, SortableComparison } from "./comparison-table";
import { ImageFigure } from "./media";
import { EvidenceTag, TrustScoreBadge, trustScoreText } from "./trust-score";

export function BuyButtons({ product }: { product: ProductView }) {
  return (
    <div className="flex flex-wrap gap-2">
      {product.offers.map((offer) => (
        <a
          key={offer.merchant.id}
          href={offer.href}
          rel="sponsored nofollow noopener"
          target="_blank"
          data-affiliate-product={product.id}
          data-affiliate-merchant={offer.merchant.id}
          className="group inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-deep hover:shadow-md"
        >
          {offer.merchant.buttonLabel}
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true">
            <path d="M3 8h9m-3.5-4L12 8l-3.5 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      ))}
    </div>
  );
}

// Usable from MDX as <ProductCard id="..." award="..." />. All copy comes from
// the product's data file, so a fix there updates every page.
export function ProductCard({ id, award }: { id: string; award?: string }) {
  const product = getProduct(id);
  const image = product.images[0];
  return (
    <section
      id={product.id}
      className="not-prose my-8 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md"
    >
      {award && (
        <p className="flex items-center gap-2 bg-brand px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-gold" aria-hidden="true">
            <path d="M8 1.5l1.9 4 4.3.5-3.2 2.9.9 4.3L8 11l-3.9 2.2.9-4.3L1.8 6l4.3-.5z" fill="currentColor" />
          </svg>
          {award}
        </p>
      )}
      <div className={`grid gap-6 p-5 sm:p-6 ${image ? "md:grid-cols-[14rem_1fr]" : ""}`}>
        {image && <ImageFigure image={image} className="max-w-xs self-start" />}
        <div>
          <div className="flex items-start gap-4">
            <TrustScoreBadge trust={product.trustScore} />
            <div className="flex-1">
              <h3 className="font-display text-2xl font-semibold leading-tight">{product.name}</h3>
              <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted">
                <span className="font-medium text-foreground">{formatPriceBand(product.priceBand)}</span>
                <EvidenceTag level={product.evidence} />
                {product.fitScore && (
                  <span className="rounded-full bg-gold-soft px-2.5 py-0.5 text-xs font-medium text-warn">
                    Small-space fit {product.fitScore.total}
                  </span>
                )}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed">
            <span className="font-semibold">Best for:</span> {product.idealFor.join(" · ")}
          </p>
          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-accent-soft/50 p-4">
              <p className="font-semibold text-accent">Pros</p>
              <ul className="mt-2 space-y-1.5">
                {product.pros.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-0.5 text-accent" aria-hidden="true">+</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-warn-soft/60 p-4">
              <p className="font-semibold text-warn">Cons</p>
              <ul className="mt-2 space-y-1.5">
                {product.cons.map((c) => (
                  <li key={c} className="flex gap-2">
                    <span className="mt-0.5 text-warn" aria-hidden="true">−</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <BuyButtons product={product} />
            <Link href={reviewPath(product)} className="text-sm font-semibold text-accent hover:underline">
              Full review →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// Side-by-side table built from data. Spec rows are the union of the products'
// spec keys, in first-seen order.
export function ComparisonTable({ ids }: { ids: string[] }) {
  const products = ids.map(getProduct);
  const specKeys = [...new Set(products.flatMap((p) => Object.keys(p.specs)))];
  const hasFit = products.some((p) => p.fitScore);
  const rowLabels = ["Trust score", ...(hasFit ? ["Small-space fit"] : []), "Price range", ...specKeys];
  const columns: ComparisonColumn[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    trust: p.trustScore.total,
    fit: p.fitScore?.total ?? null,
    cells: [
      trustScoreText(p.trustScore),
      ...(hasFit ? [p.fitScore ? `${p.fitScore.total}/100` : "—"] : []),
      formatPriceBand(p.priceBand),
      ...specKeys.map((key) => String(p.specs[key] ?? "—")),
    ],
  }));
  return (
    <SortableComparison
      rowLabels={rowLabels}
      columns={columns}
      scoreRows={{ trust: 0, fit: hasFit ? 1 : null }}
    />
  );
}
