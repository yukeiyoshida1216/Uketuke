import type { Destination, NotifyRequest } from "./types.js";

function mentionLine(userIds: string[]): string {
  if (userIds.length === 0) {
    return "";
  }
  return userIds.map((id) => `<@${id}>`).join(" ");
}

export function buildSlackMessage(input: {
  request: NotifyRequest;
  destination?: Destination;
  interviewMentionUserIds: string[];
  deliveryMentionUserIds: string[];
}): { text: string; mentionedUserIds: string[] } {
  const { request } = input;

  if (request.type === "general") {
    if (!input.destination) {
      throw new Error("destination is required for general reception");
    }
    const mentionedUserIds = [input.destination.slackUserId];
    const text = [
      "【総合受付】来客がありました",
      mentionLine(mentionedUserIds),
      `会社：${request.companyName}`,
      `お名前：${request.visitorName}`,
      `人数：${request.partySize}名`,
      `訪問先：${input.destination.displayName}`
    ].join("\n");
    return { text, mentionedUserIds };
  }

  if (request.type === "interview") {
    const mentionedUserIds = input.interviewMentionUserIds;
    const purposeLabel = request.purpose === "training" ? "研修" : "面接";
    const text = [
      `【${purposeLabel}】来訪がありました`,
      mentionLine(mentionedUserIds),
      `用件：${purposeLabel}`,
      `お名前：${request.visitorName}`
    ]
      .filter((line) => line.length > 0)
      .join("\n");
    return { text, mentionedUserIds };
  }

  const mentionedUserIds = input.deliveryMentionUserIds;
  const text = ["【配達員】来訪がありました", mentionLine(mentionedUserIds)]
    .filter((line) => line.length > 0)
    .join("\n");
  return { text, mentionedUserIds };
}

export function createWebhookSlackClient(webhookUrl: string) {
  return {
    async send(text: string): Promise<void> {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(`Slack webhook failed: ${response.status} ${detail}`.trim());
      }
    }
  };
}
