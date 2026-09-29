"use client";

import { theme } from "@/config/reception";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ComponentProps, CSSProperties, ReactNode } from "react";

type Tone = "primary" | "white" | "ghost" | "danger";

const toneStyle: Record<Tone, CSSProperties> = {
  primary: {
    background: theme.amber,
    color: theme.white,
    borderColor: theme.amberDeep,
  },
  white: {
    background: theme.white,
    color: theme.ink,
    borderColor: theme.line,
  },
  ghost: {
    background: "transparent",
    color: theme.ink,
    borderColor: theme.amberDeep,
  },
  danger: {
    background: theme.white,
    color: theme.danger,
    borderColor: theme.danger,
  },
};

export function KioskButton({
  tone = "primary",
  className,
  style,
  type = "button",
  ...props
}: ComponentProps<typeof Button> & { tone?: Tone }) {
  return (
    <Button
      type={type}
      className={cn("w-full rounded-3xl border-2 px-6 py-4 font-bold shadow-sm", className)}
      style={{
        whiteSpace: "normal",
        height: "auto",
        minHeight: "clamp(4.25rem, 14vh, 7rem)",
        fontSize: "clamp(1.35rem, 3.2vh, 2rem)",
        lineHeight: 1.25,
        boxShadow: "0 10px 28px rgba(224, 148, 18, 0.16)",
        ...toneStyle[tone],
        ...style,
      }}
      {...props}
    />
  );
}

export function KioskField({
  label,
  id,
  ...props
}: { label: string } & ComponentProps<typeof Input>) {
  return (
    <label htmlFor={id} className="flex min-h-0 flex-col justify-center gap-1">
      <span className="font-medium" style={{ color: theme.inkSoft, fontSize: "clamp(1rem, 2.2vh, 1.3rem)" }}>
        {label}
      </span>
      <Input
        id={id}
        className="rounded-2xl border-2 bg-white px-4 md:text-[clamp(1.25rem,2.6vh,1.7rem)]"
        style={{
          height: "clamp(3.25rem, 8vh, 4.5rem)",
          fontSize: "clamp(1.25rem, 2.6vh, 1.7rem)",
          borderColor: theme.line,
          color: theme.ink,
          background: theme.white,
        }}
        {...props}
      />
    </label>
  );
}

export function KioskFrame({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex h-full min-h-0 w-full flex-col overflow-hidden px-[clamp(1rem,3vw,2.5rem)] py-[clamp(0.6rem,2vh,1.35rem)]">
      <h1
        className="shrink-0 text-center font-bold"
        style={{ color: theme.ink, fontSize: "clamp(1.6rem, 4.2vh, 2.6rem)" }}
      >
        {title}
      </h1>
      <div className="mt-[clamp(0.45rem,1.6vh,1rem)] flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}
