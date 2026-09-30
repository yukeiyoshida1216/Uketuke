const tokyoClock = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Tokyo",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

/** タイトル画面の左上。例: 09/30 12:00:00 */
export function formatWelcomeClock(date: Date): string {
  const parts = tokyoClock.formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  const hour = value("hour") === "24" ? "00" : value("hour");
  return `${value("month")}/${value("day")} ${hour}:${value("minute")}:${value("second")}`;
}
