"use client";

import { backgroundGradient, preloadedPhotos, theme, timings } from "@/config/reception";
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
import { LanguageProvider, LanguageToggle, type KioskLanguage } from "@/components/kiosk/language";
import { postReceptionOnce } from "@/lib/api-client";
import { createIdleTimer } from "@/lib/idle-timer";
import { initialKioskState, kioskReducer } from "@/lib/kiosk-machine";
import { createIdempotencyKey, requestKeepAwake, requestKioskSurface } from "@/lib/kiosk-surface";
import { validatedGeneralDraft, validatedInterviewDraft } from "@/lib/reception";
import { retainKioskPhotos } from "@/lib/preload-photos";
import { createSubmitLock } from "@/lib/submit-lock";
import { useEffect, useReducer, useRef, useState } from "react";

const activityEvents = ["pointerdown", "keydown", "input", "change"] as const;

type DestinationPerson = { id: string; name: string };
type DestinationResult = {
  token: number;
  status: "ready" | "error";
  people: DestinationPerson[];
};

export function KioskApp({
  initialDestinations = [],
}: {
  initialDestinations?: DestinationPerson[];
}) {
  const [state, dispatch] = useReducer(kioskReducer, undefined, initialKioskState);
  const [destinationResult, setDestinationResult] = useState<DestinationResult | null>(() =>
    initialDestinations.length > 0 ? { token: 0, status: "ready", people: initialDestinations } : null,
  );
  const [destinationReload, setDestinationReload] = useState(0);
  const [language, setLanguage] = useState<KioskLanguage>("ja");
  const lockRef = useRef(createSubmitLock());
  const phaseRef = useRef(state.phase);

  useEffect(() => {
    document.documentElement.dataset.kioskReady = "1";
  }, []);

  useEffect(() => {
    if (phaseRef.current !== "welcome" && state.phase === "welcome") setLanguage("ja");
    phaseRef.current = state.phase;
  }, [state.phase]);

  retainKioskPhotos();

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
        setDestinationResult((current) => {
          if (token === 0 && current?.status === "ready" && current.people.length > 0) return current;
          return { token, status: "error", people: [] };
        });
      });
    return () => controller.abort();
  }, [destinationReload]);

  const destinations =
    destinationResult && (destinationResult.token === destinationReload || destinationResult.status === "ready")
      ? destinationResult
      : { status: "loading" as const, people: [] as DestinationPerson[] };

  function engage() {
    requestKioskSurface();
    void requestKeepAwake();
  }

  function startSend(
    action: Extract<
      Parameters<typeof kioskReducer>[1],
      { type: "openOther" | "chooseDestination" | "submitInterview" | "submitGeneral" }
    >,
  ) {
    if (!lockRef.current.tryLock()) return;
    dispatch(action);
  }

  const selectedDestination = state.draft.destinationId.trim();
  const generalReady =
    validatedGeneralDraft(state.draft).ok &&
    destinations.status === "ready" &&
    destinations.people.some((person) => person.id === selectedDestination);
  const interviewReady = validatedInterviewDraft(state.draft).ok;

  return (
    <LanguageProvider language={language} setLanguage={setLanguage}>
    <main
      data-phase={state.phase}
      className="kiosk-root relative h-dvh overflow-hidden"
      style={{
        background: backgroundGradient,
        color: theme.ink,
        fontFamily: theme.fontFamily,
      }}
    >
      <div aria-hidden className="pointer-events-none fixed top-0 left-0 -z-10 h-px w-px overflow-hidden opacity-0">
        {preloadedPhotos.map((src) => (
          <img key={src} src={src} alt="" decoding="async" data-photo-cache="" fetchPriority="high" />
        ))}
      </div>
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
          destinationId={state.draft.destinationId}
          destinations={destinations}
          ready={generalReady}
          onCompanyName={(value) => dispatch({ type: "editDraft", patch: { companyName: value } })}
          onVisitorName={(value) => dispatch({ type: "editDraft", patch: { visitorName: value } })}
          onVisitorCount={(value) => dispatch({ type: "editDraft", patch: { visitorCount: value } })}
          onDestination={(destinationId) => dispatch({ type: "editDraft", patch: { destinationId } })}
          onReloadDestinations={() => setDestinationReload((value) => value + 1)}
          onBack={() => dispatch({ type: "back" })}
          onSubmit={() => {
            startSend({ type: "submitGeneral", now: Date.now(), key: createIdempotencyKey() });
          }}
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
      <LanguageToggle />
    </main>
    </LanguageProvider>
  );
}
