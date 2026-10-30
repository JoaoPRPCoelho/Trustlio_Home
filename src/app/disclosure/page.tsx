import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout";
import { amazonAssociateStatement, site } from "@/lib/site";

const UPDATED = "October 30, 2026";

export const metadata: Metadata = {
  title: "Affiliate disclosure",
  description: `How ${site.name} makes money, and why it never changes a score or a pick.`,
  alternates: { canonical: "/disclosure/" },
};

export default function Disclosure() {
  return (
    <PageShell>
      <article className="prose max-w-none">
        <h1>Affiliate disclosure</h1>
        <p className="text-sm text-muted">Last updated: {UPDATED}</p>
        <p>
          {site.name} is free to read and has no ads. We pay for it through affiliate links: when
          you click a store link on this site and then buy something, the store may pay us a
          commission. You pay the same price either way.
        </p>

        <h2>Which links earn us money</h2>
        <p>
          Store buttons on guides and reviews, such as &ldquo;View at Levoit&rdquo;, can be
          affiliate links. Some go directly to the store and some pass through a short
          trustliohome.com/go/ link first, so we can switch the store link without editing every
          article. Brands run their affiliate programs themselves or through affiliate networks,
          which track the click and report the sale to us.
        </p>
        {site.amazonAssociate && (
          <p>
            {site.name} is a participant in the Amazon Services LLC Associates Program.{" "}
            {amazonAssociateStatement}
          </p>
        )}
        <p>
          Not every link pays. Some brands have no affiliate program, and we still recommend
          their products when they are the better buy. Every page with store links says so above
          the first one.
        </p>

        <h2>What commissions don&apos;t change</h2>
        <ul>
          <li>
            <strong>Scores.</strong> Trust Scores come from fixed, published checks, the same for
            every product, whether or not we earn from it. See{" "}
            <Link href="/methodology/trust-score/">how the Trust Score works</Link>.
          </li>
          <li>
            <strong>Picks.</strong> The product that wins a guide is the one the evidence
            supports, not the one with the highest commission. Whether a brand has an affiliate
            program can affect which product categories we cover, never which product wins.
          </li>
          <li>
            <strong>Placement.</strong> Brands can&apos;t pay to be included, to be ranked higher
            or to see a page before it&apos;s published.
          </li>
        </ul>

        <h2>Free products and brand contact</h2>
        <p>
          We may ask brands for product photos, specifications or warranty terms, and they may
          offer review samples. If we review a product we got for free, the review says so. A
          free sample doesn&apos;t buy coverage or a better score.
        </p>

        <h2>Tested or researched</h2>
        <p>
          We only say a product was tested when we used it ourselves. Otherwise the page says the
          score is research-based and names the sources it comes from.
        </p>

        <h2>Questions</h2>
        <p>
          Email <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
        </p>
      </article>
    </PageShell>
  );
}
