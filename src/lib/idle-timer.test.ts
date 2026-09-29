import { createIdleTimer } from "@/lib/idle-timer";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.useRealTimers();
});

describe("無操作タイマー", () => {
  it("操作がなければ時間後に戻り、操作があれば延長する", () => {
    vi.useFakeTimers();
    const fired = vi.fn();
    const timer = createIdleTimer({ timeoutMs: 60_000, onFire: fired });
    timer.start();
    vi.advanceTimersByTime(59_000);
    expect(fired).not.toHaveBeenCalled();
    timer.bump();
    vi.advanceTimersByTime(59_000);
    expect(fired).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1_000);
    expect(fired).toHaveBeenCalledOnce();
  });

  it("停止後は発火しない", () => {
    vi.useFakeTimers();
    const fired = vi.fn();
    const timer = createIdleTimer({ timeoutMs: 1_000, onFire: fired });
    timer.start();
    timer.stop();
    vi.advanceTimersByTime(5_000);
    expect(fired).not.toHaveBeenCalled();
  });
});
