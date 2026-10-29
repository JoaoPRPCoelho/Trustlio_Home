import { z } from "zod";

// Every data file is validated against these schemas at build time, so a
// missing field or a score without a source fails the build instead of
// shipping a broken page.

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export const subcategoryIds = ["small-space", "home-office"] as const;
export const SubcategoryId = z.enum(subcategoryIds);
export type SubcategoryId = z.infer<typeof SubcategoryId>;

// Fit rubrics: per-category criteria for the separate "small-space fit" rating.
// The trust score does not use them (see TrustSchema below).
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

// Trust score v1.0 inputs: one answer per rubric check, the same for every
// category. Field names match the published methodology and the scoring sheet.
const YN = z.enum(["Y", "N"]);
const YPN = z.enum(["Y", "Partial", "N"]);
const count = z.number().int().nonnegative();

export const TrustInputsSchema = z.object({
  activeRecall: YN,
  e1IndependentSources: count,
  e2Consensus: YPN,
  e3NoRecurringFailure: YN,
  s1NoBrandRecalls5y: YN,
  s2CertificationApplies: YN,
  s2CertificationVerified: YN,
  s3MaterialsWarnings: YN,
  p1SpecsPublished: YPN,
  p2MeasurableClaims: YPN,
  p3ClaimsConfirmed: YN,
  b1SiteContactAddress: YN,
  b2UsptoTrademark: YN,
  b3YearsOnMarket: z.number().nonnegative(),
  w1WarrantyYears: z.number().nonnegative(),
  w2WarrantyTermsClear: YN,
  w3PartsOrSupport: YN,
});
export type TrustInputs = z.infer<typeof TrustInputsSchema>;

export const TrustSourceSchema = z.object({
  // The rubric check it supports, e.g. "E1", "S2", "W1".
  item: z.string().regex(/^[ESPBW][1-3]$/, "Use a rubric item like E1 or W2"),
  title: z.string(),
  // Amazon reviews and ratings may not be displayed or used (Associates
  // Program Policies), so Amazon pages never count as evidence.
  url: z.url().refine((u) => !/(^|\.)(amazon\.|amzn\.)/.test(new URL(u).hostname), "Amazon is not a score source"),
  type: z.enum(["editorial", "reddit", "youtube", "forum", "manufacturer", "government", "certification"]),
  // True when the source shows first-hand use of the product.
  realUse: z.boolean(),
  note: z.string(),
  accessed: isoDate,
});
export type TrustSource = z.infer<typeof TrustSourceSchema>;

export const TrustSchema = z
  .object({
    reviewed: isoDate,
    // 2–3 factual sentences shown as "Why this score".
    summary: z.string().max(600),
    inputs: TrustInputsSchema,
    sources: z.array(TrustSourceSchema),
  })
  .refine(
    (t) =>
      new Set(t.sources.filter((s) => s.item === "E1" && s.realUse).map((s) => s.url)).size ===
      t.inputs.e1IndependentSources,
    "e1IndependentSources must equal the number of E1 sources with realUse",
  )
  .refine(
    (t) => !(t.inputs.s2CertificationApplies === "N" && t.inputs.s2CertificationVerified === "Y"),
    "A certification can't be verified when none applies",
  );
export type Trust = z.infer<typeof TrustSchema>;

export const OfferSchema = z
  .object({
    merchant: z.string(),
    asin: z.string().regex(/^[A-Z0-9]{10}$/).optional(),
    url: z.url().optional(),
  })
  .refine((o) => o.asin || o.url, "An offer needs an asin or a url");

const notAmazon = (u: string) => !/(^|\.)(amazon\.|amzn\.|media-amazon\.)/.test(new URL(u).hostname);

// Product images are self-hosted under public/images/ and each one carries the
// license it was published under. Amazon images may only come from its API, so
// they never enter this list, and nothing is hotlinked.
export const ImageLicense = z.enum([
  // Photographed by us.
  "own",
  // Written permission from the brand, for this site. `source` points to it.
  "brand-permission",
  // A press kit or content feed (e.g. Open Icecat) whose terms cover this use.
  "press-kit",
  "cc0",
  "cc-by",
  "cc-by-sa",
]);
export type ImageLicense = z.infer<typeof ImageLicense>;

export const ProductImageSchema = z.object({
  src: z.string().regex(/^\/images\/products\/[a-z0-9-]+\/[a-z0-9-]+\.(webp|jpg|png)$/, "Self-host under /images/products/<product>/"),
  alt: z.string().min(3),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  license: ImageLicense,
  // Shown under the image, e.g. "Photo: Roborock" or "Photo: Trustlio Home".
  credit: z.string().min(2),
  // Where the license or permission is recorded: a URL, or a citation such as
  // "Email from Roborock PR, 2026-11-03". Not needed for our own photos.
  source: z.string().min(3).optional(),
  // True when the image was generated or materially altered with AI.
  aiGenerated: z.boolean().default(false),
  obtained: isoDate,
}).refine((i) => i.license === "own" || i.source, "Only our own photos may skip `source`")
  .refine((i) => !i.source?.startsWith("http") || notAmazon(i.source), "Amazon images only come from its API");
export type ProductImage = z.infer<typeof ProductImageSchema>;

// Videos are YouTube embeds through the official player. `kind` decides the
// caption, so a third-party review never looks like ours and an AI video never
// looks like real footage.
export const ProductVideoSchema = z
  .object({
    youtubeId: z.string().regex(/^[A-Za-z0-9_-]{11}$/, "An 11-character YouTube video id"),
    title: z.string(),
    channel: z.string(),
    kind: z.enum(["independent-review", "manufacturer", "own", "ai-generated"]),
    // AI videos only: what was generated, shown next to the video. Never use AI
    // to show the product cleaning, working or being used.
    aiDisclosure: z.string().min(10).optional(),
    // When we last checked the video is up and embeddable.
    accessed: isoDate,
  })
  .refine((v) => v.kind !== "ai-generated" || v.aiDisclosure, "AI videos need an aiDisclosure")
  .refine((v) => v.kind === "ai-generated" || !v.aiDisclosure, "aiDisclosure is only for AI videos");
export type ProductVideo = z.infer<typeof ProductVideoSchema>;

export const ProductSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  brand: z.string(),
  model: z.string(),
  gtin: z.string().optional(),
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
  trust: TrustSchema,
  // Optional small-space fit rating against the category's fit rubric.
  fit: z
    .object({
      rubric: z.string(),
      scores: z.record(z.string(), CriterionScoreSchema),
    })
    .optional(),
  offers: z.array(OfferSchema).min(1),
  // The first image is the main one, shown on cards.
  images: z.array(ProductImageSchema).default([]),
  videos: z.array(ProductVideoSchema).default([]),
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
