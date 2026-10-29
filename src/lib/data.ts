import fs from "node:fs";
import path from "node:path";
import type { ComponentType } from "react";
import type { z } from "zod";
import {
  GuideMetaSchema,
  MerchantSchema,
  ProductSchema,
  RubricSchema,
  type GuideMeta,
  type Market,
  type Merchant,
  type Product,
  type Rubric,
  type SubcategoryId,
} from "./schemas";
import { computeTrustScore, type TrustScore } from "./trust-score";
import { computeFitScore, type FitScore } from "./fit-score";
import { resolveOffers, type ResolvedOffer } from "./affiliate";

// All data lives in the repo and is read once per build. Nothing here runs in
// the browser.

const root = process.cwd();

function readDir<S extends z.ZodType>(dir: string, schema: S): z.infer<S>[] {
  const full = path.join(root, dir);
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((file) => {
      const raw = JSON.parse(fs.readFileSync(path.join(full, file), "utf8"));
      const parsed = schema.safeParse(raw);
      if (!parsed.success) {
        throw new Error(`${dir}/${file} is invalid:\n${parsed.error.message}`);
      }
      const id = (parsed.data as { id?: string }).id;
      if (id && `${id}.json` !== file) {
        throw new Error(`${dir}/${file}: id "${id}" must match the file name`);
      }
      return parsed.data;
    });
}

let cache:
  | {
      rubrics: Map<string, Rubric>;
      merchants: Map<string, Merchant>;
      products: Map<string, Product>;
    }
  | undefined;

function load() {
  if (!cache) {
    const rubrics = new Map(readDir("data/rubrics", RubricSchema).map((r) => [r.id, r]));
    const merchants = new Map(
      readDir("data/merchants", MerchantSchema).map((m) => [m.id, m]),
    );
    const products = new Map(
      readDir("data/products", ProductSchema).map((p) => [p.id, p]),
    );
    // Fail the build early on any broken reference.
    for (const p of products.values()) {
      if (p.fit) {
        const rubric = rubrics.get(p.fit.rubric);
        if (!rubric) throw new Error(`Product "${p.id}" uses unknown rubric "${p.fit.rubric}"`);
        computeFitScore(p, rubric);
      }
      const offerMarkets = new Set(resolveOffers(p, merchants).map((o) => o.market));
      const priced = new Set(p.priceBands.map((b) => b.market));
      for (const m of offerMarkets) {
        if (!priced.has(m)) throw new Error(`Product "${p.id}" has a ${m} offer but no ${m} priceBand`);
      }
      for (const eq of p.equivalents) {
        if (eq.product === p.id || !products.has(eq.product)) {
          throw new Error(`Product "${p.id}" lists an unknown equivalent "${eq.product}"`);
        }
      }
      for (const img of p.images) {
        if (!fs.existsSync(path.join(root, "public", img.src))) {
          throw new Error(`Product "${p.id}" lists a missing image: public${img.src}`);
        }
      }
    }
    cache = { rubrics, merchants, products };
  }
  return cache;
}

export type ProductView = Omit<Product, "offers"> & {
  // Markets the product is sold in, in the order its offers list them.
  markets: Market[];
  trustScore: TrustScore;
  fitScore?: FitScore;
  offers: ResolvedOffer[];
  rubricName?: string;
};

function view(p: Product): ProductView {
  const { rubrics, merchants } = load();
  const rubric = p.fit ? rubrics.get(p.fit.rubric)! : undefined;
  const offers = resolveOffers(p, merchants);
  return {
    ...p,
    trustScore: computeTrustScore(p.trust.inputs, p.evidence === "hands-on-tested"),
    fitScore: rubric ? computeFitScore(p, rubric) : undefined,
    rubricName: rubric?.name,
    offers,
    markets: [...new Set(offers.map((o) => o.market))],
  };
}

export const getRubrics = () => [...load().rubrics.values()];
export const getMerchants = () => [...load().merchants.values()];
export const getProducts = () => [...load().products.values()].map(view);

export function getProduct(id: string): ProductView {
  const p = load().products.get(id);
  if (!p) throw new Error(`Unknown product "${id}"`);
  return view(p);
}

export const productsIn = (sub: SubcategoryId) =>
  getProducts().filter((p) => p.subcategories[0] === sub);

// Guides are MDX files under content/<subcategory>/guides/, each exporting a
// `meta` object validated by GuideMetaSchema.

export type Guide = {
  slug: string;
  meta: GuideMeta;
  Body: ComponentType;
};

export function guideSlugs(sub: SubcategoryId): string[] {
  const dir = path.join(root, "content", sub, "guides");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""))
    .sort();
}

export async function getGuide(sub: SubcategoryId, slug: string): Promise<Guide> {
  const mod = await import(`@content/${sub}/guides/${slug}.mdx`);
  const parsed = GuideMetaSchema.safeParse(mod.meta);
  if (!parsed.success) {
    throw new Error(`content/${sub}/guides/${slug}.mdx meta is invalid:\n${parsed.error.message}`);
  }
  if (parsed.data.subcategory !== sub) {
    throw new Error(`${slug}.mdx says subcategory "${parsed.data.subcategory}" but lives in "${sub}"`);
  }
  for (const pick of parsed.data.picks) getProduct(pick.product);
  return { slug, meta: parsed.data, Body: mod.default };
}

export const getGuides = (sub: SubcategoryId) =>
  Promise.all(guideSlugs(sub).map((slug) => getGuide(sub, slug)));
