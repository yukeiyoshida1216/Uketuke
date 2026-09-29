import { timings } from "@/config/reception";
import { initialKioskState, kioskReducer, type KioskState } from "@/lib/kiosk-machine";
import { describe, expect, it } from "vitest";

const key = "key-general-1";

function toMenu(): KioskState {
  return kioskReducer(initialKioskState(), { type: "tapWelcome" });
}

function filledGeneral(state: KioskState): KioskState {
  return kioskReducer(state, {
    type: "editDraft",
    patch: { companyName: "  株式会社あおぞら  ", visitorName: "  山田 花  ", visitorCount: "2" },
  });
}

describe("受付画面の状態", () => {
  it("起動時は WELCOME", () => {
    expect(initialKioskState().phase).toBe("welcome");
  });

  it("未入力や空白だけでは総合受付を先に進めない", () => {
    let state = kioskReducer(toMenu(), { type: "openGeneral" });
    state = kioskReducer(state, { type: "nextFromGeneral" });
    expect(state.phase).toBe("general");

    state = kioskReducer(state, {
      type: "editDraft",
      patch: { companyName: "   ", visitorName: "山田", visitorCount: "1" },
    });
    state = kioskReducer(state, { type: "nextFromGeneral" });
    expect(state.phase).toBe("general");

    state = kioskReducer(state, {
      type: "editDraft",
      patch: { companyName: "株式会社あおぞら", visitorName: "山田", visitorCount: "0" },
    });
    expect(kioskReducer(state, { type: "nextFromGeneral" }).phase).toBe("general");
  });

  it("前後の空白を除いてから訪問先選択へ進む", () => {
    let state = filledGeneral(kioskReducer(toMenu(), { type: "openGeneral" }));
    state = kioskReducer(state, { type: "nextFromGeneral" });
    expect(state.phase).toBe("destination");
    expect(state.draft.companyName).toBe("株式会社あおぞら");
    expect(state.draft.visitorName).toBe("山田 花");
    expect(state.draft.visitorCount).toBe("2");
  });

  it("戻っても入力を保持し、最初の画面へ戻ると捨てる", () => {
    let state = filledGeneral(kioskReducer(toMenu(), { type: "openGeneral" }));
    state = kioskReducer(state, { type: "nextFromGeneral" });
    state = kioskReducer(state, { type: "back" });
    expect(state.phase).toBe("general");
    expect(state.draft.companyName).toBe("株式会社あおぞら");
    state = kioskReducer(state, { type: "back" });
    expect(state.phase).toBe("menu");
    state = kioskReducer(state, { type: "openGeneral" });
    expect(state.draft.visitorName).toBe("山田 花");
    state = kioskReducer(state, { type: "goHome" });
    expect(state.phase).toBe("welcome");
    expect(state.draft.companyName).toBe("");
    expect(state.draft.visitorName).toBe("");
  });

  it("面接は氏名が空なら送信せず、送信失敗では完了画面にしない", () => {
    let state = kioskReducer(toMenu(), { type: "openInterview" });
    state = kioskReducer(state, {
      type: "submitInterview",
      now: 0,
      key,
    });
    expect(state.phase).toBe("interview");

    state = kioskReducer(state, { type: "editDraft", patch: { interviewName: "  佐藤  " } });
    state = kioskReducer(state, { type: "submitInterview", now: 0, key });
    expect(state.phase).toBe("interview");
    state = kioskReducer(state, { type: "editDraft", patch: { interviewPurpose: "interview" } });
    state = kioskReducer(state, { type: "submitInterview", now: 0, key });
    expect(state.phase).toBe("sending");
    expect(state.pending?.payload).toEqual({ type: "interview", visitorName: "佐藤", purpose: "interview" });
    const sessionId = state.sessionId;
    state = kioskReducer(state, { type: "sendFailed", sessionId });
    expect(state.phase).toBe("error");
    expect(state.pending?.idempotencyKey).toBe(key);
    state = kioskReducer(state, { type: "retry" });
    expect(state.phase).toBe("sending");
    expect(state.pending?.idempotencyKey).toBe(key);
    expect(state.pending?.payload).toEqual({ type: "interview", visitorName: "佐藤", purpose: "interview" });
    expect(state.pending?.attempt).toBe(2);
  });

  it("その他は追加入力なしで送信し、成功後だけ完了し、時間後に WELCOME へ戻る", () => {
    let state = kioskReducer(toMenu(), { type: "openOther", now: 1_000, key: "key-other-1" });
    expect(state.phase).toBe("sending");
    expect(state.pending?.payload).toEqual({ type: "other" });
    const again = kioskReducer(state, { type: "openOther", now: 1_100, key: "key-other-2" });
    expect(again.pending?.idempotencyKey).toBe("key-other-1");
    state = kioskReducer(state, { type: "sendSucceeded", sessionId: state.sessionId, now: 1_200 });
    expect(state.phase).toBe("complete");
    state = kioskReducer(state, { type: "completeTimeout" });
    expect(state.phase).toBe("welcome");
    expect(state.draft.interviewName).toBe("");
  });

  it("無操作では入力を捨てて WELCOME に戻り、遅れて届いた成功は完了画面にしない", () => {
    let state = filledGeneral(kioskReducer(toMenu(), { type: "openGeneral" }));
    state = kioskReducer(state, { type: "inactivityTimeout" });
    expect(state.phase).toBe("welcome");
    expect(state.draft.companyName).toBe("");
    const ignored = kioskReducer(state, { type: "sendSucceeded", sessionId: 1, now: 5_000 });
    expect(ignored.phase).toBe("welcome");
  });

  it("送信中の無操作復帰のあとに成功通知が来ても完了画面を出さない", () => {
    let state = kioskReducer(toMenu(), { type: "openOther", now: 0, key: "key-other-9" });
    const sessionId = state.sessionId;
    state = kioskReducer(state, { type: "inactivityTimeout" });
    state = kioskReducer(state, { type: "sendSucceeded", sessionId, now: 100 });
    expect(state.phase).toBe("welcome");
  });

  it("成功した同一内容は短時間再送せず、窓の後は再び送れる", () => {
    let state = kioskReducer(toMenu(), { type: "openOther", now: 0, key: "key-other-1" });
    state = kioskReducer(state, { type: "sendSucceeded", sessionId: state.sessionId, now: 10 });
    state = kioskReducer(state, { type: "completeTimeout" });
    state = kioskReducer(state, { type: "tapWelcome" });
    state = kioskReducer(state, { type: "openOther", now: 10 + timings.dedupWindowMs - 1, key: "key-other-2" });
    expect(state.phase).toBe("complete");
    state = kioskReducer(state, { type: "completeTimeout" });
    state = kioskReducer(state, { type: "tapWelcome" });
    state = kioskReducer(state, { type: "openOther", now: 10 + timings.dedupWindowMs, key: "key-other-3" });
    expect(state.phase).toBe("sending");
  });

  it("メンション先が未選択なら総合受付を送信しない", () => {
    let state = filledGeneral(kioskReducer(toMenu(), { type: "openGeneral" }));
    state = kioskReducer(state, { type: "submitGeneral", now: 10, key: "key-visit-0" });
    expect(state.phase).toBe("general");
    state = kioskReducer(state, { type: "editDraft", patch: { destinationId: "yanase" } });
    state = kioskReducer(state, { type: "submitGeneral", now: 20, key: "key-visit-yanase" });
    expect(state.phase).toBe("sending");
    expect(state.pending?.payload).toMatchObject({ destinationId: "yanase", visitorCount: 2 });
  });

  it("総合受付の失敗では完了にせず、再試行は同じ訪問先と同じキーで送る", () => {
    let state = filledGeneral(kioskReducer(toMenu(), { type: "openGeneral" }));
    state = kioskReducer(state, { type: "nextFromGeneral" });
    state = kioskReducer(state, {
      type: "chooseDestination",
      destinationId: "ito",
      now: 50,
      key: "key-visit-1",
    });
    expect(state.pending?.payload).toMatchObject({
      type: "general",
      destinationId: "ito",
      companyName: "株式会社あおぞら",
      visitorName: "山田 花",
      visitorCount: 2,
      visitorCountOrMore: false,
    });
    state = kioskReducer(state, { type: "sendFailed", sessionId: state.sessionId });
    expect(state.phase).toBe("error");
    state = kioskReducer(state, { type: "retry" });
    expect(state.phase).toBe("sending");
    expect(state.pending?.idempotencyKey).toBe("key-visit-1");
    expect(state.pending?.payload).toMatchObject({ destinationId: "ito" });
  });
});
