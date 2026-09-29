import { timings } from "@/config/reception";

export function createSlackPoster(options: {
  dryRun: boolean;
  token: string;
  channel: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}): (text: string) => Promise<void> {
  if (options.dryRun) return async () => undefined;
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? timings.slackTimeoutMs;
  return async (text: string) => {
    if (!options.token || !options.channel) throw new Error("slack_not_configured");
    const response = await fetchImpl("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.token}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({ channel: options.channel, text }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const data = (await response.json()) as { ok?: boolean };
    if (!response.ok || data.ok !== true) throw new Error("slack_rejected");
  };
}
