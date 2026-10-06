import { describe, expect, it, vi } from "vitest";
import { toPublicDestinations } from "../src/destinations.js";
import { toReceptionLog } from "../src/logger.js";
import { nextKey, sampleDestinations, testApp, testConfig, withKey } from "./helpers.js";

describe("HTTP API", () => {
  it("returns liveness on /health", async () => {
    const { request } = testApp();
    const response = await request.get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("returns destinations without Slack user IDs", async () => {
    const { request } = testApp();
    const response = await request.get("/destinations");
    expect(response.status).toBe(200);
    expect(response.body.destinations).toEqual(toPublicDestinations(sampleDestinations));
    expect(JSON.stringify(response.body)).not.toContain("slackUserId");
    expect(JSON.stringify(response.body)).not.toContain("U011YAMADA");
  });

  it("notifies general, interview, and delivery in dry run without calling Slack", async () => {
    const { request, sent } = testApp({ config: testConfig({ dryRun: true }) });

    const general = await request.post("/notify").send(
      withKey({
        type: "general",
        companyName: "株式会社テスト",
        visitorName: "来訪太郎",
        partySize: 2,
        destinationId: "yamada"
      })
    );
    const interview = await request.post("/notify").send(
      withKey({
        type: "interview",
        purpose: "interview",
        visitorName: "候補者"
      })
    );
    const delivery = await request.post("/notify").send(withKey({ type: "delivery" }));

    expect(general.status).toBe(200);
    expect(interview.status).toBe(200);
    expect(delivery.status).toBe(200);
    expect(general.body).toEqual({ ok: true, dryRun: true });
    expect(sent).toEqual([]);
  });

  it("sends Slack only after validation and mentions the selected host", async () => {
    const { request, sent } = testApp({ config: testConfig({ dryRun: false }) });
    const response = await request.post("/notify").send(
      withKey({
        type: "general",
        companyName: "株式会社テスト",
        visitorName: "来訪太郎",
        partySize: 2,
        destinationId: "sato"
      })
    );
    expect(response.status).toBe(200);
    expect(sent).toHaveLength(1);
    expect(sent[0]).toContain("<@U011SATO>");
    expect(sent[0]).not.toContain("U011YAMADA");
  });

  it("returns 400 for unknown destination IDs and invalid bodies", async () => {
    const { request, sent } = testApp({ config: testConfig({ dryRun: false }) });
    const unknown = await request.post("/notify").send(
      withKey({
        type: "general",
        companyName: "A",
        visitorName: "B",
        partySize: 1,
        destinationId: "missing"
      })
    );
    const invalid = await request.post("/notify").send(
      withKey({
        type: "general",
        companyName: "",
        visitorName: "B",
        partySize: 1,
        destinationId: "yamada"
      })
    );
    const missingKey = await request.post("/notify").send({ type: "delivery" });
    expect(unknown.status).toBe(400);
    expect(unknown.body.error).toBe("UNKNOWN_DESTINATION");
    expect(invalid.status).toBe(400);
    expect(missingKey.status).toBe(400);
    expect(sent).toEqual([]);
  });

  it("does not send Slack again for the same successful payload within the window", async () => {
    let now = 5_000;
    const { request, sent } = testApp({
      config: testConfig({ dryRun: false, duplicateWindowMs: 10_000 }),
      clock: () => now
    });
    const first = await request.post("/notify").send(withKey({ type: "delivery" }, nextKey("dup-a")));
    const second = await request.post("/notify").send(withKey({ type: "delivery" }, nextKey("dup-b")));
    expect(first.status).toBe(200);
    expect(second.status).toBe(409);
    expect(sent).toHaveLength(1);

    now = 16_000;
    const third = await request.post("/notify").send(withKey({ type: "delivery" }, nextKey("dup-c")));
    expect(third.status).toBe(200);
    expect(sent).toHaveLength(2);
  });

  it("replays a successful idempotency key without sending Slack again", async () => {
    const { request, sent } = testApp({ config: testConfig({ dryRun: false }) });
    const key = nextKey("idem-ok");
    const payload = withKey({ type: "delivery" }, key);
    const first = await request.post("/notify").send(payload);
    const second = await request.post("/notify").send(payload);
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(sent).toHaveLength(1);
  });

  it("joins concurrent requests with the same idempotency key into one Slack send", async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const slack = {
      send: vi.fn(async () => {
        await gate;
      })
    };
    const { request } = testApp({
      config: testConfig({ dryRun: false }),
      slack
    });
    const key = nextKey("idem-race");
    const payload = withKey({ type: "delivery" }, key);
    const p1 = request.post("/notify").send(payload);
    const p2 = request.post("/notify").send(payload);
    await Promise.resolve();
    release();
    const [first, second] = await Promise.all([p1, p2]);
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(slack.send).toHaveBeenCalledTimes(1);
  });

  it("omits names and company names from durable logs", () => {
    const log = toReceptionLog({
      type: "general",
      destinationId: "yamada",
      ok: true,
      now: new Date("2026-09-28T08:00:00.000Z")
    });
    expect(log).toEqual({
      ts: "2026-09-28T08:00:00.000Z",
      type: "general",
      destinationId: "yamada",
      ok: true
    });
    expect(JSON.stringify(log)).not.toMatch(/氏名|会社|visitor|company/i);
  });
});

describe("failed Slack send", () => {
  it("does not mark the payload as sent, so retry with same key is allowed", async () => {
    const slack = {
      send: vi.fn().mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce(undefined)
    };
    const { request } = testApp({
      config: testConfig({ dryRun: false }),
      slack
    });
    const key = nextKey("idem-fail");
    const payload = withKey(
      { type: "interview", purpose: "training", visitorName: "候補者" },
      key
    );
    const first = await request.post("/notify").send(payload);
    const second = await request.post("/notify").send(payload);
    expect(first.status).toBe(500);
    expect(second.status).toBe(200);
    expect(slack.send).toHaveBeenCalledTimes(2);
  });
});
