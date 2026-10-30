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
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        level === "research-based"
          ? "border-border bg-surface text-muted"
          : "border-accent/30 bg-accent-soft text-accent"
      }`}
    >
      <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden="true">
        {level === "research-based" ? (
          <path d="M7 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm3.2 7.7 3.3 3.3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        ) : (
          <path d="m3 8.5 3.2 3L13 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
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

const bandColor = (trust: TrustScore) =>
  trust.status === "active-recall"
    ? "var(--warn)"
    : trust.band === "Excellent" || trust.band === "Good"
      ? "var(--accent)"
      : trust.band === "Fair"
        ? "var(--gold)"
        : "var(--muted)";

// A ring that fills to the score. A gated product shows "—" instead of a
// number; the label says why.
export function TrustScoreBadge({
  trust,
  size = "md",
}: {
  trust: TrustScore;
  size?: "sm" | "md" | "lg";
}) {
  const label =
    trust.total === null
      ? `Trust score: ${trustStatusLabel[trust.status as keyof typeof trustStatusLabel]}`
      : `Trust score ${trust.total} out of 100`;
  const r = 26;
  const c = 2 * Math.PI * r;
  const value = trust.total ?? 0;
  const box = { sm: "h-11 w-11", md: "h-14 w-14", lg: "h-24 w-24" }[size];
  const text = { sm: "text-sm", md: "text-lg", lg: "text-3xl" }[size];
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${box}`}
      role="img"
      aria-label={label}
      title={label}
    >
      <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r={r} fill="var(--surface)" stroke="var(--border)" strokeWidth="5" />
        {trust.total !== null && (
          <circle
            className="score-ring-value"
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke={bandColor(trust)}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - value / 100)}
            style={{ "--ring-circumference": c } as React.CSSProperties}
          />
        )}
      </svg>
      <span className={`relative flex flex-col items-center leading-none font-semibold ${text}`}>
        {trust.total ?? "—"}
        {size === "lg" && (
          <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted">
            / 100
          </span>
        )}
      </span>
    </span>
  );
}

// A horizontal bar, used for pillars and fit criteria.
export function ScoreBar({ value, max, tone = "accent" }: { value: number; max: number; tone?: "accent" | "warn" }) {
  return (
    <span className="block h-2 w-full overflow-hidden rounded-full bg-border/70" aria-hidden="true">
      <span
        className={`score-bar-value block h-full rounded-full ${tone === "warn" ? "bg-warn" : "bg-accent"}`}
        style={{ width: `${Math.max(0, Math.min(100, (100 * value) / max))}%` }}
      />
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
    <section
      className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
      aria-labelledby="trust-score"
    >
      <div className="flex items-center gap-5">
        <TrustScoreBadge trust={trust} size="lg" />
        <div className="text-sm text-muted">
          {trust.total === null ? (
            <p id="trust-score" className="font-medium text-foreground">
              {trustStatusLabel[trust.status as keyof typeof trustStatusLabel]}
            </p>
          ) : (
            <>
              <p id="trust-score" className="font-display text-xl font-semibold text-foreground">
                Trust Score: {trust.total}/100{" "}
                <span className="ml-1 rounded-full bg-accent-soft px-2.5 py-0.5 align-middle font-sans text-xs font-semibold text-accent">
                  {trust.band}
                </span>
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
          This product is under a CPSC recall. Check the recall notice in the sources below before
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
          <ul className="mt-5 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            {trust.pillars.map((p) => (
              <li key={p.key}>
                <span className="flex justify-between gap-2">
                  <span>{p.name}</span>
                  <span className="font-semibold tabular-nums">
                    {p.points}
                    <span className="font-normal text-muted">/{p.max}</span>
                  </span>
                </span>
                <span className="mt-1.5 block">
                  <ScoreBar value={p.points} max={p.max} />
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 rounded-xl bg-background p-4 text-sm leading-relaxed">
            <span className="font-semibold">Why this score:</span> {data.summary}
          </p>
        </>
      )}
      <p className="mt-4 text-xs text-muted">
        {handsOnTested
          ? "Tested hands-on by our team. "
          : "Not hands-on tested. This score is based on public, verifiable evidence. "}
        Commissions never change a score.
      </p>
    </section>
  );
}

// Long source lists fold away; the content stays in the HTML for crawlers.
export function SourcesDisclosure({
  title,
  count,
  open = false,
  children,
}: {
  title: string;
  count: number;
  open?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={open} className="group rounded-2xl border border-border bg-surface shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
        <h2 className="font-display text-xl font-semibold">
          {title} <span className="font-sans text-sm font-normal text-muted">({count})</span>
        </h2>
        <svg viewBox="0 0 16 16" className="chevron h-4 w-4 shrink-0 text-muted transition-transform" aria-hidden="true">
          <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="border-t border-border px-5 pt-1 pb-5">{children}</div>
    </details>
  );
}

export function TrustSources({ data }: { data: Trust }) {
  return (
    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed marker:text-accent">
      {data.sources.map((s) => (
        <li key={`${s.item}-${s.url}`}>
          <a href={s.url} className="font-medium text-accent underline underline-offset-2" rel="nofollow noopener" target="_blank">
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
    <section
      className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
      aria-labelledby="fit-score"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p id="fit-score" className="font-display text-xl font-semibold">
          Small-space fit
        </p>
        <p className="font-display text-2xl font-semibold text-accent tabular-nums">
          {fit.total}
          <span className="font-sans text-sm font-normal text-muted">/100</span>
        </p>
      </div>
      <p className="mt-1 text-sm text-muted">
        {rubricName} fit rubric v{fit.rubricVersion}. Separate from the Trust Score: it rates how
        well the product does its job in a small home.
        {fit.cappedBy.length > 0 && ` Capped from ${fit.uncapped}: a critical criterion is below its minimum.`}
      </p>
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-muted">
            <th className="py-1 font-medium">Criterion</th>
            <th className="py-1 font-medium">Weight</th>
            <th className="w-1/3 py-1 text-right font-medium">Score</th>
          </tr>
        </thead>
        <tbody>
          {fit.lines.map((line) => (
            <tr key={line.id} className="border-t border-border">
              <td className="py-2.5 pr-3">
                {line.name}
                {line.capped && <span className="ml-2 text-xs text-warn">below minimum</span>}
              </td>
              <td className="py-2.5 text-muted tabular-nums">
                {Math.round((100 * line.weight) / totalWeight)}%
              </td>
              <td className="py-2.5">
                <span className="flex items-center gap-3">
                  <ScoreBar value={line.score} max={10} tone={line.capped ? "warn" : "accent"} />
                  <span className="w-10 shrink-0 text-right font-semibold tabular-nums">
                    {line.score}/10
                  </span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
