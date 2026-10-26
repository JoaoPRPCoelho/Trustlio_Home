import type { NextConfig } from "next";
import createMDX from "@next/mdx";

// Fully static site: `next build` writes plain HTML to `out/`, which Cloudflare
// Pages serves as-is. Anything that needs a server (rewrites, ISR, default image
// optimization, Server Actions) is unavailable by design.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
  },
});

export default withMDX(nextConfig);
