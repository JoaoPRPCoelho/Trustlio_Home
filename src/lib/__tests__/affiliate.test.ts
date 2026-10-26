import { describe, expect, it } from "vitest";
import { resolveOffers } from "../affiliate";
import type { Merchant, Product } from "../schemas";

const merchants = new Map<string, Merchant>([
  [
    "amazon-us",
    {
      id: "amazon-us",
      name: "Amazon",
      program: "amazon",
      trackingTag: "tag-20",
      showPrices: false,
      buttonLabel: "Check price on Amazon",
    },
  ],
  [
    "brand",
    { id: "brand", name: "Brand", program: "direct", showPrices: false, buttonLabel: "Buy" },
  ],
]);

const product = { id: "vac", offers: [] } as unknown as Product;

describe("resolveOffers", () => {
  it("links Amazon directly with the tracking tag", () => {
    const [offer] = resolveOffers(
      { ...product, offers: [{ merchant: "amazon-us", asin: "B0ABCDEFGH" }] },
      merchants,
    );
    expect(offer.href).toBe("https://www.amazon.com/dp/B0ABCDEFGH?tag=tag-20");
    expect(offer.destination).toBe(offer.href);
  });

  it("routes other merchants through /go/", () => {
    const [offer] = resolveOffers(
      { ...product, offers: [{ merchant: "brand", url: "https://brand.example/vac" }] },
      merchants,
    );
    expect(offer.href).toBe("/go/vac/brand/");
    expect(offer.destination).toBe("https://brand.example/vac");
  });

  it("fails on unknown merchants", () => {
    expect(() =>
      resolveOffers({ ...product, offers: [{ merchant: "nope", url: "https://x.example" }] }, merchants),
    ).toThrow(/unknown merchant/);
  });
});
