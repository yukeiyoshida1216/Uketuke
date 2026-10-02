import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import request from "supertest";
import { createApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import type { AppConfig, SlackClient } from "../src/types.js";

export const sampleDestinations = [
  {
    id: "yamada",
    displayName: "山田 太郎",
    slackUserId: "U011YAMADA"
  },
  {
    id: "sato",
    displayName: "佐藤 花子",
    slackUserId: "U011SATO"
  }
];

export function writeDestinationsFile(
  destinations = sampleDestinations
): string {
  const dir = mkdtempSync(path.join(tmpdir(), "reception-"));
  const filePath = path.join(dir, "destinations.json");
  writeFileSync(filePath, JSON.stringify(destinations), "utf8");
  return filePath;
}

export function testConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    ...loadConfig({
      DRY_RUN: "true",
      DESTINATIONS_PATH: writeDestinationsFile(),
      SLACK_MENTION_INTERVIEW: "U012INTERVIEW",
      SLACK_MENTION_DELIVERY: "U012DELIVERY",
      DUPLICATE_WINDOW_MS: "10000"
    }),
    ...overrides
  };
}

export function testApp(options?: {
  config?: AppConfig;
  slack?: SlackClient;
  clock?: () => number;
}) {
  const sent: string[] = [];
  const slack: SlackClient = options?.slack ?? {
    send: async (text: string) => {
      sent.push(text);
    }
  };
  const app = createApp({
    config: options?.config ?? testConfig(),
    slack,
    clock: options?.clock
  });
  return { app, sent, request: request(app) };
}
