import { describe, expect, it } from "vitest";
import { ProductImageSchema, ProductVideoSchema } from "../schemas";

const image = {
  src: "/images/products/vac/main.webp",
  alt: "The vacuum on its dock",
  width: 800,
  height: 600,
  credit: "Photo: Brand",
  obtained: "2026-10-27",
};

const video = {
  youtubeId: "vJrQ91fYapU",
  title: "A review",
  channel: "Vacuum Wars",
  accessed: "2026-10-27",
};

describe("ProductImageSchema", () => {
  it("lets our own photos skip the license source", () => {
    expect(ProductImageSchema.safeParse({ ...image, license: "own" }).success).toBe(true);
  });

  it("needs a source for any image that isn't ours", () => {
    expect(ProductImageSchema.safeParse({ ...image, license: "press-kit" }).success).toBe(false);
    expect(
      ProductImageSchema.safeParse({ ...image, license: "press-kit", source: "https://brand.example/press" })
        .success,
    ).toBe(true);
  });

  it("rejects hotlinked and Amazon images", () => {
    expect(
      ProductImageSchema.safeParse({ ...image, license: "own", src: "https://m.media-amazon.com/x.jpg" }).success,
    ).toBe(false);
    expect(
      ProductImageSchema.safeParse({
        ...image,
        license: "brand-permission",
        source: "https://www.amazon.com/dp/B0ABCDEFGH",
      }).success,
    ).toBe(false);
  });
});

describe("ProductVideoSchema", () => {
  it("accepts an independent review", () => {
    expect(ProductVideoSchema.safeParse({ ...video, kind: "independent-review" }).success).toBe(true);
  });

  it("requires a disclosure on AI videos, and only on them", () => {
    expect(ProductVideoSchema.safeParse({ ...video, kind: "ai-generated" }).success).toBe(false);
    expect(
      ProductVideoSchema.safeParse({
        ...video,
        kind: "ai-generated",
        aiDisclosure: "Camera motion generated from our own photo.",
      }).success,
    ).toBe(true);
    expect(
      ProductVideoSchema.safeParse({ ...video, kind: "own", aiDisclosure: "Camera motion generated." }).success,
    ).toBe(false);
  });

  it("rejects a URL in place of the video id", () => {
    expect(
      ProductVideoSchema.safeParse({ ...video, kind: "own", youtubeId: "https://youtu.be/vJrQ91fYapU" }).success,
    ).toBe(false);
  });
});
