export type ReceptionLog = {
  ts: string;
  type: string;
  destinationId: string | null;
  ok: boolean;
};

export function toReceptionLog(input: {
  type: string;
  destinationId?: string | null;
  ok: boolean;
  now?: Date;
}): ReceptionLog {
  return {
    ts: (input.now ?? new Date()).toISOString(),
    type: input.type,
    destinationId: input.destinationId ?? null,
    ok: input.ok
  };
}

export function writeReceptionLog(log: ReceptionLog): void {
  process.stdout.write(`${JSON.stringify(log)}\n`);
}
