import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Affiliate disclosure",
  alternates: { canonical: "/disclosure/" },
};

// DRAFT: legal wording to be reviewed by the site owner before launch.
export default function Disclosure() {
  return (
    <PageShell>
      <article className="prose max-w-none">
        <h1>Affiliate disclosure</h1>
        <p>
          {site.name} is free to read. We pay for it through affiliate links: when you buy
          something after clicking a link on this site, the store may pay us a commission. The
          price you pay is the same.
        </p>
        <p>As an Amazon Associate we earn from qualifying purchases.</p>
        <p>
          Commissions never affect our trust scores. Scores come from a published rubric, and we
          earn the same commission whether a product scores well or badly. See{" "}
          <Link href="/methodology/trust-score/">how the trust score works</Link>.
        </p>
        <p>
          We only say a product was tested when we used it ourselves. Otherwise the page says the
          score is research-based.
        </p>
      </article>
    </PageShell>
  );
}
