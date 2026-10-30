import { markets, type Market, type Merchant, type Product } from "./schemas";

export type ResolvedOffer = {
  merchant: Merchant;
  market: Market;
  // What the page links to.
  href: string;
  // Where a /go/ link ends up; equal to `href` for direct links.
  destination: string;
};

export const amazonProductUrl = (asin: string, tag: string, domain = "amazon.com") =>
  `https://www.${domain}/dp/${asin}?tag=${encodeURIComponent(tag)}`;

export const goPath = (productId: string, merchantId: string) =>
  `/go/${productId}/${merchantId}/`;

// Amazon links go straight to the merchant's Amazon store: the Associates
// policies forbid obscuring the destination. OneLink sends visitors from other
// countries to the same product in their local store; a different model for
// another market needs its own offer.
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
      if (!offer.asin || !merchant.trackingTag || !merchant.amazonDomain) {
        throw new Error(
          `Amazon offer on "${product.id}" needs an asin and the merchant needs a trackingTag and amazonDomain`,
        );
      }
      const url = amazonProductUrl(offer.asin, merchant.trackingTag, merchant.amazonDomain);
      return { merchant, market: merchant.market, href: url, destination: url };
    }

    if (!offer.url) {
      throw new Error(`Offer from "${merchant.id}" on "${product.id}" needs a url`);
    }
    return {
      merchant,
      market: merchant.market,
      href: goPath(product.id, merchant.id),
      destination: offer.url,
    };
  });
}

type PriceBand = Product["priceBands"][number];

export const formatPriceBand = ({ market, min, max }: PriceBand) => {
  const { symbol } = markets[market];
  return min === max ? `${symbol}${min}` : `${symbol}${min}–${max}`;
};

// "$250–330" for one market; "$159 (US) · £189 (UK)" for several.
export const formatPriceBands = (bands: PriceBand[]) =>
  bands.length === 1
    ? formatPriceBand(bands[0])
    : bands.map((b) => `${formatPriceBand(b)} (${markets[b.market].name})`).join(" · ");
