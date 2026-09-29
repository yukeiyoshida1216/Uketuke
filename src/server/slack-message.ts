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
  destinationName?: string;
}): string {
  if (input.mentionSlackIds.length === 0) throw new MentionConfigError();
  const mentionLine = input.mentionSlackIds.map((id) => formatMention(id)).join(" ");
  if (input.kind === "general") {
    return [
      mentionLine,
      copy.slack.generalTitle,
      `${copy.slack.companyLabel}: ${input.companyName}`,
      `${copy.slack.nameLabel}: ${input.visitorName}`,
      `${copy.slack.countLabel}: ${input.visitorCount}${copy.slack.countSuffix}`,
      `${copy.slack.destinationLabel}: ${input.destinationName}`,
    ].join("\n");
  }
  if (input.kind === "interview") {
    return [mentionLine, copy.slack.interviewTitle, `${copy.slack.nameLabel}: ${input.visitorName}`].join(
      "\n",
    );
  }
  return [mentionLine, copy.slack.otherTitle].join("\n");
}
