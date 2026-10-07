import { describe, expect, it, vi } from "vitest";
import { createWebhookSlackClient } from "../src/slack.js";

describe("createWebhookSlackClient timeout", () => {
  it("aborts when Slack does not respond within timeoutMs", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init?: { signal?: AbortSignal }) => {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const error = new Error("aborted");
            error.name = "AbortError";
            reject(error);
          });
        });
      })
    );

    const client = createWebhookSlackClient("https://hooks.slack.example/test", 50);
    await expect(client.send("hello")).rejects.toThrow(/timed out after 50ms/);
    vi.unstubAllGlobals();
  });
});
