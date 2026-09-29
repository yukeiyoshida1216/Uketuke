import { timings } from "@/config/reception";
import { createReceptionLogger } from "@/server/logger";
import { createReceptionService } from "@/server/reception-service";
import type { StaffRecord } from "@/server/destinations";
import { SubmissionGuard } from "@/server/submission-guard";
import { describe, expect, it } from "vitest";

const staff: StaffRecord[] = [
  { id: "nosaka", name: "野坂 星司", slackUserId: "UNOSAKA" },
  { id: "yanase", name: "梁瀬 星太", slackUserId: "UYANASE" },
  { id: "ito", name: "伊藤 功", slackUserId: "UITO" },
];

function harness(options?: { dryRun?: boolean; postSlack?: (text: string) => Promise<void> }) {
  const posts: string[] = [];
  const lines: string[] = [];
  let now = 1_000_000;
  const service = createReceptionService({
    staff,
    interviewMentionIds: ["nosaka", "yanase"],
    deliveryMentionIds: ["ito"],
    dryRun: options?.dryRun ?? false,
    postSlack:
      options?.postSlack ??
      (async (text) => {
        posts.push(text);
      }),
    log: createReceptionLogger((line) => lines.push(line)).write,
    now: () => now,
    guard: new SubmissionGuard({
      dedupWindowMs: timings.dedupWindowMs,
      idempotencyTtlMs: timings.idempotencyTtlMs,
    }),
  });
  return {
    service,
    posts,
    lines,
    setNow(value: number) {
      now = value;
    },
  };
}

const generalBody = {
  idempotencyKey: "key-general-1",
  type: "general",
  companyName: "  株式会社あおぞら  ",
  visitorName: "  山田 花  ",
  visitorCount: 2,
  destinationId: "ito",
  text: "CLIENT_CONTROLLED_TEXT",
  mentions: ["UHACKER"],
  message: "<@UNOSAKA> <@UYANASE>",
};

describe("受付通知", () => {
  it("3種類の受付が Slack 本文をサーバー側で作り、種別どおりにメンションする", async () => {
    const { service, posts } = harness();

    const general = await service.submit(generalBody);
    const interview = await service.submit({
      idempotencyKey: "key-interview-1",
      type: "interview",
      purpose: "interview",
      visitorName: "佐藤",
      destinationId: "ito",
      mentions: ["UHACKER"],
    });
    const other = await service.submit({
      idempotencyKey: "key-other-1",
      type: "other",
      visitorName: "届け先に出してはいけない名前",
      text: "CLIENT_CONTROLLED_TEXT",
      mentions: ["UNOSAKA"],
    });

    expect(general.status).toBe(200);
    expect(interview.status).toBe(200);
    expect(other.status).toBe(200);
    expect(posts).toEqual([
      [
        "<@UITO>",
        "【総合受付】来客がありました",
        "会社名: 株式会社あおぞら",
        "お名前: 山田 花",
        "人数: 2名",
        "訪問先: 伊藤 功",
      ].join("\n"),
      ["<@UNOSAKA> <@UYANASE>", "【面接】来客がありました", "お名前: 佐藤"].join("\n"),
      ["<@UITO>", "【その他】配達の受付がありました"].join("\n"),
    ]);
    expect(posts[0]).not.toContain("UNOSAKA");
    expect(posts[0]).not.toContain("UYANASE");
    expect(posts[0]).not.toContain("UHACKER");
    expect(posts[0]).not.toContain("CLIENT_CONTROLLED_TEXT");
    expect(posts[1]).not.toContain("UITO");
    expect(posts[1]).not.toContain("UHACKER");
    expect(posts[2]).not.toContain("届け先に出してはいけない名前");
    expect(posts[2]).not.toContain("UNOSAKA");
    expect(posts[2]).not.toContain("CLIENT_CONTROLLED_TEXT");
  });

  it("必須漏れ・人数・未登録の訪問先は 400 で、Slack には送らない", async () => {
    const { service, posts, lines } = harness();
    const cases = [
      { ...generalBody, idempotencyKey: "key-missing-1", companyName: "   " },
      { ...generalBody, idempotencyKey: "key-missing-2", visitorName: "" },
      { ...generalBody, idempotencyKey: "key-missing-3", visitorCount: 0 },
      { ...generalBody, idempotencyKey: "key-missing-4", visitorCount: 1.5 },
      { ...generalBody, idempotencyKey: "key-missing-5", visitorCount: "2" },
      { ...generalBody, idempotencyKey: "key-missing-6", visitorCount: 4 },
      { ...generalBody, idempotencyKey: "key-missing-7", visitorCount: 4, visitorCountOrMore: "yes" },
      { ...generalBody, idempotencyKey: "key-missing-8", destinationId: "unknown" },
      { idempotencyKey: "key-interview-x", type: "interview", visitorName: "  ", purpose: "interview" },
      { idempotencyKey: "key-interview-y", type: "interview", visitorName: "佐藤" },
      { idempotencyKey: "key-type-x", type: "delivery" },
    ];
    for (const body of cases) {
      const result = await service.submit(body);
      expect(result.status).toBe(400);
      if (result.body.ok) throw new Error("expected validation error");
      expect(result.body.error).toBe("validation_error");
      expect(JSON.stringify(result.body)).not.toContain("あおぞら");
      expect(JSON.stringify(result.body)).not.toContain("山田");
    }
    expect(posts).toHaveLength(0);
    expect(lines.join("\n")).not.toContain("山田");
    expect(lines.join("\n")).not.toContain("あおぞら");
  });

  it("ログは日時・受付種別・訪問先ID・成否だけで、氏名と会社名を残さない", async () => {
    const { service, lines } = harness();
    await service.submit(generalBody);
    expect(lines).toHaveLength(1);
    const entry = JSON.parse(lines[0]) as Record<string, unknown>;
    expect(Object.keys(entry).sort()).toEqual(["at", "destinationId", "ok", "type"]);
    expect(entry).toMatchObject({ type: "general", destinationId: "ito", ok: true });
    expect(lines[0]).not.toContain("山田");
    expect(lines[0]).not.toContain("あおぞら");
    expect(lines[0]).not.toContain("UNOSAKA");
  });

  it("連打でも Slack へは一度だけ届く", async () => {
    let posts = 0;
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const { service } = harness({
      postSlack: async () => {
        posts += 1;
        await gate;
      },
    });
    const first = service.submit(generalBody);
    const second = service.submit({ ...generalBody, idempotencyKey: "key-general-2" });
    await Promise.resolve();
    expect(posts).toBe(1);
    release();
    const results = await Promise.all([first, second]);
    expect(results.map((result) => result.status)).toEqual([200, 200]);
    expect(posts).toBe(1);
  });

  it("成功済みの同一キーと同一内容は再通知せず、失敗後の再試行は通知する", async () => {
    let posts = 0;
    let failOnce = true;
    const { service, setNow } = harness({
      postSlack: async () => {
        posts += 1;
        if (failOnce) {
          failOnce = false;
          throw new Error("slack down");
        }
      },
    });

    const failed = await service.submit({ ...generalBody, idempotencyKey: "key-retry-1" });
    expect(failed.status).toBe(502);
    expect(failed.body).toEqual({ ok: false, error: "notify_failed" });
    const retried = await service.submit({ ...generalBody, idempotencyKey: "key-retry-1" });
    expect(retried.status).toBe(200);
    expect(posts).toBe(2);

    const duplicateKey = await service.submit({ ...generalBody, idempotencyKey: "key-retry-1" });
    expect(duplicateKey.status).toBe(200);
    expect(posts).toBe(2);

    setNow(1_000_000 + 1_000);
    const duplicateContent = await service.submit({ ...generalBody, idempotencyKey: "key-retry-2" });
    expect(duplicateContent.status).toBe(200);
    expect(posts).toBe(2);

    setNow(1_000_000 + timings.dedupWindowMs);
    const afterWindow = await service.submit({ ...generalBody, idempotencyKey: "key-retry-3" });
    expect(afterWindow.status).toBe(200);
    expect(posts).toBe(3);
  });

  it("4人以上と研修は見出しを分け、メンション先は設定どおり", async () => {
    const { service, posts } = harness();
    const general = await service.submit({
      ...generalBody,
      idempotencyKey: "key-four-1",
      visitorCount: 4,
      visitorCountOrMore: true,
    });
    const training = await service.submit({
      idempotencyKey: "key-training-1",
      type: "interview",
      purpose: "training",
      visitorName: "佐藤",
      destinationId: "ito",
      mentions: ["UHACKER"],
    });
    expect(general.status).toBe(200);
    expect(training.status).toBe(200);
    expect(posts[0]).toContain("人数: 4名以上");
    expect(posts[0]).toContain("<@UITO>");
    expect(posts[0]).not.toContain("UNOSAKA");
    expect(posts[1]).toContain("【研修】来客がありました");
    expect(posts[1]).toContain("<@UNOSAKA>");
    expect(posts[1]).toContain("<@UYANASE>");
    expect(posts[1]).not.toContain("UITO");
    expect(posts[1]).not.toContain("UHACKER");

    const briefing = await service.submit({
      idempotencyKey: "key-briefing-1",
      type: "interview",
      purpose: "briefing",
      visitorName: "佐藤",
    });
    expect(briefing.status).toBe(200);
    expect(posts[2]).toContain("【会社説明】来客がありました");
    expect(posts[2]).toContain("<@UNOSAKA>");
    expect(posts[2]).toContain("お名前: 佐藤");
  });

  it("DRY RUN では Slack を呼ばずに成功する", async () => {
    const poster = async () => {
      throw new Error("should not send");
    };
    const { service, lines } = harness({ dryRun: true, postSlack: poster });
    const result = await service.submit(generalBody);
    expect(result.status).toBe(200);
    const entry = JSON.parse(lines[0]) as { ok: boolean; type: string; destinationId: string };
    expect(entry).toMatchObject({ ok: true, type: "general", destinationId: "ito" });
    expect(lines[0]).not.toContain("山田");
  });

  it("Slack の User ID が無い訪問先へは送らず失敗にする", async () => {
    const posts: string[] = [];
    const service = createReceptionService({
      staff: [{ id: "nosaka", name: "野坂 星司", slackUserId: null }],
      interviewMentionIds: ["nosaka"],
      deliveryMentionIds: ["ito"],
      dryRun: false,
      postSlack: async (text) => {
        posts.push(text);
      },
      log: () => undefined,
      now: () => 0,
      guard: new SubmissionGuard(),
    });
    const result = await service.submit({
      idempotencyKey: "key-nomention-1",
      type: "general",
      companyName: "株式会社あおぞら",
      visitorName: "山田 花",
      visitorCount: 1,
      destinationId: "nosaka",
    });
    expect(result.status).toBe(502);
    expect(posts).toHaveLength(0);
  });
});
