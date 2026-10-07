import path from "node:path";
import type { AppConfig } from "./types.js";

function requiredInProd(name: string, value: string | undefined, dryRun: boolean): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed && !dryRun) {
    throw new Error(`${name} is required unless DRY_RUN=true`);
  }
  return trimmed;
}

function parseIdList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value === "") {
    return fallback;
  }
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const dryRun = parseBoolean(env.DRY_RUN, false);
  const destinationsPath = env.DESTINATIONS_PATH?.trim()
    ? path.resolve(env.DESTINATIONS_PATH)
    : path.resolve(process.cwd(), "destinations.json");

  return {
    port: Number.parseInt(env.PORT ?? "3000", 10),
    dryRun,
    slackWebhookUrl: requiredInProd("SLACK_WEBHOOK_URL", env.SLACK_WEBHOOK_URL, dryRun),
    destinationsPath,
    duplicateWindowMs: Number.parseInt(env.DUPLICATE_WINDOW_MS ?? "10000", 10),
    slackTimeoutMs: Number.parseInt(env.SLACK_TIMEOUT_MS ?? "8000", 10),
    idempotencyWindowMs: Number.parseInt(
      env.IDEMPOTENCY_WINDOW_MS ?? env.DUPLICATE_WINDOW_MS ?? "10000",
      10
    ),
    interviewMentionUserIds: parseIdList(env.SLACK_MENTION_INTERVIEW),
    deliveryMentionUserIds: parseIdList(env.SLACK_MENTION_DELIVERY)
  };
}
