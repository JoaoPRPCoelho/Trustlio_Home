import { getProducts } from "@/lib/data";

// Emits Cloudflare Pages' `_redirects` file at build time: one 302 per
// non-Amazon offer, so /go/<product>/<merchant>/ always points at the URL in
// the product's data file.
export const dynamic = "force-static";

export function GET() {
  const lines = getProducts().flatMap((p) =>
    p.offers
      .filter((o) => o.href !== o.destination)
      .map((o) => `${o.href} ${o.destination} 302`),
  );
  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain" },
  });
}
