import { timings } from "@/config/reception";
import { emptyDraft, type Draft } from "@/lib/reception-draft";
import {
  receptionFingerprint,
  validatedGeneralDraft,
  validatedInterviewDraft,
  type ReceptionPayload,
} from "@/lib/reception";

export type { Draft };

export type PendingReception = {
  payload: ReceptionPayload;
  idempotencyKey: string;
  fingerprint: string;
  attempt: number;
};

export type KioskPhase =
  | "welcome"
  | "menu"
  | "general"
  | "destination"
  | "interview"
  | "sending"
  | "complete"
  | "error";

export type KioskState = {
  phase: KioskPhase;
  draft: Draft;
  pending: PendingReception | null;
  sessionId: number;
  lastSuccessFingerprint: string | null;
  lastSuccessAt: number | null;
};

export type KioskAction =
  | { type: "tapWelcome" }
  | { type: "openGeneral" }
  | { type: "openInterview" }
  | { type: "openOther"; now: number; key: string }
  | { type: "editDraft"; patch: Partial<Draft> }
  | { type: "nextFromGeneral" }
  | { type: "back" }
  | { type: "chooseDestination"; destinationId: string; now: number; key: string }
  | { type: "submitInterview"; now: number; key: string }
  | { type: "sendSucceeded"; sessionId: number; now: number }
  | { type: "sendFailed"; sessionId: number }
  | { type: "retry" }
  | { type: "goHome" }
  | { type: "inactivityTimeout" }
  | { type: "completeTimeout" };

function emptyDraftState(): Draft {
  return emptyDraft();
}

export function initialKioskState(): KioskState {
  return {
    phase: "welcome",
    draft: emptyDraftState(),
    pending: null,
    sessionId: 1,
    lastSuccessFingerprint: null,
    lastSuccessAt: null,
  };
}

function resetToWelcome(state: KioskState): KioskState {
  return {
    ...initialKioskState(),
    sessionId: state.sessionId + 1,
    lastSuccessFingerprint: state.lastSuccessFingerprint,
    lastSuccessAt: state.lastSuccessAt,
  };
}

function isRecentDuplicate(state: KioskState, fingerprint: string, now: number): boolean {
  if (state.lastSuccessFingerprint !== fingerprint || state.lastSuccessAt === null) return false;
  return now - state.lastSuccessAt < timings.dedupWindowMs;
}

function beginSend(state: KioskState, pending: PendingReception, now: number): KioskState {
  if (isRecentDuplicate(state, pending.fingerprint, now)) {
    return {
      ...state,
      phase: "complete",
      pending: null,
      draft: emptyDraftState(),
    };
  }
  return { ...state, phase: "sending", pending };
}

export function kioskReducer(state: KioskState, action: KioskAction): KioskState {
  switch (action.type) {
    case "tapWelcome":
      return state.phase === "welcome" ? { ...state, phase: "menu" } : state;
    case "openGeneral":
      return state.phase === "menu" ? { ...state, phase: "general" } : state;
    case "openInterview":
      return state.phase === "menu" ? { ...state, phase: "interview" } : state;
    case "openOther": {
      if (state.phase !== "menu") return state;
      const payload: ReceptionPayload = { type: "other" };
      const fingerprint = receptionFingerprint(payload);
      return beginSend(
        state,
        {
          payload,
          idempotencyKey: action.key,
          fingerprint,
          attempt: (state.pending?.attempt ?? 0) + 1,
        },
        action.now,
      );
    }
    case "editDraft":
      if (state.phase !== "general" && state.phase !== "interview") return state;
      return { ...state, draft: { ...state.draft, ...action.patch } };
    case "nextFromGeneral": {
      if (state.phase !== "general") return state;
      const validated = validatedGeneralDraft(state.draft);
      if (!validated.ok) return state;
      return {
        ...state,
        phase: "destination",
        draft: {
          ...state.draft,
          companyName: validated.companyName,
          visitorName: validated.visitorName,
        },
      };
    }
    case "back":
      if (state.phase === "general" || state.phase === "interview") {
        return { ...state, phase: "menu" };
      }
      if (state.phase === "destination") return { ...state, phase: "general" };
      return state;
    case "chooseDestination": {
      if (state.phase !== "destination") return state;
      const validated = validatedGeneralDraft(state.draft);
      const destinationId = action.destinationId.trim();
      if (!validated.ok || destinationId.length === 0) return state;
      const payload: ReceptionPayload = {
        type: "general",
        companyName: validated.companyName,
        visitorName: validated.visitorName,
        visitorCount: validated.visitorCount,
        visitorCountOrMore: validated.visitorCountOrMore,
        destinationId,
      };
      return beginSend(
        state,
        {
          payload,
          idempotencyKey: action.key,
          fingerprint: receptionFingerprint(payload),
          attempt: (state.pending?.attempt ?? 0) + 1,
        },
        action.now,
      );
    }
    case "submitInterview": {
      if (state.phase !== "interview") return state;
      const interview = validatedInterviewDraft(state.draft);
      if (!interview.ok) return state;
      const payload: ReceptionPayload = {
        type: "interview",
        visitorName: interview.visitorName,
        purpose: interview.purpose,
      };
      return beginSend(
        {
          ...state,
          draft: { ...state.draft, interviewName: interview.visitorName },
        },
        {
          payload,
          idempotencyKey: action.key,
          fingerprint: receptionFingerprint(payload),
          attempt: (state.pending?.attempt ?? 0) + 1,
        },
        action.now,
      );
    }
    case "sendSucceeded": {
      if (state.phase !== "sending" || !state.pending || action.sessionId !== state.sessionId) {
        return state;
      }
      return {
        ...state,
        phase: "complete",
        lastSuccessFingerprint: state.pending.fingerprint,
        lastSuccessAt: action.now,
        pending: null,
        draft: emptyDraftState(),
      };
    }
    case "sendFailed":
      if (state.phase !== "sending" || action.sessionId !== state.sessionId) return state;
      return { ...state, phase: "error" };
    case "retry":
      if (state.phase !== "error" || !state.pending) return state;
      return {
        ...state,
        phase: "sending",
        pending: { ...state.pending, attempt: state.pending.attempt + 1 },
      };
    case "goHome":
    case "inactivityTimeout":
      return state.phase === "welcome" ? state : resetToWelcome(state);
    case "completeTimeout":
      return state.phase === "complete" ? resetToWelcome(state) : state;
    default:
      return state;
  }
}
