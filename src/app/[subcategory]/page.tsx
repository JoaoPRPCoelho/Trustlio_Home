import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, PageShell } from "@/components/layout";
import { TrustScoreBadge } from "@/components/trust-score";
import { getGuides, productsIn } from "@/lib/data";
import { guidePath, hubPath, reviewPath } from "@/lib/paths";
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
    <PageShell>
      <Breadcrumbs
        crumbs={[
          { name: "Home", path: "/" },
          { name: subcategories[sub].name, path: hubPath(sub) },
        ]}
      />
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">{subcategories[sub].name}</h1>
        <p className="text-lg text-muted">{subcategories[sub].tagline}</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Buying guides</h2>
        <ul className="space-y-2">
          {guides.map((g) => (
            <li key={g.slug}>
              <Link href={guidePath(sub, g.slug)} className="font-medium underline">
                {g.meta.title}
              </Link>
              <p className="text-sm text-muted">{g.meta.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Reviews</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {products.map((p) => (
            <li key={p.id}>
              <Link
                href={reviewPath(p)}
                className="flex items-center gap-3 rounded-lg border border-border bg-white p-3 hover:border-accent"
              >
                <TrustScoreBadge score={p.trust.total} />
                <span className="font-medium">{p.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
