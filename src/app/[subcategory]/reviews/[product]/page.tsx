import type { Metadata } from "next";
import { Breadcrumbs, JsonLd, PageShell } from "@/components/layout";
import { AffiliateDisclosure, ExampleBanner } from "@/components/notices";
import { ImageFigure, VideoFigure } from "@/components/media";
import { BuyButtons, Equivalents } from "@/components/product";
import {
  EvidenceTag,
  FitScoreBreakdown,
  TrustScoreBreakdown,
  TrustSources,
} from "@/components/trust-score";
import { formatPriceBands } from "@/lib/affiliate";
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
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">{product.name} review</h1>
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <span>{formatPriceBands(product.priceBands)}</span>
          <EvidenceTag level={product.evidence} />
          <span>· Last verified {product.lastVerified}</span>
        </p>
      </header>

      {product.images.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {product.images.map((image, i) => (
            <ImageFigure key={image.src} image={image} priority={i === 0} />
          ))}
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Verdict</h2>
        <p>{product.summary}</p>
        <p>
          <span className="font-medium">Best for:</span> {product.idealFor.join(" · ")}
        </p>
        <Equivalents product={product} />
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

      <section className="grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold">Pros</h2>
          <ul className="mt-2 list-disc pl-5">
            {product.pros.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Cons</h2>
          <ul className="mt-2 list-disc pl-5">
            {product.cons.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </section>

      {product.videos.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">Videos</h2>
          {product.videos.map((video) => (
            <VideoFigure key={video.youtubeId} video={video} />
          ))}
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold">Key specs</h2>
        <table className="mt-2 w-full text-sm">
          <tbody>
            {Object.entries(product.specs).map(([key, value]) => (
              <tr key={key} className="border-b border-border">
                <td className="py-2 pr-4 text-muted">{key}</td>
                <td className="py-2">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Sources behind the Trust Score</h2>
        <TrustSources data={product.trust} />
      </section>

      {product.fitScore && (
        <section>
          <h2 className="text-xl font-semibold">Sources behind the fit rating</h2>
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
        </section>
      )}

      <JsonLd data={productReview(product, site.defaultAuthor)} />
    </PageShell>
  );
}
