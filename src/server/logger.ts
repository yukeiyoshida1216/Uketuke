import type { ReceptionType } from "@/lib/reception";

export type ReceptionLogEntry = {
  at: string;
  type: ReceptionType | null;
  destinationId: string | null;
  ok: boolean;
};

export type LogSink = (line: string) => void;

export function createReceptionLogger(sink: LogSink = (line) => {
  console.log(line);
}) {
  return {
    write(entry: ReceptionLogEntry) {
      sink(
        JSON.stringify({
          at: entry.at,
          type: entry.type,
          destinationId: entry.destinationId,
          ok: entry.ok,
        }),
      );
    },
  };
}
