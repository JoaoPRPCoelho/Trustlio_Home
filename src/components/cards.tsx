import Link from "next/link";
import { formatPriceBands } from "@/lib/affiliate";
import { getProduct, type Guide, type ProductView } from "@/lib/data";
import { guidePath, reviewPath } from "@/lib/paths";
import { EvidenceTag, TrustScoreBadge } from "./trust-score";

const shortDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// A buying guide with its top picks' scores, for hubs and the home page.
export function GuideCard({ guide }: { guide: Guide }) {
  const { meta } = guide;
  const picks = meta.picks.slice(0, 3).map((p) => getProduct(p.product));
  return (
    <Link
      href={guidePath(meta.subcategory, guide.slug)}
      className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-accent">
        Buying guide · {meta.picks.length} picks
      </p>
      <h3 className="mt-2 font-display text-2xl font-semibold leading-snug group-hover:text-accent">
        {meta.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{meta.description}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <div className="flex -space-x-2">
          {picks.map((p) => (
            <span key={p.id} className="rounded-full ring-4 ring-surface">
              <TrustScoreBadge trust={p.trustScore} size="sm" />
            </span>
          ))}
        </div>
        <span className="text-xs text-muted">Updated {shortDate(meta.updated)}</span>
      </div>
    </Link>
  );
}

// A compact product link with its score, for grids.
export function ProductTile({
  product,
  award,
  href,
}: {
  product: ProductView;
  award?: string;
  href?: string;
}) {
  return (
    <Link
      href={href ?? reviewPath(product)}
      className="group flex h-full items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
    >
      <TrustScoreBadge trust={product.trustScore} />
      <span className="min-w-0 flex-1">
        {award && (
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-accent">
            {award}
          </span>
        )}
        <span className="block font-semibold leading-snug group-hover:text-accent">
          {product.name}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>{formatPriceBands(product.priceBands)}</span>
          <EvidenceTag level={product.evidence} />
        </span>
      </span>
      <span
        className="text-accent opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
        aria-hidden="true"
      >
        →
      </span>
    </Link>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl space-y-2">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">{eyebrow}</p>
      )}
      <h2 className="font-display text-3xl font-semibold tracking-tight">{title}</h2>
      {children && <p className="text-muted">{children}</p>}
    </div>
  );
}
