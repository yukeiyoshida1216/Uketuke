import { timings } from "@/config/reception";

export type SubmitResult = {
  status: number;
  body:
    | { ok: true }
    | { ok: false; error: "validation_error"; fields: string[] }
    | { ok: false; error: "notify_failed" };
};

type SuccessRecord = { at: number; result: SubmitResult };

export class SubmissionGuard {
  private readonly inflightKeys = new Map<string, Promise<SubmitResult>>();
  private readonly inflightFingerprints = new Map<string, Promise<SubmitResult>>();
  private readonly successByKey = new Map<string, SuccessRecord>();
  private readonly successByFingerprint = new Map<string, number>();

  constructor(
    private readonly windows: {
      dedupWindowMs: number;
      idempotencyTtlMs: number;
    } = {
      dedupWindowMs: timings.dedupWindowMs,
      idempotencyTtlMs: timings.idempotencyTtlMs,
    },
  ) {}

  async run(args: {
    key: string;
    fingerprint: string;
    now: number;
    execute: () => Promise<SubmitResult>;
  }): Promise<SubmitResult> {
    this.prune(args.now);

    const cached = this.successByKey.get(args.key);
    if (cached) return cached.result;

    const fingerprintAt = this.successByFingerprint.get(args.fingerprint);
    if (fingerprintAt !== undefined && args.now - fingerprintAt < this.windows.dedupWindowMs) {
      return { status: 200, body: { ok: true } };
    }

    const inflightFingerprint = this.inflightFingerprints.get(args.fingerprint);
    if (inflightFingerprint) return inflightFingerprint;
    const inflightKey = this.inflightKeys.get(args.key);
    if (inflightKey) return inflightKey;

    const promise = (async () => {
      try {
        const result = await args.execute();
        if (result.status >= 200 && result.status < 300) {
          this.successByKey.set(args.key, { at: args.now, result });
          this.successByFingerprint.set(args.fingerprint, args.now);
        }
        return result;
      } finally {
        this.inflightKeys.delete(args.key);
        this.inflightFingerprints.delete(args.fingerprint);
      }
    })();

    this.inflightKeys.set(args.key, promise);
    this.inflightFingerprints.set(args.fingerprint, promise);
    return promise;
  }

  private prune(now: number) {
    for (const [key, record] of this.successByKey) {
      if (now - record.at >= this.windows.idempotencyTtlMs) this.successByKey.delete(key);
    }
    for (const [fingerprint, at] of this.successByFingerprint) {
      if (now - at >= this.windows.dedupWindowMs) this.successByFingerprint.delete(fingerprint);
    }
  }
}
