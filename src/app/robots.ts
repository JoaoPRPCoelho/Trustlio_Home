import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

// Crawlers that collect AI training data, not search or answer crawlers.
const aiTrainingCrawlers = [
  "GPTBot",
  "ClaudeBot",
  "CCBot",
  "Google-Extended",
  "Applebot-Extended",
  "meta-externalagent",
  "Bytespider",
];

// Search and AI-search crawlers are welcome: visibility matters more than
// protection at this stage. /go/ is only redirects, so keep crawlers out.
// Open Icecat's Fair Use Policy asks us to keep AI-training crawlers away from
// its copyrighted material, which is the product photos.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/go/" },
      { userAgent: aiTrainingCrawlers, allow: "/", disallow: ["/go/", "/images/products/"] },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
