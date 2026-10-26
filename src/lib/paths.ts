import type { Product, SubcategoryId } from "./schemas";

// One place for URL patterns, so templates, sitemap and schema agree.
export const hubPath = (sub: SubcategoryId) => `/${sub}/`;
export const guidePath = (sub: SubcategoryId, slug: string) => `/${sub}/${slug}/`;
// A product's review lives under its first (primary) subcategory only, to
// avoid duplicate pages when it appears in guides of several subcategories.
export const reviewPath = (p: Pick<Product, "id" | "subcategories">) =>
  `/${p.subcategories[0]}/reviews/${p.id}/`;
