import { copy } from "@/config/reception";

const SLACK_USER_ID = /^[UW][A-Z0-9]{2,32}$/;

export class MentionConfigError extends Error {
  constructor() {
    super("mention_not_configured");
    this.name = "MentionConfigError";
  }
}

export function formatMention(slackUserId: string): string {
  if (!SLACK_USER_ID.test(slackUserId)) throw new MentionConfigError();
  return `<@${slackUserId}>`;
}

export function buildSlackText(input: {
  kind: "general" | "interview" | "other";
  mentionSlackIds: string[];
  companyName?: string;
  visitorName?: string;
  visitorCount?: number;
  visitorCountOrMore?: boolean;
  destinationName?: string;
  purpose?: "interview" | "training";
}): string {
  if (input.mentionSlackIds.length === 0) throw new MentionConfigError();
  const mentionLine = input.mentionSlackIds.map((id) => formatMention(id)).join(" ");
  if (input.kind === "general") {
    const countText = input.visitorCountOrMore ? copy.slack.countOrMoreSuffix : copy.slack.countSuffix;
    return [
      mentionLine,
      copy.slack.generalTitle,
      `${copy.slack.companyLabel}: ${input.companyName}`,
      `${copy.slack.nameLabel}: ${input.visitorName}`,
      `${copy.slack.countLabel}: ${input.visitorCount}${countText}`,
      `${copy.slack.destinationLabel}: ${input.destinationName}`,
    ].join("\n");
  }
  if (input.kind === "interview") {
    const title = input.purpose === "training" ? copy.slack.trainingTitle : copy.slack.interviewTitle;
    return [mentionLine, title, `${copy.slack.nameLabel}: ${input.visitorName}`].join("\n");
  }
  return [mentionLine, copy.slack.otherTitle].join("\n");
}
