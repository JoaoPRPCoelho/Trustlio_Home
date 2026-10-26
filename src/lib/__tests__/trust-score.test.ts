import { describe, expect, it } from "vitest";
import { computeTrustScore } from "../trust-score";
import type { Product, Rubric } from "../schemas";

const rubric: Rubric = {
  id: "heater",
  name: "Space heaters",
  version: "1",
  updated: "2026-10-26",
  criteria: [
    { id: "fit", name: "Fit", description: "", weight: 30 },
    { id: "heat", name: "Heat", description: "", weight: 50 },
    {
      id: "safety",
      name: "Safety",
      description: "",
      weight: 20,
      critical: { minimum: 5, cap: 50 },
    },
  ],
};

const product = (scores: Record<string, number>): Product => ({
  id: "p",
  name: "P",
  brand: "B",
  model: "M",
  rubric: "heater",
  subcategories: ["small-space"],
  priceBand: { min: 50, max: 60, currency: "USD" },
  summary: "",
  idealFor: [],
  pros: ["a"],
  cons: ["b"],
  specs: {},
  evidence: "research-based",
  scores: Object.fromEntries(
    Object.entries(scores).map(([k, score]) => [k, { score, source: "manual" }]),
  ),
  offers: [{ merchant: "amazon-us", asin: "B000000000" }],
  lastVerified: "2026-10-26",
  example: false,
});

describe("computeTrustScore", () => {
  it("is 10 × the weighted average, rounded", () => {
    // (30·8 + 50·7 + 20·9) / 100 = 7.7 → 77
    expect(computeTrustScore(product({ fit: 8, heat: 7, safety: 9 }), rubric).total).toBe(77);
  });

  it("caps the score when a critical criterion is below its minimum", () => {
    const trust = computeTrustScore(product({ fit: 10, heat: 10, safety: 4 }), rubric);
    expect(trust.uncapped).toBe(88);
    expect(trust.total).toBe(50);
    expect(trust.cappedBy).toEqual(["safety"]);
  });

  it("does not cap at exactly the minimum", () => {
    expect(computeTrustScore(product({ fit: 10, heat: 10, safety: 5 }), rubric).cappedBy).toEqual(
      [],
    );
  });

  it("rejects missing or unknown criteria", () => {
    expect(() => computeTrustScore(product({ fit: 8, heat: 7 }), rubric)).toThrow(/missing/);
    expect(() =>
      computeTrustScore(product({ fit: 8, heat: 7, safety: 9, noise: 5 }), rubric),
    ).toThrow(/not in rubric/);
  });
});
