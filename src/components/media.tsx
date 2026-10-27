import Image from "next/image";
import { getProduct } from "@/lib/data";
import type { ProductImage as ProductImageData, ProductVideo as ProductVideoData } from "@/lib/schemas";
import { YouTubeEmbed } from "./youtube-embed";

// Captions say whose media it is. A third-party review must never read as our
// own test, and AI media must never read as real footage.
const videoCredit: Record<ProductVideoData["kind"], (v: ProductVideoData) => string> = {
  "independent-review": (v) => `Independent review by ${v.channel}, on YouTube. Not made by us.`,
  manufacturer: (v) => `Video from the manufacturer (${v.channel}), on YouTube.`,
  own: () => "Our video.",
  "ai-generated": () => "AI-generated. Not footage of the real product in use.",
};

export function VideoFigure({ video }: { video: ProductVideoData }) {
  return (
    <figure className="not-prose my-6">
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
}: {
  image: ProductImageData;
  className?: string;
  priority?: boolean;
}) {
  return (
    <figure className={`not-prose ${className}`}>
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        priority={priority}
        className="h-auto w-full rounded-md bg-white object-contain"
      />
      <figcaption className="mt-1 text-xs text-muted">
        {image.aiGenerated && <span className="font-semibold text-warn">AI-generated image. </span>}
        {image.credit}
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
