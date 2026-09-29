import { createSubmitLock } from "@/lib/submit-lock";
import { describe, expect, it } from "vitest";

describe("送信ロック", () => {
  it("操作直後の二度目は受け付けず、解除後に再度受け付ける", () => {
    const lock = createSubmitLock();
    expect(lock.tryLock()).toBe(true);
    expect(lock.tryLock()).toBe(false);
    lock.release();
    expect(lock.tryLock()).toBe(true);
  });
});
