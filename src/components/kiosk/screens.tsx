"use client";

import { backgroundGradient, interviewPurposes, mentionChoices, staffDisplayName, theme, timings, visitorCountChoices } from "@/config/reception";
import { KioskButton, KioskField, KioskFrame } from "@/components/kiosk/controls";
import { useKioskCopy } from "@/components/kiosk/language";
import { welcomeClockParts } from "@/lib/welcome-clock";
import { useEffect, useState } from "react";

function ChoicePhotos({
  photos,
  selectedId,
}: {
  photos: ReadonlyArray<{ id: string; photo: string }>;
  selectedId: string;
}) {
  return (
    <div className="kiosk-choice-photos pointer-events-none absolute right-0 hidden w-[min(20vw,16rem)] landscape:block">
      {photos.map((item) => (
        <img
          key={item.id}
          src={item.photo}
          alt=""
          decoding="async"
          data-selected={selectedId === item.id ? "true" : "false"}
          className={`absolute inset-0 h-full w-full object-contain ${selectedId === item.id ? "opacity-100" : "opacity-0"}`}
        />
      ))}
    </div>
  );
}

function MenuLabel({ label }: { label: string }) {
  const dot = label.indexOf("・");
  if (dot < 0) return label;
  return (
    <>
      <span className="inline-block">{label.slice(0, dot + 1)}</span>
      <span className="inline-block">{label.slice(dot + 1)}</span>
    </>
  );
}

function useWelcomeClock() {
  const [parts, setParts] = useState(() => welcomeClockParts(new Date()));
  useEffect(() => {
    const update = () => setParts(welcomeClockParts(new Date()));
    const timer = window.setInterval(update, 1_000);
    return () => window.clearInterval(timer);
  }, []);
  return parts;
}

function DeliveryBell() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className="h-[46%] w-[46%] shrink-0" fill="currentColor">
      <path d="M32 6c1.7 0 3 1.3 3 3v1.6C43.8 12.4 50 20.2 50 29.4V40l4.2 6.2c1 1.5-.1 3.5-1.9 3.5H11.7c-1.8 0-2.9-2-1.9-3.5L14 40V29.4c0-9.2 6.2-17 15-18.8V9c0-1.7 1.3-3 3-3z" />
      <path d="M25.2 52.2a7 7 0 0 0 13.6 0h-13.6z" />
    </svg>
  );
}

export function DeliveryButton({ onPress }: { onPress: () => void }) {
  const copy = useKioskCopy();
  return (
    <button
      type="button"
      onClick={onPress}
      className="kiosk-delivery absolute z-30 flex flex-col items-center justify-center gap-[0.2rem] rounded-2xl border-4 bg-white font-bold"
      style={{ color: theme.amberDeep, borderColor: theme.amberDeep, background: theme.white }}
    >
      <DeliveryBell />
      <span>{copy.delivery}</span>
    </button>
  );
}

export function WelcomeScreen({ onEnter }: { onEnter: () => void }) {
  const copy = useKioskCopy();
  const clock = useWelcomeClock();
  return (
    <button
      type="button"
      onClick={onEnter}
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{
        background: backgroundGradient,
        color: theme.ink,
      }}
    >
      <time
        className="absolute text-left font-semibold tabular-nums"
        style={{
          top: "clamp(1.15rem, 2.8vh, 1.85rem)",
          left: "clamp(1.2rem, 3vw, 1.9rem)",
          color: theme.clock,
          fontSize: "clamp(2.35rem, 5.5vh, 3.7rem)",
          lineHeight: 1.08,
          width: "max-content",
          textAlign: "left",
        }}
        suppressHydrationWarning
      >
        <span className="block" suppressHydrationWarning>{`${clock.month}/${clock.day}`}</span>
        <span className="block" suppressHydrationWarning>{`${clock.hour}:${clock.minute}:${clock.second}`}</span>
      </time>
      <span
        className="font-bold tracking-[0.14em]"
        style={{ color: theme.welcomeSoft, fontSize: "clamp(3.6rem, 11vh, 7rem)" }}
      >
        {copy.welcomeTitle}
      </span>
      <img
        src="/logo-mark.svg"
        alt=""
        width={1132}
        height={1120}
        decoding="sync"
        fetchPriority="high"
        className="mt-[clamp(0.4rem,1.6vh,1rem)] h-[min(26vh,16rem)] w-auto max-w-[min(70vw,18rem)] object-contain"
      />
      <span
        className="mt-[clamp(0.2rem,1vh,0.6rem)] font-bold tracking-[0.04em]"
        style={{ color: theme.ink, fontSize: "clamp(1.8rem, 5.6vw, 3.4rem)", lineHeight: 1.15 }}
      >
        {copy.welcomeCompany}
      </span>
      <img
        src="/logo-wordmark.svg"
        alt="LIGHT PATH"
        width={1512}
        height={522}
        decoding="sync"
        fetchPriority="high"
        className="mt-[clamp(0.15rem,0.8vh,0.45rem)] h-[min(8vh,4.4rem)] w-auto max-w-[min(64vw,16rem)] object-contain"
      />
      <span
        className="kiosk-blink mt-[clamp(0.7rem,2.2vh,1.3rem)] font-medium"
        style={{
          color: theme.hintClear,
          fontSize: "clamp(1.35rem, 3.2vh, 2.15rem)",
          animationDuration: `${timings.hintBlinkMs}ms`,
        }}
      >
        {copy.welcomeSubtitle}
      </span>
    </button>
  );
}

function CornerArrowButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <KioskButton tone="white" className="kiosk-home" onClick={onClick}>
      <span style={{ whiteSpace: "nowrap" }}>{`←${label}`}</span>
    </KioskButton>
  );
}

export function MenuScreen({
  onGeneral,
  onInterview,
  onOther,
  onHome,
}: {
  onGeneral: () => void;
  onInterview: () => void;
  onOther: () => void;
  onHome: () => void;
}) {
  const copy = useKioskCopy();
  const choices = [
    { label: copy.general, hint: copy.generalHint, onClick: onGeneral, icon: "/menu/general.png" },
    { label: copy.interview, hint: copy.interviewHint, onClick: onInterview, icon: "" },
    { label: copy.other, hint: copy.otherHint, onClick: onOther, icon: "" },
  ];
  return (
    <KioskFrame title={copy.menuTitle} prominentTitle>
      <div className="flex h-full min-h-0 flex-col">
        <div className="kiosk-menu-choices grid min-h-0 grid-rows-3 gap-[clamp(0.55rem,1.4vh,0.9rem)] landscape:grid-cols-3 landscape:grid-rows-1">
        {choices.map((choice) => (
          <KioskButton
            key={choice.label}
            tone="white"
            onClick={choice.onClick}
            aria-label={choice.label}
            className="h-full"
            style={{ height: "100%", minHeight: "clamp(3rem, 7vh, 5.5rem)" }}
          >
            <span className="flex flex-col items-center gap-2">
              {choice.icon ? <img src={choice.icon} alt="" className="kiosk-choice-icon" /> : null}
              <span className="kiosk-choice-label" style={{ fontSize: "var(--kiosk-choice-label)", lineHeight: 1.2 }}>
                <MenuLabel label={choice.label} />
              </span>
              <span className="kiosk-choice-hint font-medium" style={{ fontSize: "clamp(1rem, 2.45vh, 1.38rem)", color: theme.inkSoft }}>
                {choice.hint}
              </span>
            </span>
          </KioskButton>
        ))}
        </div>
        <CornerArrowButton label={copy.back} onClick={onHome} />
      </div>
    </KioskFrame>
  );
}

export function GeneralScreen({
  companyName,
  visitorName,
  visitorCount,
  destinationId,
  destinations,
  ready,
  onCompanyName,
  onVisitorName,
  onVisitorCount,
  onDestination,
  onReloadDestinations,
  onBack,
  onSubmit,
}: {
  companyName: string;
  visitorName: string;
  visitorCount: string;
  destinationId: string;
  destinations: { status: "loading" | "ready" | "error"; people: Array<{ id: string; name: string }> };
  ready: boolean;
  onCompanyName: (value: string) => void;
  onVisitorName: (value: string) => void;
  onVisitorCount: (value: string) => void;
  onDestination: (id: string) => void;
  onReloadDestinations: () => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const copy = useKioskCopy();
  const countLabel = {
    "1": copy.count1,
    "2": copy.count2,
    "3": copy.count3,
    "4plus": copy.count4plus,
  } as const;
  return (
    <KioskFrame title={copy.generalTitle} prominentTitle>
      <CornerArrowButton label={copy.back} onClick={onBack} />
      <form
        className="kiosk-entry"
        onSubmit={(event) => {
          event.preventDefault();
          if (ready) onSubmit();
        }}
      >
        <div className="kiosk-entry-gap" />
        <div className="kiosk-entry-fields grid gap-[clamp(0.35rem,1.1vh,0.7rem)]">
          <KioskField
            id="companyName"
            label={copy.companyName}
            value={companyName}
            placeholder={copy.companyPlaceholder}
            autoComplete="organization"
            onChange={(event) => onCompanyName(event.target.value)}
          />
          <KioskField
            id="visitorName"
            label={copy.visitorName}
            value={visitorName}
            placeholder={copy.visitorPlaceholder}
            autoComplete="name"
            onChange={(event) => onVisitorName(event.target.value)}
          />
          <div className="grid gap-2">
            <span className="font-medium" style={{ color: theme.inkSoft, fontSize: "clamp(1rem, 2.2vh, 1.3rem)" }}>
              {copy.visitorCount}
            </span>
            <div className="grid grid-cols-4 gap-2" role="group" aria-label={copy.visitorCount}>
              {visitorCountChoices.map((choice) => (
                <KioskButton
                  key={choice.id}
                  type="button"
                  tone={visitorCount === choice.id ? "primary" : "white"}
                  aria-pressed={visitorCount === choice.id}
                  style={{ minHeight: "clamp(3.1rem, 8vh, 4.4rem)" }}
                  onClick={() => onVisitorCount(choice.id)}
                >
                  {countLabel[choice.id]}
                </KioskButton>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <span className="font-medium" style={{ color: theme.inkSoft, fontSize: "clamp(1rem, 2.2vh, 1.3rem)" }}>
              {copy.mentionTarget}
            </span>
            {destinations.status === "loading" ? (
              <p className="font-medium" style={{ color: theme.inkSoft, fontSize: "clamp(1rem, 2.2vh, 1.3rem)" }}>
                {copy.destinationLoading}
              </p>
            ) : null}
            {destinations.status === "error" ? (
              <div className="grid gap-2">
                <p className="font-medium" style={{ color: theme.danger, fontSize: "clamp(1rem, 2.2vh, 1.3rem)" }}>
                  {copy.destinationError}
                </p>
                <KioskButton type="button" tone="white" onClick={onReloadDestinations}>
                  {copy.reload}
                </KioskButton>
              </div>
            ) : null}
            {destinations.status === "ready" && destinations.people.length === 0 ? (
              <p className="font-medium" style={{ color: theme.inkSoft, fontSize: "clamp(1rem, 2.2vh, 1.3rem)" }}>
                {copy.destinationEmpty}
              </p>
            ) : null}
            {destinations.status === "ready" && destinations.people.length > 0 ? (
              <div
                className="grid grid-cols-3 gap-2"
                role="group"
                aria-label={copy.mentionTarget}
              >
                {destinations.people.map((person) => (
                  <KioskButton
                    key={person.id}
                    type="button"
                    tone={destinationId === person.id ? "primary" : "white"}
                    aria-pressed={destinationId === person.id}
                    style={{ minHeight: "clamp(3rem, 7.5vh, 4.2rem)" }}
                    onClick={() => onDestination(person.id)}
                  >
                    <span style={{ fontSize: "clamp(1.05rem, 2.5vh, 1.45rem)", lineHeight: 1.25 }}>
                      {staffDisplayName(person.id, copy, person.name)}
                    </span>
                  </KioskButton>
                ))}
              </div>
            ) : null}
          </div>
          <p className="text-center font-medium" style={{ color: theme.inkSoft, fontSize: "clamp(0.95rem, 2vh, 1.15rem)" }}>
            {copy.generalRequired}
          </p>
        </div>
        <div className="kiosk-entry-gap" />
        <ChoicePhotos photos={mentionChoices} selectedId={destinationId} />
        <div className="kiosk-send-row">
          <KioskButton type="submit" className="kiosk-send" disabled={!ready}>
            {copy.send}
          </KioskButton>
        </div>
      </form>
    </KioskFrame>
  );
}

export function DestinationScreen({
  status,
  people,
  onChoose,
  onBack,
  onReload,
}: {
  status: "loading" | "ready" | "error";
  people: Array<{ id: string; name: string }>;
  onChoose: (id: string) => void;
  onBack: () => void;
  onReload: () => void;
}) {
  const copy = useKioskCopy();
  const scroll = people.length > 4;
  return (
    <KioskFrame title={copy.destinationTitle}>
      <div className="grid min-h-0 flex-1 grid-rows-[1fr_auto] gap-3">
        {status === "loading" ? (
          <p className="grid place-items-center text-center font-bold" style={{ fontSize: "clamp(1.3rem, 3vh, 2rem)" }}>
            {copy.destinationLoading}
          </p>
        ) : null}
        {status === "error" ? (
          <div className="grid content-center gap-4">
            <p className="text-center font-bold" style={{ color: theme.danger, fontSize: "clamp(1.2rem, 3vh, 1.8rem)" }}>
              {copy.destinationError}
            </p>
            <KioskButton tone="white" onClick={onReload}>
              {copy.reload}
            </KioskButton>
          </div>
        ) : null}
        {status === "ready" && people.length === 0 ? (
          <p className="grid place-items-center text-center font-bold" style={{ fontSize: "clamp(1.2rem, 3vh, 1.8rem)" }}>
            {copy.destinationEmpty}
          </p>
        ) : null}
        {status === "ready" && people.length > 0 ? (
          <div
            className={scroll ? "flex min-h-0 flex-col gap-3 overflow-auto" : "grid min-h-0 gap-3"}
            style={scroll ? undefined : { gridTemplateRows: `repeat(${people.length}, minmax(0, 1fr))` }}
          >
            {people.map((person) => (
              <KioskButton key={person.id} tone="white" onClick={() => onChoose(person.id)}>
                {staffDisplayName(person.id, copy, person.name)}
              </KioskButton>
            ))}
          </div>
        ) : null}
        <KioskButton tone="ghost" onClick={onBack}>
          {copy.back}
        </KioskButton>
      </div>
    </KioskFrame>
  );
}

export function InterviewScreen({
  visitorName,
  purpose,
  ready,
  onVisitorName,
  onPurpose,
  onBack,
  onSubmit,
}: {
  visitorName: string;
  purpose: string;
  ready: boolean;
  onVisitorName: (value: string) => void;
  onPurpose: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const copy = useKioskCopy();
  const purposeLabel = {
    interview: copy.purposeInterview,
    briefing: copy.purposeBriefing,
  } as const;
  return (
    <KioskFrame title={copy.interviewTitle} prominentTitle>
      <CornerArrowButton label={copy.back} onClick={onBack} />
      <form
        className="kiosk-entry"
        onSubmit={(event) => {
          event.preventDefault();
          if (ready) onSubmit();
        }}
      >
        <div className="kiosk-entry-gap" />
        <div className="kiosk-entry-fields grid gap-[clamp(1.35rem,3.6vh,2.15rem)]">
          <KioskField
            id="interviewName"
            label={copy.visitorName}
            value={visitorName}
            placeholder={copy.visitorPlaceholder}
            autoComplete="name"
            onChange={(event) => onVisitorName(event.target.value)}
          />
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3" role="group" aria-label={copy.interviewTitle}>
              {interviewPurposes.map((item) => (
                <KioskButton
                  key={item.id}
                  type="button"
                  tone={purpose === item.id ? "primary" : "white"}
                  aria-pressed={purpose === item.id}
                  onClick={() => onPurpose(item.id)}
                >
                  {purposeLabel[item.id]}
                </KioskButton>
              ))}
            </div>
            <p className="text-center font-medium" style={{ color: theme.inkSoft, fontSize: "clamp(0.95rem, 2vh, 1.15rem)" }}>
              {copy.interviewRequired}
            </p>
          </div>
        </div>
        <div className="kiosk-entry-gap" />
        <ChoicePhotos photos={interviewPurposes} selectedId={purpose} />
        <div className="kiosk-send-row">
          <KioskButton type="submit" className="kiosk-send" disabled={!ready}>
            {copy.send}
          </KioskButton>
        </div>
      </form>
    </KioskFrame>
  );
}

export function SendingScreen() {
  const copy = useKioskCopy();
  return (
    <section className="grid h-full place-items-center px-8 text-center" aria-live="polite" aria-busy="true">
      <p className="font-bold" style={{ color: theme.ink, fontSize: "clamp(1.8rem, 5vh, 3rem)", whiteSpace: "nowrap" }}>
        {copy.sending}
        <span className="kiosk-loading-dots" aria-hidden="true">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </p>
    </section>
  );
}

export function CompleteScreen({ onReturn }: { onReturn: () => void }) {
  const copy = useKioskCopy();
  return (
    <button
      type="button"
      className="grid h-full w-full place-items-center px-8 text-center"
      aria-live="polite"
      onClick={onReturn}
    >
      <span className="grid justify-items-center gap-6">
        <span
          aria-hidden
          className="grid size-24 place-items-center rounded-full text-5xl font-bold"
          style={{ background: theme.white, color: theme.amberDeep }}
        >
          ✓
        </span>
        <h1 className="font-bold" style={{ color: theme.ink, fontSize: "clamp(2rem, 6vh, 3.5rem)" }}>
          {copy.thanks}
        </h1>
        <p
          className="font-medium"
          style={{ color: theme.ink, fontSize: "clamp(1.25rem, 3.2vh, 1.85rem)", lineHeight: 1.45 }}
        >
          {copy.thanksWait.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
        <p className="font-medium" style={{ color: theme.inkSoft, fontSize: "clamp(1.1rem, 2.6vh, 1.5rem)" }}>
          {copy.thanksHint}
        </p>
      </span>
    </button>
  );
}

export function ErrorScreen({ onRetry, onHome }: { onRetry: () => void; onHome: () => void }) {
  const copy = useKioskCopy();
  return (
    <KioskFrame title={copy.errorTitle}>
      <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] gap-4 landscape:grid-rows-[auto_1fr]">
        <p
          className="text-center font-medium"
          style={{ color: theme.ink, fontSize: "clamp(1.15rem, 2.8vh, 1.6rem)" }}
          aria-live="polite"
        >
          {copy.errorBody}
        </p>
        <div className="grid min-h-0 grid-rows-2 gap-4 landscape:grid-cols-2 landscape:grid-rows-1">
          <KioskButton onClick={onRetry}>{copy.retry}</KioskButton>
          <KioskButton tone="danger" onClick={onHome}>
            {copy.homeFromError}
          </KioskButton>
        </div>
      </div>
    </KioskFrame>
  );
}
