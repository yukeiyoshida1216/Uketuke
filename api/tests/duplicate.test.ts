import { describe, expect, it } from "vitest";
import { DuplicateWindow } from "../src/duplicate.js";

const general = {
  type: "general" as const,
  companyName: "A社",
  visitorName: "太郎",
  partySize: 1,
  destinationId: "yamada"
};

describe("DuplicateWindow", () => {
  it("blocks the same payload only after a recent success", () => {
    let now = 1_000;
    const window = new DuplicateWindow(10_000, () => now);

    expect(window.isDuplicate(general)).toBe(false);
    window.rememberSuccess(general);
    expect(window.isDuplicate(general)).toBe(true);

    now = 11_001;
    expect(window.isDuplicate(general)).toBe(false);
  });

  it("does not treat a failed attempt as sent", () => {
    const window = new DuplicateWindow(10_000, () => 1_000);
    expect(window.isDuplicate({ type: "delivery" })).toBe(false);
  });
});
