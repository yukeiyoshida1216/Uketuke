import { describe, expect, it } from "vitest";
import { parseNotifyRequest } from "../src/validation.js";

const key = "test-key-abcdefgh";

describe("parseNotifyRequest", () => {
  it("accepts a trimmed general request", () => {
    const parsed = parseNotifyRequest({
      type: "general",
      companyName: " 株式会社テスト ",
      visitorName: " 来訪 太郎 ",
      partySize: 2,
      destinationId: " yamada ",
      idempotencyKey: `  ${key}  `
    });
    expect(parsed).toEqual({
      type: "general",
      companyName: "株式会社テスト",
      visitorName: "来訪 太郎",
      partySize: 2,
      destinationId: "yamada",
      idempotencyKey: key
    });
  });

  it("rejects missing general fields", () => {
    expect(() =>
      parseNotifyRequest({
        type: "general",
        companyName: " ",
        visitorName: "来訪",
        partySize: 1,
        destinationId: "yamada",
        idempotencyKey: key
      })
    ).toThrow(/required/);
  });

  it("rejects a party size outside 1-99", () => {
    expect(() =>
      parseNotifyRequest({
        type: "general",
        companyName: "A",
        visitorName: "B",
        partySize: 0,
        destinationId: "yamada",
        idempotencyKey: key
      })
    ).toThrow(/partySize/);
    expect(() =>
      parseNotifyRequest({
        type: "general",
        companyName: "A",
        visitorName: "B",
        partySize: 1.5,
        destinationId: "yamada",
        idempotencyKey: key
      })
    ).toThrow(/integer/);
  });

  it("requires purpose and visitor name for interview", () => {
    expect(() =>
      parseNotifyRequest({
        type: "interview",
        purpose: "interview",
        visitorName: "   ",
        idempotencyKey: key
      })
    ).toThrow(/required/);
    expect(() =>
      parseNotifyRequest({ type: "interview", visitorName: "候補者", idempotencyKey: key })
    ).toThrow(/purpose/);
    expect(
      parseNotifyRequest({
        type: "interview",
        purpose: "training",
        visitorName: " 候補者 ",
        idempotencyKey: key
      })
    ).toEqual({
      type: "interview",
      purpose: "training",
      visitorName: "候補者",
      idempotencyKey: key
    });
  });

  it("requires idempotencyKey for delivery", () => {
    expect(() => parseNotifyRequest({ type: "delivery" })).toThrow(/Required|idempotencyKey/);
    expect(parseNotifyRequest({ type: "delivery", idempotencyKey: key })).toEqual({
      type: "delivery",
      idempotencyKey: key
    });
  });

  it("accepts other notify with idempotencyKey", () => {
    expect(() => parseNotifyRequest({ type: "other" })).toThrow(/Required|idempotencyKey/);
    expect(parseNotifyRequest({ type: "other", idempotencyKey: key })).toEqual({
      type: "other",
      idempotencyKey: key
    });
  });
});
