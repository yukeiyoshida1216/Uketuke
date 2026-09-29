import { createSlackPoster } from "@/server/slack-client";
import { describe, expect, it, vi } from "vitest";

describe("Slack 送信", () => {
  it("DRY RUN では HTTP を呼ばない", async () => {
    const fetchImpl = vi.fn();
    const post = createSlackPoster({
      dryRun: true,
      token: "xoxb-test",
      channel: "C123",
      fetchImpl,
    });
    await post("本文");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("本番は chat.postMessage にサーバーが作った本文だけを載せる", async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({ ok: true }),
    }));
    const post = createSlackPoster({
      dryRun: false,
      token: "xoxb-test",
      channel: "C123",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await post("<@UITO>\n【総合受付】来客がありました");
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://slack.com/api/chat.postMessage");
    expect(new Headers(init.headers).get("Authorization")).toBe("Bearer xoxb-test");
    expect(JSON.parse(String(init.body))).toEqual({
      channel: "C123",
      text: "<@UITO>\n【総合受付】来客がありました",
    });
  });

  it("Slack が拒否したら失敗にする", async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({ ok: false, error: "channel_not_found" }),
    }));
    const post = createSlackPoster({
      dryRun: false,
      token: "xoxb-test",
      channel: "C123",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await expect(post("本文")).rejects.toThrow(/slack_rejected/);
  });
});
