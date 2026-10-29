import { describe, expect, it } from "vitest";
import { checkProduct, manualChecks, matchRecall } from "../../../scripts/check-recalls.mjs";

// Shape of a real CPSC record (RecallID 10302), trimmed.
const recall = {
  RecallID: 10302,
  RecallDate: "2025-06-05T00:00:00",
  Title: "Apollo America Recalls Combination Smoke and CO Detectors",
  Description: "This recall involves model 51000-600 detectors.",
  URL: "https://www.cpsc.gov/Recalls/2025/example",
  Products: [{ Name: "Apollo America 51000-600 Combination Smoke and CO Detectors", Model: "", Description: "" }],
};

describe("check-recalls", () => {
  it("flags a recall that names the product's model", () => {
    const product = { name: "Apollo Smoke and CO Detector", brand: "Apollo", model: "51000-600" };
    expect(matchRecall(recall, product).model).toBe(true);
  });

  it("does not flag other products of the brand", () => {
    expect(matchRecall(recall, { name: "Apollo Desk Lamp", brand: "Apollo", model: "DL2" })).toEqual({
      model: false,
      name: false,
    });
  });

  it("merges manufacturer, importer and title results by RecallID", async () => {
    const recalls = await checkProduct({ name: "X", brand: "Apollo", model: "X1" }, async () => [recall]);
    expect(recalls).toHaveLength(1);
    expect(recalls[0]).toMatchObject({ recallId: 10302, date: "2025-06-05" });
  });

  it("asks for a manual check where the product is sold in the UK or EU", () => {
    const merchantMarkets = new Map([["amazon-us", "us"], ["amazon-uk", "uk"]]);
    expect(manualChecks({ offers: [{ merchant: "amazon-us" }] }, merchantMarkets)).toEqual([]);
    expect(manualChecks({ offers: [{ merchant: "amazon-uk" }] }, merchantMarkets)).toHaveLength(1);
  });
});
