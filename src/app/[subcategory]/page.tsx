import type { Metadata } from "next";
import { Breadcrumbs, PageShell } from "@/components/layout";
import { GuideCard, ProductTile, SectionHeading } from "@/components/cards";
import { getGuides, productsIn } from "@/lib/data";
import { hubPath } from "@/lib/paths";
import { subcategories } from "@/lib/site";
import { SubcategoryId } from "@/lib/schemas";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.entries(subcategories)
    .filter(([, s]) => s.live)
    .map(([subcategory]) => ({ subcategory }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[subcategory]">): Promise<Metadata> {
  const sub = SubcategoryId.parse((await params).subcategory);
  return {
    title: subcategories[sub].name,
    description: subcategories[sub].tagline,
    alternates: { canonical: hubPath(sub) },
  };
}

export default async function SubcategoryHub({ params }: PageProps<"/[subcategory]">) {
  const sub = SubcategoryId.parse((await params).subcategory);
  const guides = await getGuides(sub);
  const products = productsIn(sub);

  return (
    <PageShell wide>
      <Breadcrumbs
        crumbs={[
          { name: "Home", path: "/" },
          { name: subcategories[sub].name, path: hubPath(sub) },
        ]}
      />
      <header className="rise max-w-3xl space-y-3">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {subcategories[sub].name}
        </h1>
        <p className="text-lg text-muted">{subcategories[sub].tagline}</p>
      </header>

      <section className="space-y-6 pt-4">
        <SectionHeading eyebrow={`${guides.length} guides`} title="Buying guides" />
        <div className="grid gap-5 md:grid-cols-2">
          {guides.map((g) => (
            <GuideCard key={g.slug} guide={g} />
          ))}
        </div>
      </section>

      <section className="space-y-6 pt-8">
        <SectionHeading eyebrow={`${products.length} products`} title="Reviews">
          Sorted by Trust Score.
        </SectionHeading>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...products]
            .sort((a, b) => (b.trustScore.total ?? -1) - (a.trustScore.total ?? -1))
            .map((p) => (
              <li key={p.id}>
                <ProductTile product={p} />
              </li>
            ))}
        </ul>
      </section>
    </PageShell>
  );
}
