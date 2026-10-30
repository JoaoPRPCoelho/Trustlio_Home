import Link from "next/link";
import type { EvidenceLevel, Trust } from "@/lib/schemas";
import type { FitScore } from "@/lib/fit-score";
import { trustStatusLabel, type TrustScore } from "@/lib/trust-score";

const evidenceLabels: Record<EvidenceLevel, string> = {
  "hands-on-tested": "Hands-on tested",
  "owner-verified": "Owner-verified",
  "research-based": "Research-based",
};

export function EvidenceTag({ level }: { level: EvidenceLevel }) {
  return (
    <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
      {evidenceLabels[level]}
    </span>
  );
}

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

// A gated product shows "—" instead of a number; the label says why.
export function TrustScoreBadge({ trust, size = "md" }: { trust: TrustScore; size?: "md" | "lg" }) {
  const big = size === "lg";
  const label =
    trust.total === null
      ? `Trust score: ${trustStatusLabel[trust.status as keyof typeof trustStatusLabel]}`
      : `Trust score ${trust.total} out of 100`;
  return (
    <span
      className={`inline-flex flex-col items-center justify-center rounded-lg font-semibold ${
        trust.status === "active-recall" ? "bg-warn-soft text-warn" : "bg-accent-soft text-accent"
      } ${big ? "h-20 w-20 text-3xl" : "h-12 w-12 text-lg"}`}
      aria-label={label}
      title={label}
    >
      {trust.total ?? "—"}
      <span className="text-[10px] font-normal uppercase tracking-wide">/ 100</span>
    </span>
  );
}

export const trustScoreText = (trust: TrustScore) =>
  trust.total === null
    ? trustStatusLabel[trust.status as keyof typeof trustStatusLabel]
    : `${trust.total}/100`;

export function TrustScoreBreakdown({
  trust,
  data,
  handsOnTested,
}: {
  trust: TrustScore;
  data: Trust;
  handsOnTested: boolean;
}) {
  const sources = data.inputs.e1IndependentSources;
  return (
    <section className="rounded-lg border border-border bg-white p-4" aria-labelledby="trust-score">
      <div className="flex items-center gap-4">
        <TrustScoreBadge trust={trust} size="lg" />
        <div className="text-sm text-muted">
          {trust.total === null ? (
            <p id="trust-score" className="font-medium text-foreground">
              {trustStatusLabel[trust.status as keyof typeof trustStatusLabel]}
            </p>
          ) : (
            <>
              <p id="trust-score" className="font-medium text-foreground">
                Trust Score: {trust.total}/100 ({trust.band})
              </p>
              <p>
                Confidence: {trust.confidence} ({handsOnTested ? "tested by us, " : ""}
                {sources} independent {sources === 1 ? "source" : "sources"})
              </p>
            </>
          )}
          <p>
            Reviewed <time dateTime={data.reviewed}>{formatDate(data.reviewed)}</time> · Methodology
            v{trust.version} ·{" "}
            <Link href="/methodology/trust-score/" className="underline">
              how we score
            </Link>
          </p>
        </div>
      </div>
      {trust.status === "active-recall" && (
        <p className="mt-3 text-sm text-warn">
          This product is under an active safety recall. Check the recall notice in the sources below before
          using it.
        </p>
      )}
      {trust.status === "not-enough-evidence" && (
        <p className="mt-3 text-sm">
          We publish a score only when at least two independent sources show real use of the
          product.
        </p>
      )}
      {trust.status === "scored" && (
        <>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="text-left text-muted">
                <th scope="col" className="py-1 font-normal">
                  Pillar
                </th>
                <th scope="col" className="py-1 text-right font-normal">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              {trust.pillars.map((p) => (
                <tr key={p.key} className="border-t border-border">
                  <th scope="row" className="py-2 text-left font-normal">
                    {p.name}
                  </th>
                  <td className="py-2 text-right font-medium">
                    {p.points}/{p.max}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-sm">
            <span className="font-medium">Why this score:</span> {data.summary}
          </p>
        </>
      )}
      <p className="mt-3 text-xs text-muted">
        {handsOnTested
          ? "Tested hands-on by our team. "
          : "Not hands-on tested. This score is based on public, verifiable evidence. "}
        Commissions never change a score.
      </p>
    </section>
  );
}

export function TrustSources({ data }: { data: Trust }) {
  return (
    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
      {data.sources.map((s) => (
        <li key={`${s.item}-${s.url}`}>
          <a href={s.url} className="underline" rel="nofollow noopener" target="_blank">
            {s.title}
          </a>{" "}
          <span className="text-muted">({s.item})</span>: {s.note}. Accessed{" "}
          {formatDate(s.accessed)}.
        </li>
      ))}
    </ul>
  );
}

// The separate small-space fit rating, from the category's fit rubric.
export function FitScoreBreakdown({ fit, rubricName }: { fit: FitScore; rubricName: string }) {
  const totalWeight = fit.lines.reduce((sum, line) => sum + line.weight, 0);
  return (
    <section className="rounded-lg border border-border bg-white p-4" aria-labelledby="fit-score">
      <p id="fit-score" className="font-medium">
        Small-space fit: {fit.total}/100
      </p>
      <p className="text-sm text-muted">
        {rubricName} fit rubric v{fit.rubricVersion}. Separate from the Trust Score: it rates how
        well the product does its job in a small home.
        {fit.cappedBy.length > 0 && ` Capped from ${fit.uncapped}: a critical criterion is below its minimum.`}
      </p>
      <table className="mt-3 w-full text-sm">
        <thead>
          <tr className="text-left text-muted">
            <th className="py-1 font-normal">Criterion</th>
            <th className="py-1 font-normal">Weight</th>
            <th className="py-1 text-right font-normal">Score</th>
          </tr>
        </thead>
        <tbody>
          {fit.lines.map((line) => (
            <tr key={line.id} className="border-t border-border">
              <td className="py-2">
                {line.name}
                {line.capped && <span className="ml-2 text-xs text-warn">below minimum</span>}
              </td>
              <td className="py-2 text-muted">{Math.round((100 * line.weight) / totalWeight)}%</td>
              <td className="py-2 text-right font-medium">{line.score}/10</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
