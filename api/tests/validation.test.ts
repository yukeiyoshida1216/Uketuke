import { describe, expect, it } from "vitest";
import { parseNotifyRequest } from "../src/validation.js";

describe("parseNotifyRequest", () => {
  it("accepts a trimmed general request", () => {
    const parsed = parseNotifyRequest({
      type: "general",
      companyName: " 株式会社テスト ",
      visitorName: " 来訪 太郎 ",
      partySize: 2,
      destinationId: " yamada "
    });
    expect(parsed).toEqual({
      type: "general",
      companyName: "株式会社テスト",
      visitorName: "来訪 太郎",
      partySize: 2,
      destinationId: "yamada"
    });
  });

  it("rejects missing general fields", () => {
    expect(() =>
      parseNotifyRequest({
        type: "general",
        companyName: " ",
        visitorName: "来訪",
        partySize: 1,
        destinationId: "yamada"
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
        destinationId: "yamada"
      })
    ).toThrow(/partySize/);
    expect(() =>
      parseNotifyRequest({
        type: "general",
        companyName: "A",
        visitorName: "B",
        partySize: 1.5,
        destinationId: "yamada"
      })
    ).toThrow(/integer/);
  });

  it("requires purpose and visitor name for interview", () => {
    expect(() =>
      parseNotifyRequest({ type: "interview", purpose: "interview", visitorName: "   " })
    ).toThrow(/required/);
    expect(() =>
      parseNotifyRequest({ type: "interview", visitorName: "候補者" })
    ).toThrow(/purpose/);
    expect(
      parseNotifyRequest({
        type: "interview",
        purpose: "training",
        visitorName: " 候補者 "
      })
    ).toEqual({
      type: "interview",
      purpose: "training",
      visitorName: "候補者"
    });
  });

  it("accepts delivery without extra fields", () => {
    expect(parseNotifyRequest({ type: "delivery" })).toEqual({ type: "delivery" });
  });
});
