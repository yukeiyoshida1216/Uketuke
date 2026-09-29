"use client";

import { backgroundGradient, copy, interviewPurposes, theme, visitorCountChoices } from "@/config/reception";
import { KioskButton, KioskField, KioskFrame } from "@/components/kiosk/controls";

export function WelcomeScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <button
      type="button"
      onClick={onEnter}
      className="flex h-full w-full flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{
        background: backgroundGradient,
        color: theme.ink,
      }}
    >
      <span
        className="font-bold tracking-[0.14em]"
        style={{ color: theme.amberDeep, fontSize: "clamp(3.6rem, 11vh, 7rem)" }}
      >
        {copy.welcomeTitle}
      </span>
      <img
        src="/logo-mark.png"
        alt=""
        width={283}
        height={280}
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
        src="/logo-wordmark.png"
        alt="LIGHT PATH"
        width={252}
        height={87}
        decoding="sync"
        fetchPriority="high"
        className="mt-[clamp(0.15rem,0.8vh,0.45rem)] h-[min(8vh,4.4rem)] w-auto max-w-[min(64vw,16rem)] object-contain"
      />
      <span
        className="mt-[clamp(0.7rem,2.2vh,1.3rem)] font-medium"
        style={{ color: theme.yamabuki, fontSize: "clamp(1.35rem, 3.2vh, 2.15rem)" }}
      >
        {copy.welcomeSubtitle}
      </span>
    </button>
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
  const choices = [
    { label: copy.general, hint: copy.generalHint, onClick: onGeneral },
    { label: copy.interview, hint: copy.interviewHint, onClick: onInterview },
    { label: copy.other, hint: copy.otherHint, onClick: onOther },
  ];
  return (
    <KioskFrame title={copy.menuTitle}>
      <div className="grid min-h-0 flex-1 grid-rows-[1fr_1fr_1fr_auto] gap-[clamp(0.5rem,1.5vh,1rem)] landscape:grid-cols-3 landscape:grid-rows-[1fr_auto]">
        {choices.map((choice) => (
          <KioskButton key={choice.label} tone="white" onClick={choice.onClick} aria-label={choice.label}>
            <span className="flex flex-col items-center gap-2">
              <span style={{ fontSize: "clamp(2.15rem, 5.8vh, 3.6rem)", lineHeight: 1.2 }}>{choice.label}</span>
              <span className="font-medium" style={{ fontSize: "clamp(1.05rem, 2.6vh, 1.45rem)", color: theme.inkSoft }}>
                {choice.hint}
              </span>
            </span>
          </KioskButton>
        ))}
        <KioskButton tone="ghost" className="landscape:col-span-3" style={{ minHeight: "clamp(3.25rem, 8vh, 4.5rem)" }} onClick={onHome}>
          {copy.home}
        </KioskButton>
      </div>
    </KioskFrame>
  );
}

export function GeneralScreen({
  companyName,
  visitorName,
  visitorCount,
  ready,
  onCompanyName,
  onVisitorName,
  onVisitorCount,
  onBack,
  onNext,
}: {
  companyName: string;
  visitorName: string;
  visitorCount: string;
  ready: boolean;
  onCompanyName: (value: string) => void;
  onVisitorName: (value: string) => void;
  onVisitorCount: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <KioskFrame title={copy.generalTitle}>
      <form
        className="grid min-h-0 flex-1 grid-rows-[1fr_auto] gap-[clamp(0.45rem,1.5vh,1rem)] landscape:grid-cols-[minmax(0,1.5fr)_minmax(13rem,0.7fr)] landscape:grid-rows-1"
        onSubmit={(event) => {
          event.preventDefault();
          if (ready) onNext();
        }}
      >
        <div className="grid min-h-0 content-center gap-[clamp(0.4rem,1.3vh,0.85rem)]">
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
                  {choice.label}
                </KioskButton>
              ))}
            </div>
          </div>
          <p className="text-center font-medium" style={{ color: theme.inkSoft, fontSize: "clamp(0.95rem, 2vh, 1.15rem)" }}>
            {copy.generalRequired}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 landscape:grid-cols-1 landscape:content-end">
          <KioskButton type="button" tone="ghost" onClick={onBack}>
            {copy.back}
          </KioskButton>
          <KioskButton type="submit" disabled={!ready}>
            {copy.next}
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
                {person.name}
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
  return (
    <KioskFrame title={copy.interviewTitle}>
      <form
        className="grid min-h-0 flex-1 content-center gap-[clamp(0.6rem,2vh,1.2rem)] landscape:grid-cols-[minmax(0,1.4fr)_minmax(13rem,0.7fr)] landscape:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          if (ready) onSubmit();
        }}
      >
        <div className="grid gap-3">
          <KioskField
            id="interviewName"
            label={copy.visitorName}
            value={visitorName}
            placeholder={copy.visitorPlaceholder}
            autoComplete="name"
            onChange={(event) => onVisitorName(event.target.value)}
          />
          <div className="grid grid-cols-2 gap-3" role="group" aria-label={copy.interviewTitle}>
            {interviewPurposes.map((item) => (
              <KioskButton
                key={item.id}
                type="button"
                tone={purpose === item.id ? "primary" : "white"}
                aria-pressed={purpose === item.id}
                onClick={() => onPurpose(item.id)}
              >
                {item.label}
              </KioskButton>
            ))}
          </div>
          <p className="text-center font-medium" style={{ color: theme.inkSoft, fontSize: "clamp(0.95rem, 2vh, 1.15rem)" }}>
            {copy.interviewRequired}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 landscape:grid-cols-1">
          <KioskButton type="button" tone="ghost" onClick={onBack}>
            {copy.back}
          </KioskButton>
          <KioskButton type="submit" disabled={!ready}>
            {copy.send}
          </KioskButton>
        </div>
      </form>
    </KioskFrame>
  );
}

export function SendingScreen() {
  return (
    <section className="grid h-full place-items-center px-8 text-center" aria-live="polite" aria-busy="true">
      <p className="font-bold" style={{ color: theme.ink, fontSize: "clamp(1.8rem, 5vh, 3rem)" }}>
        {copy.sending}
      </p>
    </section>
  );
}

export function CompleteScreen({ onReturn }: { onReturn: () => void }) {
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
        <p className="font-medium" style={{ color: theme.inkSoft, fontSize: "clamp(1.1rem, 2.6vh, 1.5rem)" }}>
          {copy.thanksHint}
        </p>
      </span>
    </button>
  );
}

export function ErrorScreen({ onRetry, onHome }: { onRetry: () => void; onHome: () => void }) {
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
