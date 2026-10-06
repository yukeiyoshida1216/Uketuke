import type { NotifyResult } from "./notify.js";

type InFlightEntry = {
  status: "in_flight";
  promise: Promise<NotifyResult>;
};

type SuccessEntry = {
  status: "success";
  result: NotifyResult;
  at: number;
};

type StoreEntry = InFlightEntry | SuccessEntry;

/**
 * 同一 idempotencyKey の並列・再送を1回の副作用（Slack送信）にまとめる。
 * 成功結果は windowMs の間キャッシュし、再送時は Slack を再呼び出ししない。
 */
export class IdempotencyStore {
  private readonly entries = new Map<string, StoreEntry>();

  constructor(
    private readonly windowMs: number,
    private readonly now: () => number = Date.now
  ) {}

  async run(key: string, work: () => Promise<NotifyResult>): Promise<NotifyResult> {
    this.prune();
    const existing = this.entries.get(key);
    if (existing?.status === "success") {
      return existing.result;
    }
    if (existing?.status === "in_flight") {
      return existing.promise;
    }

    const promise = work()
      .then((result) => {
        this.entries.set(key, {
          status: "success",
          result,
          at: this.now()
        });
        return result;
      })
      .catch((error) => {
        // 失敗時はキーを解放し、同一キーでの再試行を許可する
        const current = this.entries.get(key);
        if (current?.status === "in_flight" && current.promise === promise) {
          this.entries.delete(key);
        }
        throw error;
      });

    this.entries.set(key, { status: "in_flight", promise });
    return promise;
  }

  private prune(): void {
    const cutoff = this.now() - this.windowMs;
    for (const [key, entry] of this.entries) {
      if (entry.status === "success" && entry.at < cutoff) {
        this.entries.delete(key);
      }
    }
  }
}
