import type { MetadataRoute } from "next";
import { getGuides, getProducts } from "@/lib/data";
import { guidePath, hubPath, reviewPath } from "@/lib/paths";
import { absoluteUrl, subcategories } from "@/lib/site";
import type { SubcategoryId } from "@/lib/schemas";

export const dynamic = "force-static";

// Example (placeholder) pages are noindexed and left out.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const live = (Object.keys(subcategories) as SubcategoryId[]).filter(
    (s) => subcategories[s].live,
  );
  const guides = (
    await Promise.all(live.map(async (sub) => (await getGuides(sub)).map((g) => ({ sub, g }))))
  ).flat();

  return [
    { url: absoluteUrl("/") },
    ...live.map((sub) => ({ url: absoluteUrl(hubPath(sub)) })),
    ...guides
      .filter(({ g }) => !g.meta.example)
      .map(({ sub, g }) => ({
        url: absoluteUrl(guidePath(sub, g.slug)),
        lastModified: g.meta.updated,
      })),
    ...getProducts()
      .filter((p) => !p.example && live.includes(p.subcategories[0]))
      .map((p) => ({ url: absoluteUrl(reviewPath(p)), lastModified: p.lastVerified })),
    { url: absoluteUrl("/methodology/trust-score/") },
    { url: absoluteUrl("/about/") },
    { url: absoluteUrl("/disclosure/") },
  ];
}
