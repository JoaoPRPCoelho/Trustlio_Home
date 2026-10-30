import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout";
import { getRubrics } from "@/lib/data";
import { site } from "@/lib/site";
import { METHODOLOGY_VERSION } from "@/lib/trust-score";

export const metadata: Metadata = {
  title: "How the Trust Score works",
  description: `The ${site.name} Trust Score rates how safe a purchase is, from 0 to 100, using five pillars of public, verifiable evidence.`,
  alternates: { canonical: "/methodology/trust-score/" },
};

const UPDATED = "Oct 29, 2026";

const pillars = [
  [
    "Independent evidence",
    30,
    "Three or more independent sources with real use (10; two sources = 5). Sources agree the main function works (10; partly = 5). No failure mode reported by two or more sources (10).",
  ],
  [
    "Safety & compliance",
    20,
    "No recalls for the brand in this category in the last five years, in the recall databases of the markets where it's sold (8). A relevant independent certification we could verify in a public database (8): UL or ETL listing or an FCC ID in the US; a certificate from an independent body such as TÜV, VDE or BSI in the UK and EU. A CE or UKCA mark alone doesn't count, because the maker declares it itself. Materials and safety warnings declared (4). When no certification applies to the category, the other two checks are scaled to 20.",
  ],
  [
    "Specs & claims transparency",
    20,
    "Dimensions, weight and materials published by the maker (8; partly = 4). Claims are measurable, not vague (6; partly = 3). Claims confirmed by at least one independent source (6).",
  ],
  [
    "Brand accountability",
    15,
    "The brand has its own website with contact details and an address (5). Its trademark is registered at the USPTO, the EUIPO or the UK IPO, for a market where the product is sold (5). It has sold products for three years or more (5; one to three years = 2).",
  ],
  [
    "Warranty & support",
    15,
    "Manufacturer warranty of two years or more (8; one year = 5). Warranty terms published with a clear claim process (4). Spare parts or documented support (3).",
  ],
] as const;

export default function TrustScoreMethodology() {
  const rubrics = getRubrics();
  return (
    <PageShell>
      <article className="prose max-w-none">
        <h1>How the Trust Score works</h1>
        <p>
          The {site.name} Trust Score rates how safe a purchase is, from 0 to 100, using five
          pillars of public, verifiable evidence. It does not measure which product is best. It
          answers a narrower question: if you buy this, how likely is it to be safe, do what it
          claims, and be backed by a company that stands behind it?
        </p>
        <p>
          <strong>Current version:</strong> {METHODOLOGY_VERSION} · <strong>Last updated:</strong>{" "}
          {UPDATED} · <a href="/trust-score/data.json">Download all scores (JSON)</a> ·{" "}
          <a href="/trust-score/data.csv">CSV</a>
        </p>

        <h2>The short version</h2>
        <ul>
          <li>
            Every score is the sum of five pillars, each built from yes/no checks with fixed points,
            so two people scoring the same product should land on the same number.
          </li>
          <li>
            Every check links to its evidence. Open the sources list on any review and verify it
            yourself.
          </li>
          <li>
            We never use Amazon star ratings, review counts or review text. We can&apos;t verify
            them, and Amazon&apos;s rules for affiliates don&apos;t allow it.
          </li>
          <li>
            We earn commissions from some links. Commissions never change a score, and we publish
            low scores too.
          </li>
        </ul>

        <h2>Two rules before any score</h2>
        <ol>
          <li>
            <strong>Active recall.</strong> If a product or model is under an active recall in any
            market where we link to it, we don&apos;t score it: the U.S. Consumer Product Safety
            Commission (CPSC), the EU Safety Gate or the UK government&apos;s product safety recalls list. We label it
            &ldquo;Not recommended: active recall&rdquo; and link to the recall notice.
          </li>
          <li>
            <strong>Not enough evidence.</strong> If fewer than two independent sources show real
            use of the product, we don&apos;t publish a number. We label it &ldquo;Not enough
            evidence yet.&rdquo; A score without evidence would only look precise.
          </li>
        </ol>

        <h2>The five pillars</h2>
        <table>
          <thead>
            <tr>
              <th>Pillar</th>
              <th>Points</th>
              <th>What we check</th>
            </tr>
          </thead>
          <tbody>
            {pillars.map(([name, max, checks]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{max}</td>
                <td>{checks}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          <strong>Independent sources</strong> are reviews, videos or discussions by people with no
          commercial tie to the brand, who show or describe using the product: editorial reviews,
          owner discussions on forums such as Reddit, and video tests or teardowns. Retailer review
          sections don&apos;t count.
        </p>

        <h2>Reading a score</h2>
        <table>
          <thead>
            <tr>
              <th>Score</th>
              <th>Band</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>85–100</td>
              <td>Excellent</td>
            </tr>
            <tr>
              <td>70–84</td>
              <td>Good</td>
            </tr>
            <tr>
              <td>55–69</td>
              <td>Fair</td>
            </tr>
            <tr>
              <td>Below 55</td>
              <td>Poor</td>
            </tr>
          </tbody>
        </table>
        <p>Next to every score we show a confidence level, which is separate from the score:</p>
        <ul>
          <li>
            <strong>High:</strong> five or more independent sources, or we tested the product
            ourselves.
          </li>
          <li>
            <strong>Medium:</strong> three or four independent sources.
          </li>
          <li>
            <strong>Low:</strong> two independent sources.
          </li>
        </ul>
        <p>A 75 with high confidence is a stronger signal than an 85 with low confidence.</p>

        <h2>Tested vs. researched</h2>
        <p>
          Most scores come from research, not hands-on testing, and each review says which. When we
          have used a product ourselves, the review says &ldquo;Tested hands-on by our team.&rdquo;
          We never describe a product as tested when it wasn&apos;t.
        </p>

        <h2>Products sold in several markets</h2>
        <p>
          Some products are sold under different models in the US and in Europe, such as a smart
          lock made for US deadbolts and one made for European cylinders. A score covers the exact
          model on its page. When another market gets a different model, the page links to that
          model&apos;s own review and score, and a hands-on test only ever covers the model we
          used.
        </p>

        <h2>What we don&apos;t use, and why</h2>
        <ul>
          <li>
            <strong>Amazon star ratings, review counts and review text.</strong> Amazon&apos;s
            Associates Program Policies don&apos;t allow affiliates to display or otherwise use
            them, and fake reviews make them unreliable as evidence.
          </li>
          <li>
            <strong>Price.</strong> Prices change daily and don&apos;t tell you whether a product is
            trustworthy. Check the current price at the retailer.
          </li>
          <li>
            <strong>Sponsored content or free samples in exchange for coverage.</strong> If a brand
            ever sends us a product, we&apos;ll say so on the page, and it won&apos;t affect the
            checks above.
          </li>
        </ul>

        <h2>Keeping scores current</h2>
        <ul>
          <li>
            We check every scored product against the CPSC recall database every week, automatically.
            Products sold in the UK or EU are also checked by hand against the EU Safety Gate and the
            UK government&apos;s product safety recalls list before we publish and at every review. A new recall removes the
            score.
          </li>
          <li>We redo the full review every six months, or sooner when a model changes.</li>
          <li>
            Every review shows the date it was last reviewed and the methodology version used.
          </li>
        </ul>

        <h2>Small-space fit: a separate rating</h2>
        <p>
          Some reviews also show a <strong>small-space fit</strong> rating. It rates how well a
          product does its job in a small home, against criteria for its category, from 0 to 10 per
          criterion. It never changes the Trust Score, and price never enters it.
        </p>
        {rubrics.map((rubric) => {
          const total = rubric.criteria.reduce((sum, c) => sum + c.weight, 0);
          return (
            <section key={rubric.id}>
              <h3>
                {rubric.name} <small>(fit rubric v{rubric.version}, updated {rubric.updated})</small>
              </h3>
              <table>
                <thead>
                  <tr>
                    <th>Criterion</th>
                    <th>Weight</th>
                    <th>What we look at</th>
                  </tr>
                </thead>
                <tbody>
                  {rubric.criteria.map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{Math.round((100 * c.weight) / total)}%</td>
                      <td>
                        {c.description}
                        {c.critical &&
                          ` Critical: below ${c.critical.minimum}/10 caps the rating at ${c.critical.cap}.`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          );
        })}

        <h2>Corrections and brand responses</h2>
        <p>
          If you think a score is wrong, email{" "}
          <a href={`mailto:${site.correctionsEmail}`}>{site.correctionsEmail}</a> with the product
          and the evidence. We review every request within 14 days. When a correction changes a
          score, we note it on the page with the date. Brands can send evidence, such as
          certification records or warranty terms, but they can&apos;t pay for or negotiate a
          score.
        </p>

        <h2>Changelog</h2>
        <table>
          <thead>
            <tr>
              <th>Version</th>
              <th>Date</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1.1</td>
              <td>{UPDATED}</td>
              <td>
                Covers products sold in the UK and EU: recalls from the EU Safety Gate and the UK
                government&apos;s product safety recalls list, independent European certifications, and EUIPO or UK IPO
                trademarks. Scores of US products don&apos;t change.
              </td>
            </tr>
            <tr>
              <td>1.0</td>
              <td>Oct 26, 2026</td>
              <td>First version.</td>
            </tr>
          </tbody>
        </table>

        <h2>Affiliate disclosure</h2>
        <p>
          {site.name} is reader-supported. As an Amazon Associate I earn from qualifying purchases.
          We may also earn from other retailer links. This never changes a score: the checks above
          are the same for every product, whether or not we earn from it. See our{" "}
          <Link href="/disclosure/">full disclosure</Link>.
        </p>
      </article>
    </PageShell>
  );
}
