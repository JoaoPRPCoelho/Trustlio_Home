import type { Metadata } from "next";
import { Breadcrumbs, JsonLd, PageShell } from "@/components/layout";
import { AffiliateDisclosure, ExampleBanner } from "@/components/notices";
import { ComparisonTable, ProductCard } from "@/components/product";
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
      <Breadcrumbs
        crumbs={[
          { name: "Home", path: "/" },
          { name: subcategories[sub].name, path: hubPath(sub) },
          { name: meta.title, path },
        ]}
      />
      {meta.example && <ExampleBanner />}
      <AffiliateDisclosure />
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">{meta.title}</h1>
        <p className="text-sm text-muted">
          By {meta.author} · Updated <time dateTime={meta.updated}>{longDate(meta.updated)}</time>
        </p>
      </header>

      <section aria-label="Our picks" className="space-y-2">
        <h2 className="text-xl font-semibold">Our picks at a glance</h2>
        <ol className="list-decimal space-y-1 pl-5">
          {picks.map(({ product, award }) => (
            <li key={product.id}>
              <span className="font-medium">{award}:</span>{" "}
              <a href={`#${product.id}`} className="underline">
                {product.name}
              </a>{" "}
              <span className="text-muted">({product.trust.total}/100)</span>
            </li>
          ))}
        </ol>
      </section>

      <ComparisonTable ids={picks.map((p) => p.product.id)} />

      {picks.map(({ product, award }) => (
        <ProductCard key={product.id} id={product.id} award={award} />
      ))}

      <article className="prose max-w-none">
        <Body />
      </article>

      <JsonLd data={guideArticle(meta, path, picks)} />
    </PageShell>
  );
}
