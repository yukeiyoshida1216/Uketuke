/** ブラウザの全画面。拒否されても受付は続ける。キオスク固定は Android シェルが担う。 */
export function requestKioskSurface(): void {
  const root = document.documentElement;
  if (document.fullscreenElement || typeof root.requestFullscreen !== "function") return;
  void root.requestFullscreen().catch(() => undefined);
}

export async function requestKeepAwake(): Promise<void> {
  const wakeLock = (navigator as Navigator & {
    wakeLock?: { request: (type: "screen") => Promise<unknown> };
  }).wakeLock;
  if (!wakeLock) return;
  try {
    await wakeLock.request("screen");
  } catch {
    // 画面の常時点灯が使えなくても操作は続ける。
  }
}

export function createIdempotencyKey(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `key-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
