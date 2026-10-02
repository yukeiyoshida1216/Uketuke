import { describe, expect, it } from "vitest";
import { buildSlackMessage } from "../src/slack.js";

describe("buildSlackMessage", () => {
  it("mentions only the selected destination for general reception", () => {
    const result = buildSlackMessage({
      request: {
        type: "general",
        companyName: "株式会社テスト",
        visitorName: "来訪太郎",
        partySize: 3,
        destinationId: "yamada"
      },
      destination: {
        id: "yamada",
        displayName: "山田 太郎",
        slackUserId: "U011YAMADA"
      },
      interviewMentionUserIds: ["U012INTERVIEW"],
      deliveryMentionUserIds: ["U012DELIVERY"]
    });

    expect(result.mentionedUserIds).toEqual(["U011YAMADA"]);
    expect(result.text).toContain("<@U011YAMADA>");
    expect(result.text).not.toContain("U012INTERVIEW");
    expect(result.text).not.toContain("U012DELIVERY");
    expect(result.text).toContain("株式会社テスト");
    expect(result.text).toContain("来訪太郎");
    expect(result.text).toContain("3名");
  });

  it("uses configured mentions and purpose labels for interview and delivery", () => {
    const interview = buildSlackMessage({
      request: { type: "interview", purpose: "interview", visitorName: "候補者" },
      interviewMentionUserIds: ["U012INTERVIEW", "U012SUB"],
      deliveryMentionUserIds: ["U012DELIVERY"]
    });
    expect(interview.mentionedUserIds).toEqual(["U012INTERVIEW", "U012SUB"]);
    expect(interview.text).toContain("【面接】");
    expect(interview.text).toContain("用件：面接");
    expect(interview.text).toContain("候補者");
    expect(interview.text).not.toContain("U012DELIVERY");

    const training = buildSlackMessage({
      request: { type: "interview", purpose: "training", visitorName: "受講者" },
      interviewMentionUserIds: ["U012INTERVIEW"],
      deliveryMentionUserIds: ["U012DELIVERY"]
    });
    expect(training.text).toContain("【研修】");
    expect(training.text).toContain("用件：研修");
    expect(training.text).toContain("受講者");

    const delivery = buildSlackMessage({
      request: { type: "delivery" },
      interviewMentionUserIds: ["U012INTERVIEW"],
      deliveryMentionUserIds: ["U012DELIVERY"]
    });
    expect(delivery.mentionedUserIds).toEqual(["U012DELIVERY"]);
    expect(delivery.text).toContain("【配達員】");
    expect(delivery.text).not.toContain("U012INTERVIEW");
  });
});
