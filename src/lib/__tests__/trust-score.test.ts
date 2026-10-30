import { describe, expect, it } from "vitest";
import { computeTrustScore } from "../trust-score";
import { TrustSchema, TrustSourceSchema } from "../schemas";
import { trustInputs } from "./fixtures";

const points = (inputs: Parameters<typeof computeTrustScore>[0]) =>
  Object.fromEntries(computeTrustScore(inputs, false).pillars.map((p) => [p.key, p.points]));

describe("computeTrustScore", () => {
  it("sums the five pillars", () => {
    const trust = computeTrustScore(trustInputs, false);
    expect(points(trustInputs)).toEqual({ evidence: 20, safety: 20, specs: 17, brand: 12, warranty: 9 });
    expect(trust).toMatchObject({ status: "scored", total: 78, band: "Good", confidence: "Medium" });
  });

  it("scales S1 + S3 to 20 when no certification applies", () => {
    expect(points({ ...trustInputs, s1NoBrandRecalls5y: "N" }).safety).toBe(6.7);
    expect(points({ ...trustInputs, s2CertificationApplies: "Y" }).safety).toBe(12);
    expect(
      points({ ...trustInputs, s2CertificationApplies: "Y", s2CertificationVerified: "Y" }).safety,
    ).toBe(20);
  });

  it("matches the BISSELL Little Green pilot (70/100)", () => {
    const trust = computeTrustScore(
      {
        ...trustInputs,
        e3NoRecurringFailure: "Y",
        s1NoBrandRecalls5y: "N",
        s2CertificationApplies: "Y",
        s3MaterialsWarnings: "N",
        p1SpecsPublished: "Partial",
        b3YearsOnMarket: 4,
        w3PartsOrSupport: "Y",
      },
      false,
    );
    expect(trust.total).toBe(70);
  });

  it("publishes no score under an active recall", () => {
    const trust = computeTrustScore({ ...trustInputs, activeRecall: "Y" }, true);
    expect(trust).toMatchObject({ status: "active-recall", total: null, band: null, confidence: null });
  });

  it("publishes no score with fewer than two independent sources", () => {
    expect(computeTrustScore({ ...trustInputs, e1IndependentSources: 1 }, false).status).toBe(
      "not-enough-evidence",
    );
    expect(computeTrustScore({ ...trustInputs, e1IndependentSources: 2 }, false)).toMatchObject({
      status: "scored",
      confidence: "Low",
    });
  });

  it("rates confidence High with 5+ sources or hands-on testing", () => {
    expect(computeTrustScore({ ...trustInputs, e1IndependentSources: 5 }, false).confidence).toBe("High");
    expect(computeTrustScore(trustInputs, true).confidence).toBe("High");
  });

  it("uses the band edges from the methodology", () => {
    const band = (w1WarrantyYears: number, w2: "Y" | "N", w3: "Y" | "N") =>
      computeTrustScore({ ...trustInputs, w1WarrantyYears, w2WarrantyTermsClear: w2, w3PartsOrSupport: w3 }, false);
    expect(band(0, "N", "N")).toMatchObject({ total: 69, band: "Fair" });
    expect(band(1, "N", "N")).toMatchObject({ total: 74, band: "Good" });
  });
});

const source = {
  item: "E1",
  title: "Review",
  url: "https://example.com/review",
  type: "editorial",
  realUse: true,
  note: "Used for a month",
  accessed: "2026-10-26",
};

describe("TrustSchema", () => {
  it("rejects Amazon pages as sources", () => {
    expect(TrustSourceSchema.safeParse({ ...source, url: "https://www.amazon.com/dp/B000" }).success).toBe(false);
    expect(TrustSourceSchema.safeParse({ ...source, url: "https://amzn.to/abc" }).success).toBe(false);
    expect(TrustSourceSchema.safeParse(source).success).toBe(true);
  });

  it("keeps quotes from sources short", () => {
    expect(TrustSourceSchema.safeParse({ ...source, quote: "Quiet enough for a bedroom." }).success).toBe(true);
    expect(TrustSourceSchema.safeParse({ ...source, quote: "word ".repeat(31) }).success).toBe(false);
  });

  it("requires e1IndependentSources to match the listed real-use sources", () => {
    const sources = [1, 2, 3].map((n) => ({ ...source, url: `https://example.com/${n}` }));
    const trust = { reviewed: "2026-10-26", summary: "", inputs: trustInputs, sources };
    expect(TrustSchema.safeParse(trust).success).toBe(true);
    expect(TrustSchema.safeParse({ ...trust, sources: sources.slice(0, 2) }).success).toBe(false);
  });
});
