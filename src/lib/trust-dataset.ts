import { getProducts } from "./data";
import { reviewPath } from "./paths";
import { absoluteUrl, site } from "./site";
import { METHODOLOGY_VERSION } from "./trust-score";

// The open dataset behind every published Trust Score, served as
// /trust-score/data.json and data.csv. Example products are left out.
export function trustDataset() {
  const products = getProducts()
    .filter((p) => !p.example)
    .map((p) => ({
      id: p.id,
      product: p.name,
      brand: p.brand,
      model: p.model,
      url: absoluteUrl(reviewPath(p)),
      status: p.trustScore.status,
      score: p.trustScore.total,
      band: p.trustScore.band,
      confidence: p.trustScore.confidence,
      ...Object.fromEntries(p.trustScore.pillars.map((x) => [`pillar_${x.key}`, x.points])),
      evidence: p.evidence,
      sources: p.trust.sources.length,
      reviewed: p.trust.reviewed,
      methodologyVersion: p.trustScore.version,
    }));
  return {
    name: `${site.name} Trust Score dataset`,
    methodology: absoluteUrl("/methodology/trust-score/"),
    methodologyVersion: METHODOLOGY_VERSION,
    license: "CC BY 4.0",
    products,
  };
}

const CSV_COLUMNS = [
  "id", "product", "brand", "model", "url", "status", "score", "band", "confidence",
  "pillar_evidence", "pillar_safety", "pillar_specs", "pillar_brand", "pillar_warranty",
  "evidence", "sources", "reviewed", "methodologyVersion",
];

const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function trustDatasetCsv() {
  const rows = trustDataset().products as Record<string, unknown>[];
  return [CSV_COLUMNS.join(","), ...rows.map((r) => CSV_COLUMNS.map((c) => csvCell(r[c])).join(","))].join("\n") + "\n";
}
