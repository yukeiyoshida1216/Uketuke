import type { MentionChoiceId } from "@/config/reception";
import {
  logContextFromBody,
  parseReceptionBody,
  receptionFingerprint,
  type ReceptionPayload,
} from "@/lib/reception";
import type { StaffRecord } from "@/server/destinations";
import type { ReceptionLogEntry } from "@/server/logger";
import { buildSlackText, MentionConfigError } from "@/server/slack-message";
import { SubmissionGuard, type SubmitResult } from "@/server/submission-guard";

export type ReceptionServiceDeps = {
  staff: StaffRecord[];
  interviewMentionIds: MentionChoiceId[];
  deliveryMentionIds: MentionChoiceId[];
  dryRun: boolean;
  postSlack: (text: string) => Promise<void>;
  log: (entry: ReceptionLogEntry) => void;
  now: () => number;
  guard: SubmissionGuard;
};

function destinationIdOf(payload: ReceptionPayload): string | null {
  return payload.type === "general" ? payload.destinationId : null;
}

function resolveSlackIds(staffIds: string[], staff: StaffRecord[]): string[] {
  return staffIds.map((id) => {
    const record = staff.find((person) => person.id === id);
    if (!record?.slackUserId) throw new MentionConfigError();
    return record.slackUserId;
  });
}

function composeMessage(
  payload: ReceptionPayload,
  staff: StaffRecord[],
  interviewMentionIds: string[],
  deliveryMentionIds: string[],
): string {
  if (payload.type === "general") {
    const destination = staff.find((person) => person.id === payload.destinationId);
    return buildSlackText({
      kind: "general",
      mentionSlackIds: resolveSlackIds([payload.destinationId], staff),
      companyName: payload.companyName,
      visitorName: payload.visitorName,
      visitorCount: payload.visitorCount,
      destinationName: destination?.name ?? "",
    });
  }
  if (payload.type === "interview") {
    return buildSlackText({
      kind: "interview",
      mentionSlackIds: resolveSlackIds(interviewMentionIds, staff),
      visitorName: payload.visitorName,
    });
  }
  return buildSlackText({
    kind: "other",
    mentionSlackIds: resolveSlackIds(deliveryMentionIds, staff),
  });
}

export function createReceptionService(deps: ReceptionServiceDeps) {
  const stamp = () => new Date(deps.now()).toISOString();

  return {
    async submit(body: unknown): Promise<SubmitResult> {
      const context = logContextFromBody(body);
      const parsed = parseReceptionBody(body);
      if (!parsed.ok) {
        deps.log({ at: stamp(), type: context.type, destinationId: context.destinationId, ok: false });
        return { status: 400, body: { ok: false, error: "validation_error", fields: parsed.fields } };
      }

      if (parsed.payload.type === "general") {
        const destinationId = parsed.payload.destinationId;
        const known = deps.staff.some((person) => person.id === destinationId);
        if (!known) {
          deps.log({
            at: stamp(),
            type: "general",
            destinationId,
            ok: false,
          });
          return { status: 400, body: { ok: false, error: "validation_error", fields: ["destinationId"] } };
        }
      }

      const payload = parsed.payload;
      return deps.guard.run({
        key: parsed.idempotencyKey,
        fingerprint: receptionFingerprint(payload),
        now: deps.now(),
        execute: () => executeSend(deps, payload, stamp),
      });
    },
  };
}

async function executeSend(
  deps: ReceptionServiceDeps,
  payload: ReceptionPayload,
  stamp: () => string,
): Promise<SubmitResult> {
  const destinationId = destinationIdOf(payload);
  try {
    if (!deps.dryRun) {
      const text = composeMessage(
        payload,
        deps.staff,
        deps.interviewMentionIds,
        deps.deliveryMentionIds,
      );
      await deps.postSlack(text);
    }
    deps.log({ at: stamp(), type: payload.type, destinationId, ok: true });
    return { status: 200, body: { ok: true } };
  } catch {
    deps.log({ at: stamp(), type: payload.type, destinationId, ok: false });
    return { status: 502, body: { ok: false, error: "notify_failed" } };
  }
}
