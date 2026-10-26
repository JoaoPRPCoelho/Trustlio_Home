import type { Product, Rubric } from "./schemas";

export type FitLine = {
  id: string;
  name: string;
  weight: number;
  score: number;
  source: string;
  note?: string;
  capped: boolean;
};

export type FitScore = {
  total: number;
  uncapped: number;
  cappedBy: string[];
  lines: FitLine[];
  rubricVersion: string;
};

// Small-space fit = 10 × Σ(wᵢ·sᵢ) / Σwᵢ, rounded, then limited by any critical
// criterion that falls below its minimum. It rates how well a product does its
// job in a small home, per category rubric. It is separate from the trust score
// (trust-score.ts), and price and commission never enter it.
export function computeFitScore(product: Product, rubric: Rubric): FitScore {
  if (!product.fit) throw new Error(`Product "${product.id}" has no fit rating`);
  const fit = product.fit;
  if (fit.rubric !== rubric.id) {
    throw new Error(
      `Product "${product.id}" uses rubric "${fit.rubric}", not "${rubric.id}"`,
    );
  }

  const missing = rubric.criteria.filter((c) => !fit.scores[c.id]);
  if (missing.length) {
    throw new Error(
      `Product "${product.id}" is missing scores for: ${missing.map((c) => c.id).join(", ")}`,
    );
  }
  const unknown = Object.keys(fit.scores).filter(
    (id) => !rubric.criteria.some((c) => c.id === id),
  );
  if (unknown.length) {
    throw new Error(
      `Product "${product.id}" scores criteria not in rubric "${rubric.id}": ${unknown.join(", ")}`,
    );
  }

  let weighted = 0;
  let weights = 0;
  let cap = 100;
  const cappedBy: string[] = [];

  const lines = rubric.criteria.map((criterion) => {
    const entry = fit.scores[criterion.id];
    weighted += criterion.weight * entry.score;
    weights += criterion.weight;

    const capped = !!criterion.critical && entry.score < criterion.critical.minimum;
    if (capped) {
      cap = Math.min(cap, criterion.critical!.cap);
      cappedBy.push(criterion.id);
    }

    return {
      id: criterion.id,
      name: criterion.name,
      weight: criterion.weight,
      score: entry.score,
      source: entry.source,
      note: entry.note,
      capped,
    };
  });

  const uncapped = Math.round((10 * weighted) / weights);
  return {
    total: Math.min(uncapped, cap),
    uncapped,
    cappedBy,
    lines,
    rubricVersion: rubric.version,
  };
}
