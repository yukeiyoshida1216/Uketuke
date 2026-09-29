import { mentionChoices, type MentionChoiceId } from "@/config/reception";
import path from "node:path";

const allowedMentions = new Set<string>(mentionChoices.map((person) => person.id));

export function defaultDestinationsFile(): string {
  return path.join(process.cwd(), "config", "destinations.json");
}

export function isDryRun(env: NodeJS.ProcessEnv = process.env): boolean {
  return (env.DRY_RUN ?? "true").trim().toLowerCase() !== "false";
}

export function parseSlackUserIds(raw: string | undefined): Record<string, string> {
  if (!raw || !raw.trim()) return {};
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("slack_user_ids_invalid");
  }
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value === "string" && value.trim()) result[key] = value.trim();
  }
  return result;
}

export function parseMentionIds(raw: string | undefined): MentionChoiceId[] {
  const source =
    raw === undefined || raw.trim() === ""
      ? mentionChoices.map((person) => person.id)
      : raw
          .split(",")
          .map((part) => part.trim())
          .filter((part) => part.length > 0);
  const unique: MentionChoiceId[] = [];
  for (const id of source) {
    if (!allowedMentions.has(id)) throw new Error("invalid_mention_id");
    if (!unique.includes(id as MentionChoiceId)) unique.push(id as MentionChoiceId);
  }
  if (unique.length === 0) throw new Error("invalid_mention_id");
  return unique;
}

export function readIntegrationConfig(env: NodeJS.ProcessEnv = process.env) {
  return {
    dryRun: isDryRun(env),
    destinationsFile: env.DESTINATIONS_FILE?.trim() || defaultDestinationsFile(),
    slackUserIds: parseSlackUserIds(env.SLACK_USER_IDS),
    interviewMentionIds: parseMentionIds(env.INTERVIEW_MENTION_IDS),
    deliveryMentionIds: parseMentionIds(env.DELIVERY_MENTION_IDS),
    slackBotToken: env.SLACK_BOT_TOKEN?.trim() ?? "",
    slackChannelId: env.SLACK_CHANNEL_ID?.trim() ?? "",
  };
}
