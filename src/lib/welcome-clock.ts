const tokyoClock = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Tokyo",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export type WelcomeClockParts = {
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
};

/** タイトル画面の左上。日付と時刻、その下に秒。 */
export function welcomeClockParts(date: Date): WelcomeClockParts {
  const parts = tokyoClock.formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    month: value("month"),
    day: value("day"),
    hour: value("hour") === "24" ? "00" : value("hour"),
    minute: value("minute"),
    second: value("second"),
  };
}

/** 例: 09/30 12:00:00 */
export function formatWelcomeClock(date: Date): string {
  const parts = welcomeClockParts(date);
  return `${parts.month}/${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}
