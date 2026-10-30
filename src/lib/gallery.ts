import type { ProductImage, ProductVideo } from "./schemas";

export type GalleryItem = { type: "image"; image: ProductImage } | { type: "video"; video: ProductVideo };

// Order of the media carousel on a review: photos first (the first one is also
// the card image), then our own videos, then the brand's, then AI ones, then
// independent reviews, which are someone else's work and go last.
const videoOrder: Record<ProductVideo["kind"], number> = {
  own: 0,
  manufacturer: 1,
  "ai-generated": 2,
  "independent-review": 3,
};

export function galleryItems(p: { images: ProductImage[]; videos: ProductVideo[] }): GalleryItem[] {
  return [
    ...p.images.map((image) => ({ type: "image" as const, image })),
    ...[...p.videos]
      .sort((a, b) => videoOrder[a.kind] - videoOrder[b.kind])
      .map((video) => ({ type: "video" as const, video })),
  ];
}
