import type { Merchant, Product } from "./schemas";

export type ResolvedOffer = {
  merchant: Merchant;
  // What the page links to.
  href: string;
  // Where a /go/ link ends up; equal to `href` for direct links.
  destination: string;
};

export const amazonProductUrl = (asin: string, tag: string) =>
  `https://www.amazon.com/dp/${asin}?tag=${encodeURIComponent(tag)}`;

export const goPath = (productId: string, merchantId: string) =>
  `/go/${productId}/${merchantId}/`;

// Amazon links go straight to amazon.com: the Associates policies forbid
// obscuring the destination, and OneLink localizes them for UK/CA visitors.
// Every other merchant goes through /go/, so a network can be swapped in one
// data file without touching any article.
export function resolveOffers(
  product: Product,
  merchants: Map<string, Merchant>,
): ResolvedOffer[] {
  return product.offers.map((offer) => {
    const merchant = merchants.get(offer.merchant);
    if (!merchant) {
      throw new Error(`Product "${product.id}" uses unknown merchant "${offer.merchant}"`);
    }

    if (merchant.program === "amazon") {
      if (!offer.asin || !merchant.trackingTag) {
        throw new Error(
          `Amazon offer on "${product.id}" needs an asin and the merchant needs a trackingTag`,
        );
      }
      const url = amazonProductUrl(offer.asin, merchant.trackingTag);
      return { merchant, href: url, destination: url };
    }

    if (!offer.url) {
      throw new Error(`Offer from "${merchant.id}" on "${product.id}" needs a url`);
    }
    return {
      merchant,
      href: goPath(product.id, merchant.id),
      destination: offer.url,
    };
  });
}

export const formatPriceBand = ({ min, max }: Product["priceBand"]) =>
  min === max ? `$${min}` : `$${min}–${max}`;
