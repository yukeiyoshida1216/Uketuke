"use client";

import { backgroundGradient, theme, timings } from "@/config/reception";
import {
  CompleteScreen,
  DestinationScreen,
  ErrorScreen,
  GeneralScreen,
  InterviewScreen,
  MenuScreen,
  SendingScreen,
  WelcomeScreen,
} from "@/components/kiosk/screens";
import { postReceptionOnce } from "@/lib/api-client";
import { createIdleTimer } from "@/lib/idle-timer";
import { initialKioskState, kioskReducer } from "@/lib/kiosk-machine";
import { createIdempotencyKey, requestKeepAwake, requestKioskSurface } from "@/lib/kiosk-surface";
import { validatedGeneralDraft, validatedInterviewDraft } from "@/lib/reception";
import { createSubmitLock } from "@/lib/submit-lock";
import { useEffect, useReducer, useRef, useState } from "react";

const activityEvents = ["pointerdown", "keydown", "input", "change"] as const;

type DestinationPerson = { id: string; name: string };
type DestinationResult = {
  token: number;
  status: "ready" | "error";
  people: DestinationPerson[];
};

export function KioskApp() {
  const [state, dispatch] = useReducer(kioskReducer, undefined, initialKioskState);
  const [destinationResult, setDestinationResult] = useState<DestinationResult | null>(null);
  const [destinationReload, setDestinationReload] = useState(0);
  const lockRef = useRef(createSubmitLock());

  useEffect(() => {
    document.documentElement.dataset.kioskReady = "1";
  }, []);

  useEffect(() => {
    if (state.phase !== "sending") lockRef.current.release();
  }, [state.phase]);

  useEffect(() => {
    const armed = state.phase !== "welcome" && state.phase !== "complete";
    if (!armed) return;
    const timer = createIdleTimer({
      timeoutMs: timings.inactivityMs,
      onFire: () => dispatch({ type: "inactivityTimeout" }),
    });
    timer.start();
    const bump = () => timer.bump();
    for (const eventName of activityEvents) window.addEventListener(eventName, bump);
    return () => {
      timer.stop();
      for (const eventName of activityEvents) window.removeEventListener(eventName, bump);
    };
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "complete") return;
    const timer = setTimeout(() => dispatch({ type: "completeTimeout" }), timings.completeReturnMs);
    return () => clearTimeout(timer);
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "sending" || !state.pending) return;
    const pending = state.pending;
    const sessionId = state.sessionId;
    let active = true;
    void postReceptionOnce(pending).then((ok) => {
      if (!active) return;
      dispatch(
        ok
          ? { type: "sendSucceeded", sessionId, now: Date.now() }
          : { type: "sendFailed", sessionId },
      );
    });
    return () => {
      active = false;
    };
  }, [state.phase, state.pending, state.sessionId]);

  useEffect(() => {
    if (state.phase !== "destination") return;
    const controller = new AbortController();
    const token = destinationReload;
    void fetch("/api/destinations", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("destinations");
        const body = (await response.json()) as { destinations?: unknown };
        const list = Array.isArray(body.destinations) ? body.destinations : [];
        const people = list.flatMap((item) => {
          if (!item || typeof item !== "object") return [];
          const record = item as Record<string, unknown>;
          if (typeof record.id !== "string" || typeof record.name !== "string") return [];
          return [{ id: record.id, name: record.name }];
        });
        if (!controller.signal.aborted) setDestinationResult({ token, status: "ready", people });
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setDestinationResult({ token, status: "error", people: [] });
      });
    return () => controller.abort();
  }, [state.phase, destinationReload]);

  const destinations =
    state.phase === "destination" && destinationResult?.token === destinationReload
      ? destinationResult
      : { status: "loading" as const, people: [] as DestinationPerson[] };

  function engage() {
    requestKioskSurface();
    void requestKeepAwake();
  }

  function startSend(
    action: Extract<Parameters<typeof kioskReducer>[1], { type: "openOther" | "chooseDestination" | "submitInterview" }>,
  ) {
    if (!lockRef.current.tryLock()) return;
    dispatch(action);
  }

  const generalReady = validatedGeneralDraft(state.draft).ok;
  const interviewReady = validatedInterviewDraft(state.draft).ok;

  return (
    <main
      data-phase={state.phase}
      className="kiosk-root h-dvh overflow-hidden"
      style={{
        background: backgroundGradient,
        color: theme.ink,
        fontFamily: theme.fontFamily,
      }}
    >
      <div className="h-full" hidden={state.phase !== "welcome"}>
        <WelcomeScreen
          onEnter={() => {
            engage();
            dispatch({ type: "tapWelcome" });
          }}
        />
      </div>
      {state.phase === "menu" ? (
        <MenuScreen
          onGeneral={() => {
            engage();
            dispatch({ type: "openGeneral" });
          }}
          onInterview={() => {
            engage();
            dispatch({ type: "openInterview" });
          }}
          onOther={() => {
            engage();
            startSend({ type: "openOther", now: Date.now(), key: createIdempotencyKey() });
          }}
          onHome={() => dispatch({ type: "goHome" })}
        />
      ) : null}
      {state.phase === "general" ? (
        <GeneralScreen
          companyName={state.draft.companyName}
          visitorName={state.draft.visitorName}
          visitorCount={state.draft.visitorCount}
          ready={generalReady}
          onCompanyName={(value) => dispatch({ type: "editDraft", patch: { companyName: value } })}
          onVisitorName={(value) => dispatch({ type: "editDraft", patch: { visitorName: value } })}
          onVisitorCount={(value) => dispatch({ type: "editDraft", patch: { visitorCount: value } })}
          onBack={() => dispatch({ type: "back" })}
          onNext={() => dispatch({ type: "nextFromGeneral" })}
        />
      ) : null}
      {state.phase === "destination" ? (
        <DestinationScreen
          status={destinations.status}
          people={destinations.people}
          onChoose={(destinationId) => {
            startSend({ type: "chooseDestination", destinationId, now: Date.now(), key: createIdempotencyKey() });
          }}
          onBack={() => dispatch({ type: "back" })}
          onReload={() => setDestinationReload((value) => value + 1)}
        />
      ) : null}
      {state.phase === "interview" ? (
        <InterviewScreen
          visitorName={state.draft.interviewName}
          purpose={state.draft.interviewPurpose}
          ready={interviewReady}
          onVisitorName={(value) => dispatch({ type: "editDraft", patch: { interviewName: value } })}
          onPurpose={(value) => dispatch({ type: "editDraft", patch: { interviewPurpose: value } })}
          onBack={() => dispatch({ type: "back" })}
          onSubmit={() => {
            startSend({ type: "submitInterview", now: Date.now(), key: createIdempotencyKey() });
          }}
        />
      ) : null}
      {state.phase === "sending" ? <SendingScreen /> : null}
      {state.phase === "complete" ? <CompleteScreen onReturn={() => dispatch({ type: "goHome" })} /> : null}
      {state.phase === "error" ? (
        <ErrorScreen
          onRetry={() => {
            if (!lockRef.current.tryLock()) return;
            dispatch({ type: "retry" });
          }}
          onHome={() => dispatch({ type: "goHome" })}
        />
      ) : null}
    </main>
  );
}
