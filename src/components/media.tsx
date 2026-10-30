import Image from "next/image";
import { getProduct } from "@/lib/data";
import type { ProductImage as ProductImageData, ProductVideo as ProductVideoData } from "@/lib/schemas";
import { galleryItems } from "@/lib/gallery";
import { Carousel, type CarouselThumb } from "./carousel";
import { YouTubeEmbed } from "./youtube-embed";

// Captions say whose media it is. A third-party review must never read as our
// own test, and AI media must never read as real footage.
const videoCredit: Record<ProductVideoData["kind"], (v: ProductVideoData) => string> = {
  "independent-review": (v) => `Independent review by ${v.channel}, on YouTube. Not made by us.`,
  manufacturer: (v) => `Video from the manufacturer (${v.channel}), on YouTube.`,
  own: () => "Our video.",
  "ai-generated": () => "AI-generated. Not footage of the real product in use.",
};

export function VideoFigure({ video, className = "my-6" }: { video: ProductVideoData; className?: string }) {
  return (
    <figure className={`not-prose ${className}`}>
      <YouTubeEmbed id={video.youtubeId} title={video.title} />
      <figcaption className="mt-2 text-sm text-muted">
        {video.kind === "ai-generated" && (
          <span className="mr-1 rounded bg-warn-soft px-1.5 py-0.5 text-xs font-semibold text-warn">
            AI-generated
          </span>
        )}
        <span className="font-medium text-foreground">
          {/[.!?]$/.test(video.title) ? video.title : `${video.title}.`}
        </span>{" "}
        {videoCredit[video.kind](video)}
        {video.aiDisclosure && <> {video.aiDisclosure}</>}
      </figcaption>
    </figure>
  );
}

export function ImageFigure({
  image,
  className = "",
  priority = false,
  framed = false,
}: {
  image: ProductImageData;
  className?: string;
  priority?: boolean;
  // Letterbox into a 16:9 frame, so carousel slides keep one height.
  framed?: boolean;
}) {
  return (
    <figure className={`not-prose ${className}`}>
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        priority={priority}
        className={`w-full rounded-md bg-white object-contain ${framed ? "aspect-video" : "h-auto"}`}
      />
      <figcaption className="mt-1 text-xs text-muted">
        {image.aiGenerated && <span className="font-semibold text-warn">AI-generated image. </span>}
        {image.credit}
        {image.notice && (
          <>
            {" "}
            {image.notice.text}{" "}
            <a href={image.notice.url} className="underline" rel="license noopener" target="_blank">
              License
            </a>
            .
          </>
        )}
      </figcaption>
    </figure>
  );
}

// Usable from MDX as <ProductVideo id="..." />, with `index` for a product
// with several videos. The video's facts live in the product's data file.
export function ProductVideo({ id, index = 0 }: { id: string; index?: number }) {
  const product = getProduct(id);
  const video = product.videos[index];
  if (!video) throw new Error(`Product "${id}" has no video #${index}`);
  return <VideoFigure video={video} />;
}

// The media carousel at the top of a review: licensed photos and videos, each
// slide with its own credit. Renders nothing for a product with no media.
export function ProductGallery({
  name,
  images,
  videos,
}: {
  name: string;
  images: ProductImageData[];
  videos: ProductVideoData[];
}) {
  const items = galleryItems({ images, videos });
  if (items.length === 0) return null;

  const slides = items.map((item, i) =>
    item.type === "image" ? (
      <ImageFigure key={item.image.src} image={item.image} priority={i === 0} framed />
    ) : (
      <VideoFigure key={item.video.youtubeId} video={item.video} className="" />
    ),
  );
  const thumbs: CarouselThumb[] = items.map((item) =>
    item.type === "image"
      ? { src: item.image.src, label: item.image.alt, video: false }
      : { src: `https://i.ytimg.com/vi/${item.video.youtubeId}/mqdefault.jpg`, label: item.video.title, video: true },
  );

  return (
    <section className="rounded-2xl border border-border bg-surface p-3 shadow-sm sm:p-4">
      <h2 className="sr-only">Photos and videos</h2>
      <Carousel slides={slides} thumbs={thumbs} label={`${name} photos and videos`} />
    </section>
  );
}
