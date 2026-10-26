import type { Product, Rubric } from "./schemas";

export type ScoreLine = {
  id: string;
  name: string;
  weight: number;
  score: number;
  source: string;
  note?: string;
  capped: boolean;
};

export type TrustScore = {
  total: number;
  uncapped: number;
  cappedBy: string[];
  lines: ScoreLine[];
  rubricVersion: string;
};

// Trust score = 10 × Σ(wᵢ·sᵢ) / Σwᵢ, rounded, then limited by any critical
// criterion that falls below its minimum. Commission never enters the formula.
export function computeTrustScore(product: Product, rubric: Rubric): TrustScore {
  if (product.rubric !== rubric.id) {
    throw new Error(
      `Product "${product.id}" uses rubric "${product.rubric}", not "${rubric.id}"`,
    );
  }

  const missing = rubric.criteria.filter((c) => !product.scores[c.id]);
  if (missing.length) {
    throw new Error(
      `Product "${product.id}" is missing scores for: ${missing.map((c) => c.id).join(", ")}`,
    );
  }
  const unknown = Object.keys(product.scores).filter(
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
    const entry = product.scores[criterion.id];
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
