import { describe, expect, it } from "vitest";
import { galleryItems } from "../gallery";
import type { ProductImage, ProductVideo } from "../schemas";

const image = (n: string): ProductImage => ({
  src: `/images/products/vac/${n}.webp`,
  alt: n,
  width: 800,
  height: 600,
  license: "own",
  credit: "Photo: Trustlio Home",
  aiGenerated: false,
  obtained: "2026-10-30",
});

const video = (kind: ProductVideo["kind"]): ProductVideo => ({
  youtubeId: `${kind.slice(0, 3)}45678901`.slice(0, 11),
  title: kind,
  channel: "Channel",
  kind,
  accessed: "2026-10-30",
});

describe("galleryItems", () => {
  it("puts photos first, then our videos, and independent reviews last", () => {
    const items = galleryItems({
      images: [image("main"), image("side")],
      videos: [video("independent-review"), video("own"), video("manufacturer")],
    });
    expect(items.map((i) => (i.type === "image" ? i.image.alt : i.video.kind))).toEqual([
      "main",
      "side",
      "own",
      "manufacturer",
      "independent-review",
    ]);
  });

  it("is empty for a product without media", () => {
    expect(galleryItems({ images: [], videos: [] })).toEqual([]);
  });
});
