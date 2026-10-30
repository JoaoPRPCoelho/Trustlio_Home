import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `Who runs ${site.name}, how products are chosen and scored, and how to reach us.`,
  alternates: { canonical: "/about/" },
};

export default function About() {
  return (
    <PageShell>
      <article className="prose max-w-none">
        <h1>About {site.name}</h1>
        <p>
          {site.name} compares the gadgets and tools that make life in a small home easier:
          robot vacuums with docks that fit a studio, air purifiers you can sleep next to, and
          renter-friendly gear that doesn&apos;t need a drill. Each guide starts with who should
          buy what, then shows the evidence behind it.
        </p>

        <h2>What makes it different</h2>
        <p>
          Every product gets a <Link href="/methodology/trust-score/">Trust Score</Link> out of
          100, built from public, checkable evidence: independent reviews and lab measurements,
          safety recalls and certifications, how honest the specs are, the brand&apos;s track
          record and the warranty. Each check links to its source, and the full dataset is{" "}
          <a href="/trust-score/data.csv">free to download</a>. Products for small spaces also
          get a separate small-space fit rating for size, noise and other things that matter in a
          small room.
        </p>
        <p>
          We never use Amazon star ratings or review counts. We can&apos;t verify them, and
          Amazon&apos;s rules for affiliates don&apos;t allow it.
        </p>

        <h2>Tested or researched</h2>
        <p>
          Most pages are research-based: the score comes from published reviews, measurements and
          official records, and the page says so. When we&apos;ve used a product ourselves, the
          page says it was tested and shows our own photos. We never call a product tested when we
          haven&apos;t used it.
        </p>

        <h2>Who runs it</h2>
        <p>
          {site.name} is an independent site run by {site.defaultAuthor} from {site.ownerLocation}.
          No brand or retailer owns or funds it. It&apos;s a small operation: guides come out
          slowly, and they get updated when the evidence changes.
        </p>
        <p>
          We use AI tools to help find sources and draft text. Every spec and every score check
          links to a public source that a person can open and check, and we don&apos;t publish
          AI-made photos or videos of a product in use.
        </p>

        <h2>How we make money</h2>
        <p>
          Through affiliate links: a store may pay us a commission when you buy after clicking a
          link here. It never changes a score or a pick. Read the{" "}
          <Link href="/disclosure/">affiliate disclosure</Link> for the details.
        </p>

        <h2>Corrections and contact</h2>
        <p>
          Spotted a mistake, or have evidence that a score is wrong? Email{" "}
          <a href={`mailto:${site.correctionsEmail}`}>{site.correctionsEmail}</a>. We review every
          request within 14 days. Brands can send evidence but can&apos;t pay for or negotiate a
          score.
        </p>
        <p>
          For anything else, including partnerships, email{" "}
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
        </p>
      </article>
    </PageShell>
  );
}
