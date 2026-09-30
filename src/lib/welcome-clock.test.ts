import { formatWelcomeClock } from "@/lib/welcome-clock";
import { describe, expect, it } from "vitest";

describe("タイトル画面の時計", () => {
  it("日本時間を 09/30 12:00 の形にする", () => {
    expect(formatWelcomeClock(new Date("2026-09-30T03:00:00Z"))).toBe("09/30 12:00");
    expect(formatWelcomeClock(new Date("2026-01-04T23:05:00Z"))).toBe("01/05 08:05");
    expect(formatWelcomeClock(new Date("2026-09-29T15:00:00Z"))).toBe("09/30 00:00");
  });
});
