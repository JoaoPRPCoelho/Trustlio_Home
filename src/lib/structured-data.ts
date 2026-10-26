import type { ProductView } from "./data";
import type { GuideMeta } from "./schemas";
import { absoluteUrl, site } from "./site";
import { reviewPath } from "./paths";

// JSON-LD is generated from the same data the page shows, so it can never
// drift from the visible content. No AggregateRating: the trust score is one
// editorial rating, not an average of user ratings.

type Crumb = { name: string; path: string };

export const organization = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
});

export const website = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  url: site.url,
});

export const breadcrumbs = (crumbs: Crumb[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.name,
    item: absoluteUrl(c.path),
  })),
});

const person = (name: string) => ({ "@type": "Person", name, url: absoluteUrl("/about/") });

const productNode = (p: ProductView) => ({
  "@type": "Product",
  name: p.name,
  brand: { "@type": "Brand", name: p.brand },
  model: p.model,
  ...(p.gtin ? { gtin: p.gtin } : {}),
});

const itemList = (items: string[]) => ({
  "@type": "ItemList",
  itemListElement: items.map((name, i) => ({ "@type": "ListItem", position: i + 1, name })),
});

// Review rating markup only for products we used ourselves: Google's review
// snippet rules exclude reviews not based on a genuine experience. Research-based
// products publish the trust score as a product property instead.
export const productReview = (p: ProductView, author: string) => {
  const trustProperty =
    p.trustScore.total === null
      ? {}
      : {
          additionalProperty: {
            "@type": "PropertyValue",
            name: `${site.name} Trust Score (methodology v${p.trustScore.version})`,
            value: p.trustScore.total,
            minValue: 0,
            maxValue: 100,
            url: absoluteUrl("/methodology/trust-score/"),
          },
        };

  if (p.evidence !== "hands-on-tested" || p.trustScore.total === null) {
    return {
      "@context": "https://schema.org",
      ...productNode(p),
      url: absoluteUrl(reviewPath(p)),
      ...trustProperty,
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "Review",
    name: `${p.name} review`,
    url: absoluteUrl(reviewPath(p)),
    itemReviewed: { ...productNode(p), ...trustProperty },
    reviewRating: {
      "@type": "Rating",
      ratingValue: p.trustScore.total,
      bestRating: 100,
      worstRating: 0,
    },
    author: person(author),
    publisher: { "@type": "Organization", name: site.name },
    dateModified: p.trust.reviewed,
    positiveNotes: itemList(p.pros),
    negativeNotes: itemList(p.cons),
  };
};

export const guideArticle = (
  meta: GuideMeta,
  path: string,
  picks: { product: ProductView; award: string }[],
) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: meta.title,
  description: meta.description,
  url: absoluteUrl(path),
  datePublished: meta.published,
  dateModified: meta.updated,
  author: person(meta.author),
  publisher: { "@type": "Organization", name: site.name },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: picks.map(({ product, award }, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${award}: ${product.name}`,
      url: absoluteUrl(reviewPath(product)),
    })),
  },
});
