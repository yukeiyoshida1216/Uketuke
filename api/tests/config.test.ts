import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";

describe("loadConfig", () => {
  it("allows an empty webhook in dry run", () => {
    const config = loadConfig({
      DRY_RUN: "true",
      DESTINATIONS_PATH: "./destinations.json"
    });
    expect(config.dryRun).toBe(true);
    expect(config.slackWebhookUrl).toBe("");
  });

  it("requires a webhook when not in dry run", () => {
    expect(() =>
      loadConfig({
        DRY_RUN: "false",
        SLACK_WEBHOOK_URL: ""
      })
    ).toThrow(/SLACK_WEBHOOK_URL/);
  });
});
