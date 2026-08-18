import { describe, it, expect, vi, beforeEach } from "vitest";
import { StripeFulfillmentService } from "@aletis/infrastructure";

describe("StripeFulfillmentService (Injeção de VIBEs e Processamento)", () => {
  let fulfillmentService: StripeFulfillmentService;

  beforeEach(() => {
    fulfillmentService = new StripeFulfillmentService("sk_test_placeholder");
  });

  it("deve rejeitar session_id inválido ou nulo", async () => {
    const result1 = await fulfillmentService.fulfillSession("");
    const result2 = await fulfillmentService.fulfillSession("{CHECKOUT_SESSION_ID}");

    expect(result1).toBe(false);
    expect(result2).toBe(false);
  });
});
