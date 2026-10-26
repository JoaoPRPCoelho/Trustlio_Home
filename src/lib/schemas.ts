import { z } from "zod";

// Every data file is validated against these schemas at build time, so a
// missing field or a score without a source fails the build instead of
// shipping a broken page.

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export const subcategoryIds = ["small-space", "home-office"] as const;
export const SubcategoryId = z.enum(subcategoryIds);
export type SubcategoryId = z.infer<typeof SubcategoryId>;

export const CriterionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  weight: z.number().positive(),
  // A critical criterion caps the whole score when it falls below `minimum`,
  // e.g. a space heater without a safety listing can't score above 50.
  critical: z
    .object({
      minimum: z.number().min(0).max(10),
      cap: z.number().min(0).max(100),
    })
    .optional(),
});
export type Criterion = z.infer<typeof CriterionSchema>;

export const RubricSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  updated: isoDate,
  criteria: z.array(CriterionSchema).min(1),
});
export type Rubric = z.infer<typeof RubricSchema>;

export const MerchantSchema = z.object({
  id: z.string(),
  name: z.string(),
  program: z.enum(["amazon", "direct", "network"]),
  // Amazon only: the Associates tracking tag appended to product links.
  trackingTag: z.string().optional(),
  // Amazon forbids showing prices that don't come from its API, so this stays
  // false for Amazon until the Creators API is wired in.
  showPrices: z.boolean(),
  buttonLabel: z.string(),
});
export type Merchant = z.infer<typeof MerchantSchema>;

export const EvidenceLevel = z.enum([
  "hands-on-tested",
  "owner-verified",
  "research-based",
]);
export type EvidenceLevel = z.infer<typeof EvidenceLevel>;

export const CriterionScoreSchema = z.object({
  score: z.number().min(0).max(10),
  // Where the score comes from: a URL or a short citation. Required, because
  // an unsourced score is an opinion we can't defend.
  source: z.string().min(3),
  note: z.string().optional(),
});

export const OfferSchema = z
  .object({
    merchant: z.string(),
    asin: z.string().regex(/^[A-Z0-9]{10}$/).optional(),
    url: z.url().optional(),
  })
  .refine((o) => o.asin || o.url, "An offer needs an asin or a url");

export const ProductSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  brand: z.string(),
  model: z.string(),
  gtin: z.string().optional(),
  rubric: z.string(),
  subcategories: z.array(SubcategoryId).min(1),
  priceBand: z.object({
    min: z.number().nonnegative(),
    max: z.number().nonnegative(),
    currency: z.literal("USD"),
  }),
  summary: z.string(),
  idealFor: z.array(z.string()),
  pros: z.array(z.string()).min(1),
  cons: z.array(z.string()).min(1),
  specs: z.record(z.string(), z.union([z.string(), z.number()])),
  evidence: EvidenceLevel,
  scores: z.record(z.string(), CriterionScoreSchema),
  offers: z.array(OfferSchema).min(1),
  lastVerified: isoDate,
  // Placeholder data used to develop the templates. Example pages are
  // noindexed, bannered and left out of the sitemap.
  example: z.boolean().default(false),
});
export type Product = z.infer<typeof ProductSchema>;

export const GuideMetaSchema = z.object({
  title: z.string(),
  description: z.string(),
  subcategory: SubcategoryId,
  author: z.string(),
  published: isoDate,
  updated: isoDate,
  picks: z
    .array(z.object({ product: z.string(), award: z.string() }))
    .min(1),
  example: z.boolean().default(false),
});
export type GuideMeta = z.infer<typeof GuideMetaSchema>;
