import type { TrustInputs } from "./schemas";

// Trust score v1.1: how safe a purchase is, from public, verifiable evidence.
// Five fixed pillars worth 100 points, the same for every category, after two
// gates. It never uses Amazon reviews, ratings or prices, and commission never
// enters it. Mirrors the published methodology and the scoring sheet.

export const METHODOLOGY_VERSION = "1.1";

export type PillarKey = "evidence" | "safety" | "specs" | "brand" | "warranty";

export type Pillar = {
  key: PillarKey;
  name: string;
  points: number;
  max: number;
};

export type TrustStatus = "scored" | "active-recall" | "not-enough-evidence";
export type TrustBand = "Excellent" | "Good" | "Fair" | "Poor";
export type TrustConfidence = "High" | "Medium" | "Low";

export type TrustScore = {
  status: TrustStatus;
  // null when a gate stops the score from being published.
  total: number | null;
  band: TrustBand | null;
  confidence: TrustConfidence | null;
  pillars: Pillar[];
  version: string;
};

const yn = (v: "Y" | "N", points: number) => (v === "Y" ? points : 0);
const ypn = (v: "Y" | "Partial" | "N", full: number, half: number) =>
  v === "Y" ? full : v === "Partial" ? half : 0;
const round1 = (n: number) => Math.round(n * 10) / 10;

export function computeTrustScore(i: TrustInputs, handsOnTested: boolean): TrustScore {
  const evidence =
    (i.e1IndependentSources >= 3 ? 10 : i.e1IndependentSources === 2 ? 5 : 0) +
    ypn(i.e2Consensus, 10, 5) +
    yn(i.e3NoRecurringFailure, 10);

  // When no certification applies to the category, S1 + S3 are scaled to 20.
  const safety =
    i.s2CertificationApplies === "Y"
      ? yn(i.s1NoBrandRecalls5y, 8) + yn(i.s2CertificationVerified, 8) + yn(i.s3MaterialsWarnings, 4)
      : round1(((yn(i.s1NoBrandRecalls5y, 8) + yn(i.s3MaterialsWarnings, 4)) * 20) / 12);

  const specs =
    ypn(i.p1SpecsPublished, 8, 4) + ypn(i.p2MeasurableClaims, 6, 3) + yn(i.p3ClaimsConfirmed, 6);

  const brand =
    yn(i.b1SiteContactAddress, 5) +
    yn(i.b2TrademarkRegistered, 5) +
    (i.b3YearsOnMarket >= 3 ? 5 : i.b3YearsOnMarket >= 1 ? 2 : 0);

  const warranty =
    (i.w1WarrantyYears >= 2 ? 8 : i.w1WarrantyYears >= 1 ? 5 : 0) +
    yn(i.w2WarrantyTermsClear, 4) +
    yn(i.w3PartsOrSupport, 3);

  const pillars: Pillar[] = [
    { key: "evidence", name: "Independent evidence", points: evidence, max: 30 },
    { key: "safety", name: "Safety & compliance", points: safety, max: 20 },
    { key: "specs", name: "Specs & claims transparency", points: specs, max: 20 },
    { key: "brand", name: "Brand accountability", points: brand, max: 15 },
    { key: "warranty", name: "Warranty & support", points: warranty, max: 15 },
  ];

  const gated = (status: TrustStatus): TrustScore => ({
    status,
    total: null,
    band: null,
    confidence: null,
    pillars,
    version: METHODOLOGY_VERSION,
  });
  if (i.activeRecall === "Y") return gated("active-recall");
  if (i.e1IndependentSources < 2) return gated("not-enough-evidence");

  const total = Math.round(pillars.reduce((sum, p) => sum + p.points, 0));
  return {
    status: "scored",
    total,
    band: total >= 85 ? "Excellent" : total >= 70 ? "Good" : total >= 55 ? "Fair" : "Poor",
    confidence:
      handsOnTested || i.e1IndependentSources >= 5
        ? "High"
        : i.e1IndependentSources >= 3
          ? "Medium"
          : "Low",
    pillars,
    version: METHODOLOGY_VERSION,
  };
}

export const trustStatusLabel: Record<Exclude<TrustStatus, "scored">, string> = {
  "active-recall": "Not recommended: active recall",
  "not-enough-evidence": "Not enough evidence yet",
};
