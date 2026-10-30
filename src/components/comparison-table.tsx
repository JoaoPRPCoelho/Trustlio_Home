"use client";

import { useState } from "react";

export type ComparisonColumn = {
  id: string;
  name: string;
  trust: number | null;
  fit: number | null;
  // One display value per row label, in the same order.
  cells: string[];
};

type SortKey = "picks" | "trust" | "fit";

// The table renders in full on the server, in the guide's own order, so crawlers
// and no-JS readers get every value. JavaScript only adds re-sorting and the
// column highlight.
export function SortableComparison({
  rowLabels,
  columns,
  scoreRows,
}: {
  rowLabels: string[];
  columns: ComparisonColumn[];
  // Index of the row that holds each score, so the best value can be marked.
  scoreRows: { trust: number; fit: number | null };
}) {
  const [sort, setSort] = useState<SortKey>("picks");
  const [hover, setHover] = useState<string | null>(null);

  const sorted =
    sort === "picks"
      ? columns
      : [...columns].sort((a, b) => (b[sort] ?? -1) - (a[sort] ?? -1));
  const best = (key: "trust" | "fit") => Math.max(...columns.map((c) => c[key] ?? -1));
  const bestTrust = best("trust");
  const bestFit = best("fit");

  const options: [SortKey, string][] = [
    ["picks", "Our order"],
    ["trust", "Trust Score"],
    ...(scoreRows.fit !== null ? [["fit", "Small-space fit"] as [SortKey, string]] : []),
  ];

  return (
    <div className="not-prose my-8 rounded-2xl border border-border bg-surface shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="font-display text-lg font-semibold">Compare side by side</p>
        <div className="flex items-center gap-1 rounded-full bg-background p-1 text-xs font-medium" role="group" aria-label="Sort products">
          {options.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSort(key)}
              aria-pressed={sort === key}
              className={`rounded-full px-3 py-1.5 transition ${
                sort === key ? "bg-brand text-white shadow" : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-sm">
          <thead>
            <tr className="text-left">
              <th className="sticky left-0 z-10 bg-surface px-4 py-3 font-medium text-muted">
                <span className="sr-only">Spec</span>
              </th>
              {sorted.map((c) => (
                <th
                  key={c.id}
                  onMouseEnter={() => setHover(c.id)}
                  onMouseLeave={() => setHover(null)}
                  className={`min-w-[8.5rem] px-3 py-3 align-bottom font-semibold transition-colors ${hover === c.id ? "bg-accent-soft/60" : ""}`}
                >
                  <a href={`#${c.id}`} className="hover:text-accent">
                    {c.name}
                  </a>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowLabels.map((label, row) => (
              <tr key={label} className="border-t border-border">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-surface px-4 py-2.5 text-left font-normal text-muted"
                >
                  {label}
                </th>
                {sorted.map((c) => {
                  const isBest =
                    (row === scoreRows.trust && c.trust !== null && c.trust === bestTrust) ||
                    (row === scoreRows.fit && c.fit !== null && c.fit === bestFit);
                  const isScore = row === scoreRows.trust || row === scoreRows.fit;
                  return (
                    <td
                      key={c.id}
                      onMouseEnter={() => setHover(c.id)}
                      onMouseLeave={() => setHover(null)}
                      className={`px-3 py-2.5 transition-colors ${hover === c.id ? "bg-accent-soft/60" : ""} ${
                        isScore ? "font-semibold tabular-nums" : ""
                      } ${row === scoreRows.trust ? "text-accent" : ""}`}
                    >
                      {c.cells[row]}
                      {isBest && (
                        <span className="ml-1.5 rounded-full bg-gold-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warn">
                          Top
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
