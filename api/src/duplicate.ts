import { createHash } from "node:crypto";
import type { NotifyRequest } from "./types.js";

export function canonicalNotifyKey(request: NotifyRequest): string {
  if (request.type === "general") {
    return JSON.stringify({
      type: request.type,
      companyName: request.companyName,
      visitorName: request.visitorName,
      partySize: request.partySize,
      destinationId: request.destinationId
    });
  }
  if (request.type === "interview") {
    return JSON.stringify({
      type: request.type,
      purpose: request.purpose,
      visitorName: request.visitorName
    });
  }
  return JSON.stringify({ type: request.type });
}

export function hashNotifyRequest(request: NotifyRequest): string {
  return createHash("sha256").update(canonicalNotifyKey(request)).digest("hex");
}

export class DuplicateWindow {
  private readonly seen = new Map<string, number>();

  constructor(private readonly windowMs: number, private readonly now: () => number = Date.now) {}

  rememberSuccess(request: NotifyRequest): void {
    this.prune();
    this.seen.set(hashNotifyRequest(request), this.now());
  }

  isDuplicate(request: NotifyRequest): boolean {
    this.prune();
    return this.seen.has(hashNotifyRequest(request));
  }

  private prune(): void {
    const cutoff = this.now() - this.windowMs;
    for (const [key, ts] of this.seen) {
      if (ts < cutoff) {
        this.seen.delete(key);
      }
    }
  }
}
