import type { Metadata } from "next";
import { Breadcrumbs, JsonLd, PageShell } from "@/components/layout";
import { AffiliateDisclosure, ExampleBanner } from "@/components/notices";
import { ComparisonTable, ProductCard } from "@/components/product";
import { ProductTile } from "@/components/cards";
import { getGuide, getProduct, guideSlugs } from "@/lib/data";
import { guidePath, hubPath } from "@/lib/paths";
import { SubcategoryId } from "@/lib/schemas";
import { subcategories } from "@/lib/site";
import { guideArticle } from "@/lib/structured-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.entries(subcategories)
    .filter(([, s]) => s.live)
    .flatMap(([subcategory]) =>
      guideSlugs(subcategory as SubcategoryId).map((slug) => ({ subcategory, slug })),
    );
}

async function load(params: PageProps<"/[subcategory]/[slug]">["params"]) {
  const { subcategory, slug } = await params;
  const sub = SubcategoryId.parse(subcategory);
  return { sub, guide: await getGuide(sub, slug) };
}

export async function generateMetadata({
  params,
}: PageProps<"/[subcategory]/[slug]">): Promise<Metadata> {
  const { sub, guide } = await load(params);
  return {
    title: guide.meta.title,
    description: guide.meta.description,
    alternates: { canonical: guidePath(sub, guide.slug) },
    robots: guide.meta.example ? { index: false, follow: false } : undefined,
  };
}

const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default async function GuidePage({ params }: PageProps<"/[subcategory]/[slug]">) {
  const { sub, guide } = await load(params);
  const { meta, Body } = guide;
  const picks = meta.picks.map((p) => ({ product: getProduct(p.product), award: p.award }));
  const path = guidePath(sub, guide.slug);

  return (
    <PageShell>
      <div
        className="reading-progress fixed inset-x-0 top-0 z-50 h-1 bg-gold"
        aria-hidden="true"
      />
      <Breadcrumbs
        crumbs={[
          { name: "Home", path: "/" },
          { name: subcategories[sub].name, path: hubPath(sub) },
          { name: meta.title, path },
        ]}
      />
      {meta.example && <ExampleBanner />}
      <header className="rise space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Buying guide · {subcategories[sub].name}
        </p>
        <h1 className="font-display text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
          {meta.title}
        </h1>
        <p className="max-w-3xl text-lg leading-relaxed text-muted">{meta.description}</p>
        <p className="flex items-center gap-3 text-sm text-muted">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-semibold text-white"
            aria-hidden="true"
          >
            {meta.author.charAt(0)}
          </span>
          <span>
            By <span className="font-medium text-foreground">{meta.author}</span> · Updated{" "}
            <time dateTime={meta.updated}>{longDate(meta.updated)}</time>
          </span>
        </p>
      </header>
      <AffiliateDisclosure />

      <section aria-labelledby="picks" className="space-y-4">
        <h2 id="picks" className="font-display text-2xl font-semibold">
          Our picks at a glance
        </h2>
        <ol className="grid gap-3 sm:grid-cols-2">
          {picks.map(({ product, award }) => (
            <li key={product.id}>
              <ProductTile product={product} award={award} href={`#${product.id}`} />
            </li>
          ))}
        </ol>
      </section>

      <ComparisonTable ids={picks.map((p) => p.product.id)} />

      {picks.map(({ product, award }) => (
        <ProductCard key={product.id} id={product.id} award={award} />
      ))}

      <article className="prose prose-lg max-w-none prose-headings:scroll-mt-24">
        <Body />
      </article>

      <JsonLd data={guideArticle(meta, path, picks)} />
    </PageShell>
  );
}
