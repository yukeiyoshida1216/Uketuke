// @vitest-environment happy-dom

import { copy, theme, timings } from "@/config/reception";
import { KioskApp } from "@/components/kiosk/kiosk-app";
import { resetInFlightForTests } from "@/lib/share-in-flight";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const people = {
  destinations: [
    { id: "nosaka", name: "野坂 星司", slackUserId: "UNOSAKA" },
    { id: "yanase", name: "梁瀬 星太" },
    { id: "ito", name: "伊藤 功" },
  ],
};

function jsonResponse(body: unknown, ok = true) {
  return {
    ok,
    status: ok ? 200 : 502,
    json: async () => body,
  };
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  resetInFlightForTests();
  vi.unstubAllGlobals();
});

describe("受付画面", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/destinations")) return jsonResponse(people);
      return jsonResponse({ ok: true });
    }));
  });

  async function openGeneral() {
    fireEvent.click(screen.getByRole("button", { name: /WELCOME/ }));
    fireEvent.click(screen.getByRole("button", { name: copy.general }));
  }

  it("ロゴと LIGHT PATH の間に会社名を出す", () => {
    render(<KioskApp />);
    const welcome = screen.getByRole("button", { name: /WELCOME/ });
    const html = welcome.innerHTML;
    expect(html.indexOf(copy.welcomeTitle)).toBeLessThan(html.indexOf("/logo-mark.svg"));
    expect(html.indexOf("/logo-mark.svg")).toBeLessThan(html.indexOf(copy.welcomeCompany));
    expect(html.indexOf(copy.welcomeCompany)).toBeLessThan(html.indexOf("/logo-wordmark.svg"));
    expect(html.indexOf("/logo-wordmark.svg")).toBeLessThan(html.indexOf(copy.welcomeSubtitle));
    const hint = [...welcome.querySelectorAll("span")].find((node) => node.textContent === copy.welcomeSubtitle);
    expect(hint?.getAttribute("style")).toContain(theme.yamabuki);
    expect(hint?.getAttribute("style") ?? "").not.toContain("background");
  });

  it("用件へ進んでもロゴ画像を外さない", () => {
    render(<KioskApp />);
    fireEvent.click(screen.getByRole("button", { name: /WELCOME/ }));
    expect(document.querySelector("img[src='/logo-mark.svg']")).toBeTruthy();
    expect(document.querySelector("img[src='/logo-wordmark.svg']")).toBeTruthy();
  });

  it("必須が揃うまで次へ進めず、戻っても入力が残る", async () => {
    render(<KioskApp />);
    await openGeneral();
    const next = screen.getByRole("button", { name: copy.next }) as HTMLButtonElement;
    expect(next.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(copy.companyName), { target: { value: "  株式会社あおぞら  " } });
    fireEvent.change(screen.getByLabelText(copy.visitorName), { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "2人" }));
    expect((screen.getByRole("button", { name: copy.next }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(copy.visitorName), { target: { value: "山田 花" } });
    fireEvent.click(screen.getByRole("button", { name: copy.next }));
    expect(await screen.findByRole("button", { name: "野坂 星司" })).toBeTruthy();
    expect(screen.queryByText("UNOSAKA")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: copy.back }));
    expect((screen.getByLabelText(copy.companyName) as HTMLInputElement).value).toBe("株式会社あおぞら");
    expect((screen.getByLabelText(copy.visitorName) as HTMLInputElement).value).toBe("山田 花");
  });

  it("送信に失敗すると完了画面を出さず、再試行は同じ内容を送る", async () => {
    const calls: unknown[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.includes("/api/destinations")) return jsonResponse(people);
        calls.push(JSON.parse(String(init?.body)));
        return jsonResponse({ ok: false }, calls.length > 1);
      }),
    );
    render(<KioskApp />);
    await openGeneral();
    fireEvent.change(screen.getByLabelText(copy.companyName), { target: { value: "株式会社あおぞら" } });
    fireEvent.change(screen.getByLabelText(copy.visitorName), { target: { value: "山田 花" } });
    fireEvent.click(screen.getByRole("button", { name: "3人" }));
    fireEvent.click(screen.getByRole("button", { name: copy.next }));
    fireEvent.click(await screen.findByRole("button", { name: "伊藤 功" }));
    expect(await screen.findByRole("button", { name: copy.retry })).toBeTruthy();
    expect(screen.queryByText(copy.thanks)).toBeNull();
    expect(document.querySelector("[data-phase]")?.getAttribute("data-phase")).toBe("error");
    fireEvent.click(screen.getByRole("button", { name: copy.retry }));
    expect(await screen.findByText(copy.thanks)).toBeTruthy();
    expect(calls).toHaveLength(2);
    expect(calls[0]).toMatchObject({
      type: "general",
      companyName: "株式会社あおぞら",
      visitorName: "山田 花",
      visitorCount: 3,
      visitorCountOrMore: false,
      destinationId: "ito",
    });
    expect(calls[1]).toMatchObject(calls[0] as Record<string, unknown>);
    expect(JSON.stringify(calls[0])).not.toContain("mentions");
  });

  it("その他はメニュー選択だけで通知し、連打しても通信は1回", async () => {
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    let receptionCalls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/api/receptions")) {
          receptionCalls += 1;
          await gate;
          return jsonResponse({ ok: true });
        }
        return jsonResponse(people);
      }),
    );
    render(<KioskApp />);
    fireEvent.click(screen.getByRole("button", { name: /WELCOME/ }));
    const other = screen.getByRole("button", { name: copy.other });
    fireEvent.click(other);
    fireEvent.click(other);
    expect(receptionCalls).toBe(1);
    release();
    expect(await screen.findByText(copy.thanks)).toBeTruthy();
    expect(receptionCalls).toBe(1);
  });

  it("無操作で入力を捨てて WELCOME に戻る", () => {
    vi.useFakeTimers();
    render(<KioskApp />);
    fireEvent.click(screen.getByRole("button", { name: /WELCOME/ }));
    fireEvent.click(screen.getByRole("button", { name: copy.general }));
    fireEvent.change(screen.getByLabelText(copy.companyName), { target: { value: "株式会社あおぞら" } });
    act(() => {
      vi.advanceTimersByTime(timings.inactivityMs - 1_000);
    });
    expect(screen.getByLabelText(copy.companyName)).toBeTruthy();
    fireEvent.change(screen.getByLabelText(copy.companyName), { target: { value: "株式会社あおぞら更新" } });
    act(() => {
      vi.advanceTimersByTime(timings.inactivityMs - 1_000);
    });
    expect(screen.queryByRole("button", { name: /WELCOME/ })).toBeNull();
    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(screen.getByRole("button", { name: /WELCOME/ })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /WELCOME/ }));
    fireEvent.click(screen.getByRole("button", { name: copy.general }));
    expect((screen.getByLabelText(copy.companyName) as HTMLInputElement).value).toBe("");
  });

  it("完了後、設定した時間で WELCOME に戻る", async () => {
    vi.useFakeTimers();
    render(<KioskApp />);
    fireEvent.click(screen.getByRole("button", { name: /WELCOME/ }));
    fireEvent.click(screen.getByRole("button", { name: copy.interview }));
    fireEvent.change(screen.getByLabelText(copy.visitorName), { target: { value: "佐藤" } });
    expect((screen.getByRole("button", { name: copy.send }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "面接" }));
    fireEvent.click(screen.getByRole("button", { name: copy.send }));
    await vi.waitFor(() => {
      expect(screen.getByText(copy.thanks)).toBeTruthy();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(timings.completeReturnMs);
    });
    expect(screen.getByRole("button", { name: /WELCOME/ })).toBeTruthy();
  });

  it("完了画面をタッチするとすぐに WELCOME に戻る", async () => {
    render(<KioskApp />);
    fireEvent.click(screen.getByRole("button", { name: /WELCOME/ }));
    fireEvent.click(screen.getByRole("button", { name: copy.interview }));
    const name = document.getElementById("interviewName");
    const choice = screen.getByRole("button", { name: "面接" });
    expect(name?.compareDocumentPosition(choice) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    fireEvent.change(screen.getByLabelText(copy.visitorName), { target: { value: "佐藤" } });
    fireEvent.click(screen.getByRole("button", { name: "面接" }));
    fireEvent.click(screen.getByRole("button", { name: copy.send }));
    fireEvent.click(await screen.findByText(copy.thanks));
    expect(screen.getByRole("button", { name: /WELCOME/ })).toBeTruthy();
    expect(screen.queryByText(copy.thanks)).toBeNull();
  });
});
