import type { TrustInputs } from "../schemas";

// The fictional example from the methodology: 78/100, Good, Medium.
export const trustInputs: TrustInputs = {
  activeRecall: "N",
  e1IndependentSources: 3,
  e2Consensus: "Y",
  e3NoRecurringFailure: "N",
  s1NoBrandRecalls5y: "Y",
  s2CertificationApplies: "N",
  s2CertificationVerified: "N",
  s3MaterialsWarnings: "Y",
  p1SpecsPublished: "Y",
  p2MeasurableClaims: "Partial",
  p3ClaimsConfirmed: "Y",
  b1SiteContactAddress: "Y",
  b2TrademarkRegistered: "Y",
  b3YearsOnMarket: 2,
  w1WarrantyYears: 1,
  w2WarrantyTermsClear: "Y",
  w3PartsOrSupport: "N",
};
