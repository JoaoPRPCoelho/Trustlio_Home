import { describe, expect, it } from "vitest";
import { formatPriceBands, resolveOffers } from "../affiliate";
import type { Merchant, Product } from "../schemas";

const merchants = new Map<string, Merchant>([
  [
    "amazon-us",
    {
      id: "amazon-us",
      name: "Amazon",
      market: "us",
      program: "amazon",
      amazonDomain: "amazon.com",
      trackingTag: "tag-20",
      showPrices: false,
      buttonLabel: "Check price on Amazon",
    },
  ],
  [
    "brand",
    { id: "brand", name: "Brand", market: "us", program: "direct", showPrices: false, buttonLabel: "Buy" },
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

  it("links an Amazon store in another market to its own domain", () => {
    const uk = new Map(merchants);
    uk.set("amazon-uk", {
      ...merchants.get("amazon-us")!,
      id: "amazon-uk",
      market: "uk",
      amazonDomain: "amazon.co.uk",
    });
    const [offer] = resolveOffers({ ...product, offers: [{ merchant: "amazon-uk", asin: "B0ABCDEFGH" }] }, uk);
    expect(offer.href).toBe("https://www.amazon.co.uk/dp/B0ABCDEFGH?tag=tag-20");
    expect(offer.market).toBe("uk");
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

describe("formatPriceBands", () => {
  it("shows one market without a label", () => {
    expect(formatPriceBands([{ market: "us", min: 250, max: 330 }])).toBe("$250–330");
  });

  it("labels each market when there are several", () => {
    expect(
      formatPriceBands([
        { market: "us", min: 159, max: 159 },
        { market: "uk", min: 170, max: 190 },
      ]),
    ).toBe("$159 (US) · £170–190 (UK)");
  });
});
