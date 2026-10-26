import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

// Search and AI-search crawlers are welcome: visibility matters more than
// protection at this stage. /go/ is only redirects, so keep crawlers out.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/go/" }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
