import Link from "next/link";
import { formatPriceBands } from "@/lib/affiliate";
import { getProduct, type ProductView } from "@/lib/data";
import { reviewPath } from "@/lib/paths";
import { markets } from "@/lib/schemas";
import { ImageFigure } from "./media";
import { EvidenceTag, TrustScoreBadge, trustScoreText } from "./trust-score";

function OfferLinks({ offers, productId }: { offers: ProductView["offers"]; productId: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {offers.map((offer) => (
        <a
          key={offer.merchant.id}
          href={offer.href}
          rel="sponsored nofollow noopener"
          target="_blank"
          data-affiliate-product={productId}
          data-affiliate-merchant={offer.merchant.id}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          {offer.merchant.buttonLabel}
        </a>
      ))}
    </div>
  );
}

// One row of buttons per market, labelled when the product is sold in more
// than one, so a UK reader doesn't land in a US store by mistake.
export function BuyButtons({ product }: { product: ProductView }) {
  if (product.markets.length === 1) {
    return <OfferLinks offers={product.offers} productId={product.id} />;
  }
  return (
    <div className="space-y-2">
      {product.markets.map((market) => (
        <div key={market} className="flex flex-wrap items-center gap-2">
          <span className="w-16 text-sm font-medium text-muted">In the {markets[market].name}</span>
          <OfferLinks
            offers={product.offers.filter((o) => o.market === market)}
            productId={product.id}
          />
        </div>
      ))}
    </div>
  );
}

// Points to the model sold in other markets, with its own score, so the
// evidence on this page is never read as covering a model we didn't check.
export function Equivalents({ product }: { product: ProductView }) {
  if (product.equivalents.length === 0) return null;
  return (
    <div className="rounded-md border border-border bg-accent-soft/40 px-4 py-3 text-sm">
      {product.equivalents.map(({ product: id, note }) => {
        const other = getProduct(id);
        return (
          <p key={id}>
            <span className="font-medium">
              In the {other.markets.map((m) => markets[m].name).join(" and ")}:
            </span>{" "}
            {note}{" "}
            <Link href={reviewPath(other)} className="underline">
              {other.name} review
            </Link>
          </p>
        );
      })}
    </div>
  );
}

// Usable from MDX as <ProductCard id="..." award="..." />. All copy comes from
// the product's data file, so a fix there updates every page.
export function ProductCard({ id, award }: { id: string; award?: string }) {
  const product = getProduct(id);
  return (
    <section
      id={product.id}
      className="not-prose my-6 rounded-lg border border-border bg-white p-5"
    >
      {product.images[0] && (
        <ImageFigure image={product.images[0]} className="mb-4 max-w-xs" />
      )}
      <div className="flex items-start gap-4">
        <TrustScoreBadge trust={product.trustScore} />
        <div className="flex-1">
          {award && (
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">{award}</p>
          )}
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span>{formatPriceBands(product.priceBands)}</span>
            <EvidenceTag level={product.evidence} />
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm">
        <span className="font-medium">Best for:</span> {product.idealFor.join(" · ")}
      </p>
      <div className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <p className="font-medium">Pros</p>
          <ul className="mt-1 list-disc pl-5">
            {product.pros.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium">Cons</p>
          <ul className="mt-1 list-disc pl-5">
            {product.cons.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
      {product.equivalents.length > 0 && (
        <div className="mt-3">
          <Equivalents product={product} />
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <BuyButtons product={product} />
        <Link href={reviewPath(product)} className="text-sm underline">
          Full review
        </Link>
      </div>
    </section>
  );
}

// Side-by-side table built from data. Spec rows are the union of the products'
// spec keys, in first-seen order.
export function ComparisonTable({ ids }: { ids: string[] }) {
  const products = ids.map(getProduct);
  const specKeys = [...new Set(products.flatMap((p) => Object.keys(p.specs)))];
  return (
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full min-w-[32rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="py-2 pr-4 font-medium text-muted"> </th>
            {products.map((p) => (
              <th key={p.id} className="py-2 pr-4 font-semibold">
                <a href={`#${p.id}`}>{p.name}</a>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border">
            <td className="py-2 pr-4 text-muted">Trust score</td>
            {products.map((p) => (
              <td key={p.id} className="py-2 pr-4 font-semibold text-accent">
                {trustScoreText(p.trustScore)}
              </td>
            ))}
          </tr>
          {products.some((p) => p.fitScore) && (
            <tr className="border-b border-border">
              <td className="py-2 pr-4 text-muted">Small-space fit</td>
              {products.map((p) => (
                <td key={p.id} className="py-2 pr-4">
                  {p.fitScore ? `${p.fitScore.total}/100` : "—"}
                </td>
              ))}
            </tr>
          )}
          <tr className="border-b border-border">
            <td className="py-2 pr-4 text-muted">Price range</td>
            {products.map((p) => (
              <td key={p.id} className="py-2 pr-4">
                {formatPriceBands(p.priceBands)}
              </td>
            ))}
          </tr>
          {specKeys.map((key) => (
            <tr key={key} className="border-b border-border">
              <td className="py-2 pr-4 text-muted">{key}</td>
              {products.map((p) => (
                <td key={p.id} className="py-2 pr-4">
                  {p.specs[key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
