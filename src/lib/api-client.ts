import { timings } from "@/config/reception";
import type { PendingReception } from "@/lib/kiosk-machine";
import { shareInFlight } from "@/lib/share-in-flight";

export function toRequestBody(pending: PendingReception): Record<string, unknown> {
  const payload = pending.payload;
  if (payload.type === "general") {
    return {
      idempotencyKey: pending.idempotencyKey,
      type: "general",
      companyName: payload.companyName,
      visitorName: payload.visitorName,
      visitorCount: payload.visitorCount,
      destinationId: payload.destinationId,
    };
  }
  if (payload.type === "interview") {
    return {
      idempotencyKey: pending.idempotencyKey,
      type: "interview",
      visitorName: payload.visitorName,
    };
  }
  return {
    idempotencyKey: pending.idempotencyKey,
    type: "other",
  };
}

export async function postReception(
  pending: PendingReception,
  timeoutMs = timings.requestTimeoutMs,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl("/api/receptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toRequestBody(pending)),
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** 同じ試行の二重呼び出し（連打や Strict Mode）は通信を1本にまとめる。 */
export function postReceptionOnce(pending: PendingReception): Promise<boolean> {
  return shareInFlight(`${pending.idempotencyKey}:${pending.attempt}`, () => postReception(pending));
}
