import { parseMentionIds, parseSlackUserIds } from "@/server/env";
import { describe, expect, it } from "vitest";

describe("メンション設定", () => {
  it("野坂・梁瀬・伊藤の三択だけを受け付ける", () => {
    expect(parseMentionIds(undefined)).toEqual(["nosaka", "yanase", "ito"]);
    expect(parseMentionIds("ito, nosaka")).toEqual(["ito", "nosaka"]);
    expect(() => parseMentionIds("suzuki")).toThrow(/invalid_mention_id/);
    expect(() => parseMentionIds("nosaka,suzuki")).toThrow(/invalid_mention_id/);
  });

  it("Slack User ID の対応が空でも落ちない", () => {
    expect(parseSlackUserIds(undefined)).toEqual({});
    expect(parseSlackUserIds('{"nosaka":" UNOSAKA ","yanase":""}')).toEqual({ nosaka: "UNOSAKA" });
  });
});
