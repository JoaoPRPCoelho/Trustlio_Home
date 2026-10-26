import Link from "next/link";
import type { EvidenceLevel } from "@/lib/schemas";
import type { TrustScore } from "@/lib/trust-score";

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

export function TrustScoreBadge({ score, size = "md" }: { score: number; size?: "md" | "lg" }) {
  const big = size === "lg";
  return (
    <span
      className={`inline-flex flex-col items-center justify-center rounded-lg bg-accent-soft font-semibold text-accent ${
        big ? "h-20 w-20 text-3xl" : "h-12 w-12 text-lg"
      }`}
      aria-label={`Trust score ${score} out of 100`}
    >
      {score}
      <span className="text-[10px] font-normal uppercase tracking-wide">/ 100</span>
    </span>
  );
}

export function TrustScoreBreakdown({ trust }: { trust: TrustScore }) {
  const totalWeight = trust.lines.reduce((sum, line) => sum + line.weight, 0);
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="flex items-center gap-4">
        <TrustScoreBadge score={trust.total} size="lg" />
        <div className="text-sm text-muted">
          <p className="font-medium text-foreground">Trust score</p>
          <p>
            Rubric v{trust.rubricVersion} ·{" "}
            <Link href="/methodology/trust-score/" className="underline">
              how we score
            </Link>
          </p>
          {trust.cappedBy.length > 0 && (
            <p className="mt-1 text-warn">
              Capped from {trust.uncapped}: a critical criterion is below its minimum.
            </p>
          )}
        </div>
      </div>
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="text-left text-muted">
            <th className="py-1 font-normal">Criterion</th>
            <th className="py-1 font-normal">Weight</th>
            <th className="py-1 text-right font-normal">Score</th>
          </tr>
        </thead>
        <tbody>
          {trust.lines.map((line) => (
            <tr key={line.id} className="border-t border-border">
              <td className="py-2">
                {line.name}
                {line.capped && <span className="ml-2 text-xs text-warn">below minimum</span>}
              </td>
              <td className="py-2 text-muted">
                {Math.round((100 * line.weight) / totalWeight)}%
              </td>
              <td className="py-2 text-right font-medium">{line.score}/10</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
