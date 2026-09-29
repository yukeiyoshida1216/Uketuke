import { resetInFlightForTests, shareInFlight } from "@/lib/share-in-flight";
import { afterEach, describe, expect, it } from "vitest";

afterEach(() => {
  resetInFlightForTests();
});

describe("同一試行の共有", () => {
  it("同じキーの並行呼び出しは本体を1回だけ実行する", async () => {
    let calls = 0;
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const first = shareInFlight("same", async () => {
      calls += 1;
      await gate;
      return "ok";
    });
    const second = shareInFlight("same", async () => {
      calls += 1;
      return "other";
    });
    expect(calls).toBe(1);
    release();
    await expect(Promise.all([first, second])).resolves.toEqual(["ok", "ok"]);
    expect(calls).toBe(1);
  });
});
