import type { Metadata } from "next";
import { PageShell } from "@/components/layout";
import { getRubrics } from "@/lib/data";

export const metadata: Metadata = {
  title: "How the trust score works",
  description:
    "Every product is scored 0–100 against a published rubric for its category, with a source behind each criterion.",
  alternates: { canonical: "/methodology/trust-score/" },
};

export default function TrustScoreMethodology() {
  const rubrics = getRubrics();
  return (
    <PageShell>
      <article className="prose max-w-none">
        <h1>How the trust score works</h1>
        <p>
          Every product gets a score from 0 to 100. We rate it from 0 to 10 on each criterion in
          its category&apos;s rubric, weight those ratings, and scale the result to 100. Each rating
          links to the source it comes from.
        </p>
        <p>
          Some criteria are critical. If a product falls below the minimum on one of them, its
          score is capped, however well it does elsewhere. A space heater without a safety listing
          can&apos;t be a top pick.
        </p>
        <p>
          Next to every score we show how we know what we know: <strong>hands-on tested</strong>{" "}
          (we used it), <strong>owner-verified</strong> (checked with real owners) or{" "}
          <strong>research-based</strong> (specs, independent tests and owner reviews). The evidence
          level never changes the score itself.
        </p>
        <p>
          Commissions never enter the formula. We earn the same whether a product scores 40 or 90.
        </p>

        {rubrics.map((rubric) => {
          const total = rubric.criteria.reduce((sum, c) => sum + c.weight, 0);
          return (
            <section key={rubric.id}>
              <h2>
                {rubric.name} <small>(rubric v{rubric.version}, updated {rubric.updated})</small>
              </h2>
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
                          ` Critical: below ${c.critical.minimum}/10 caps the score at ${c.critical.cap}.`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          );
        })}
      </article>
    </PageShell>
  );
}
