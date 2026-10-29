// Weekly CPSC recall check for every real product in data/products/*.json.
// Run: node scripts/check-recalls.mjs          (all non-example products)
//      node scripts/check-recalls.mjs --smoke  (checks the CPSC API answers)
//
// Queries the public CPSC Recalls API (no key) by manufacturer, importer and
// title for each brand over the last 5 years: many brands appear only as
// importer, with Manufacturers empty. Flags recalls whose title, description or
// product names/models mention the product's model or name.
// Exits 2 when something needs a person: CPSC has no "active" flag, so a match
// means "read the recall notice", then set trust.inputs.activeRecall or
// s1NoBrandRecalls5y by hand. Writes recalls-report.json for the CI artifact.
// The EU Safety Gate and the UK government's product safety recalls list have no
// equivalent API here, so products sold in the UK or EU are listed as needing
// a manual check there; that alone doesn't fail the run.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const API = "https://www.saferproducts.gov/RestWebServices/Recall";
const ROOT = process.cwd();

const fiveYearsAgo = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 5);
  return d.toISOString().slice(0, 10);
};

async function query(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", RecallDateStart: fiveYearsAgo(), ...params })}`;
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (res.ok) return res.json();
    if (attempt === 3) throw new Error(`CPSC API ${res.status} for ${url}`);
    await new Promise((r) => setTimeout(r, 2000 * attempt));
  }
}

const norm = (s) => (s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function matchRecall(recall, product) {
  const haystack = norm(
    [
      recall.Title,
      recall.Description,
      ...(recall.Products ?? []).flatMap((p) => [p.Name, p.Model, p.Description]),
    ].join(" "),
  );
  const model = norm(product.model);
  const name = norm(product.name.replace(new RegExp(escapeRegExp(product.brand), "i"), ""));
  return {
    model: model.length >= 3 && ` ${haystack} `.includes(` ${model} `),
    name: name.length >= 6 && haystack.includes(name),
  };
}

export async function checkProduct(product, q = query) {
  const results = await Promise.all([
    q({ Manufacturer: product.brand }),
    q({ Importer: product.brand }),
    q({ RecallTitle: product.brand }),
  ]);
  const recalls = new Map();
  for (const r of results.flat()) recalls.set(r.RecallID, r);
  return [...recalls.values()].map((r) => ({
    recallId: r.RecallID,
    date: String(r.RecallDate).slice(0, 10),
    title: r.Title,
    url: r.URL,
    ...matchRecall(r, product),
  }));
}

async function smoke() {
  // BISSELL had several recalls in 2023–2026 and is listed as importer, so a
  // working API returns at least one.
  const recalls = await checkProduct({ name: "Smoke test", brand: "BISSELL", model: "" });
  console.log(`CPSC API OK: ${recalls.length} BISSELL recall(s) since ${fiveYearsAgo()}`);
  for (const r of recalls) console.log(`  ${r.date} ${r.title}`);
  if (recalls.length === 0) throw new Error("CPSC API returned no BISSELL recalls; check the query");
}

const MANUAL_CHECKS = {
  uk: "UK Product Safety Alerts, Reports and Recalls (gov.uk/product-safety-alerts-reports-recalls)",
  eu: "EU Safety Gate (ec.europa.eu/safety-gate-alerts)",
};

export function manualChecks(product, merchantMarkets) {
  const markets = new Set(product.offers.map((o) => merchantMarkets.get(o.merchant)));
  return Object.entries(MANUAL_CHECKS)
    .filter(([market]) => markets.has(market))
    .map(([, check]) => check);
}

async function main() {
  const merchantDir = join(ROOT, "data/merchants");
  const merchantMarkets = new Map();
  for (const f of (await readdir(merchantDir)).filter((f) => f.endsWith(".json"))) {
    const m = JSON.parse(await readFile(join(merchantDir, f), "utf8"));
    merchantMarkets.set(m.id, m.market);
  }
  const dir = join(ROOT, "data/products");
  const products = [];
  for (const f of (await readdir(dir)).filter((f) => f.endsWith(".json")).sort()) {
    const p = JSON.parse(await readFile(join(dir, f), "utf8"));
    if (!p.example) products.push(p);
  }

  const report = { checked: new Date().toISOString(), since: fiveYearsAgo(), products: [] };
  let needsReview = 0;
  for (const p of products) {
    const recalls = await checkProduct(p);
    const flagged = recalls.filter((r) => r.model || r.name);
    const s1Conflict = recalls.length > 0 && p.trust.inputs.s1NoBrandRecalls5y === "Y";
    const missedRecall = flagged.length > 0 && p.trust.inputs.activeRecall === "N";
    if (missedRecall || s1Conflict) needsReview++;
    const manual = manualChecks(p, merchantMarkets);
    report.products.push({ id: p.id, brand: p.brand, brandRecalls5y: recalls.length, flagged, s1Conflict, manualChecks: manual });
    console.log(
      `${p.id}: ${recalls.length} brand recall(s)` +
        (flagged.length ? `, ${flagged.length} mention this product` : "") +
        (missedRecall ? ": REVIEW activeRecall" : "") +
        (s1Conflict ? ": REVIEW s1NoBrandRecalls5y" : ""),
    );
    for (const check of manual) console.log(`  also check by hand: ${check}`);
  }
  console.log(`Checked ${products.length} product(s).`);

  await writeFile(join(ROOT, "recalls-report.json"), JSON.stringify(report, null, 2) + "\n");
  if (needsReview) {
    console.error(`${needsReview} product(s) need review. See recalls-report.json.`);
    process.exit(2);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await (process.argv.includes("--smoke") ? smoke() : main());
}
