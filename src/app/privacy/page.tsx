import type { Metadata } from "next";
import { PageShell } from "@/components/layout";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  alternates: { canonical: "/privacy/" },
};

// DRAFT: to be reviewed by the site owner before launch, and updated when
// the newsletter is added.
export default function Privacy() {
  return (
    <PageShell>
      <article className="prose max-w-none">
        <h1>Privacy</h1>
        <p>
          {site.name} does not use advertising cookies. When you click an affiliate link, the
          store you visit (for example Amazon) may set its own cookies under its own privacy policy.
        </p>
        <h2>Analytics</h2>
        <p>
          We count visits with Cloudflare Web Analytics, which does not use cookies or local
          storage and does not fingerprint visitors by IP address or browser. It tells us which
          pages are read and where visitors come from, in aggregate. See{" "}
          <a href="https://www.cloudflare.com/privacypolicy/">Cloudflare&apos;s privacy policy</a>.
        </p>
        <p>
          We also use Google Search Console, which reports how the site appears in Google search.
          It adds nothing to the pages you visit.
        </p>
      </article>
    </PageShell>
  );
}
