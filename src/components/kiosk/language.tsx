"use client";

import { copyEn, copyJa, theme, type UiCopy } from "@/config/reception";
import { createContext, useContext, useEffect, type ReactNode } from "react";

export type KioskLanguage = "ja" | "en";

const LanguageContext = createContext<{
  language: KioskLanguage;
  setLanguage: (language: KioskLanguage) => void;
  copy: UiCopy;
} | null>(null);

export function LanguageProvider({
  language,
  setLanguage,
  children,
}: {
  language: KioskLanguage;
  setLanguage: (language: KioskLanguage) => void;
  children: ReactNode;
}) {
  useEffect(() => {
    document.documentElement.lang = language === "ja" ? "ja" : "en";
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, copy: language === "en" ? copyEn : copyJa }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useKioskCopy(): UiCopy {
  return useContext(LanguageContext)?.copy ?? copyJa;
}

export function LanguageToggle() {
  const value = useContext(LanguageContext);
  const language = value?.language ?? "ja";
  const setLanguage = value?.setLanguage ?? (() => undefined);
  const options = [
    { id: "ja" as const, label: "日本語" },
    { id: "en" as const, label: "EN" },
  ];

  return (
    <div
      className="kiosk-lang absolute z-30 flex gap-1"
      role="group"
      aria-label={language === "ja" ? "言語" : "Language"}
    >
      {options.map((option) => {
        const selected = language === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => setLanguage(option.id)}
            className="rounded-full border-2 font-semibold"
            style={{
              background: selected ? theme.amber : theme.white,
              color: selected ? theme.white : theme.ink,
              borderColor: selected ? theme.amberDeep : theme.line,
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
