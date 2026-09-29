import { limits } from "@/config/reception";
import { normalizeCountInput, normalizeText, parseReceptionBody, parseVisitorCount } from "@/lib/reception";
import { describe, expect, it } from "vitest";

describe("受付入力の検証", () => {
  it("前後の空白を除き、空欄は拒否する", () => {
    expect(normalizeText("  山田 花  ", 80)).toBe("山田 花");
    expect(normalizeText("   ", 80)).toBeNull();
    expect(normalizeText(12, 80)).toBeNull();
  });

  it("人数は範囲内の整数だけ受け付ける", () => {
    expect(parseVisitorCount(1)).toBe(1);
    expect(parseVisitorCount(limits.maxVisitorCount)).toBe(limits.maxVisitorCount);
    expect(parseVisitorCount(0)).toBeNull();
    expect(parseVisitorCount(-1)).toBeNull();
    expect(parseVisitorCount(1.5)).toBeNull();
    expect(parseVisitorCount(limits.maxVisitorCount + 1)).toBeNull();
    expect(parseVisitorCount("2")).toBeNull();
  });

  it("全角数字を人数の数字入力にそろえる", () => {
    expect(normalizeCountInput("２名")).toBe("2");
  });

  it("クライアントが本文やメンションを足しても受付項目だけを読む", () => {
    const parsed = parseReceptionBody({
      idempotencyKey: "key-general-1",
      type: "general",
      companyName: " 株式会社あおぞら ",
      visitorName: " 山田 花 ",
      visitorCount: 2,
      destinationId: "ito",
      text: "CLIENT_CONTROLLED_TEXT",
      mentions: ["UHACKER"],
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.payload).toEqual({
      type: "general",
      companyName: "株式会社あおぞら",
      visitorName: "山田 花",
      visitorCount: 2,
      destinationId: "ito",
    });
    expect(JSON.stringify(parsed.payload)).not.toContain("CLIENT_CONTROLLED_TEXT");
    expect(JSON.stringify(parsed.payload)).not.toContain("UHACKER");
  });
});
