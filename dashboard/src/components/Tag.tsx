import clsx from "clsx";
import { ReactNode } from "react";

type Tone = "default" | "ember" | "emerald" | "violet" | "sky" | "rose";

const TONES: Record<Tone, string> = {
  default: "bg-ink-800 text-ink-200 ring-ink-700",
  ember: "bg-ember-500/10 text-ember-300 ring-ember-500/30",
  emerald: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
  violet: "bg-violet-500/10 text-violet-300 ring-violet-500/30",
  sky: "bg-sky-500/10 text-sky-300 ring-sky-500/30",
  rose: "bg-rose-500/10 text-rose-300 ring-rose-500/30",
};

export function Tag({
  tone = "default",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function classificationTone(c: string | null | undefined): Tone {
  switch (c) {
    case "aircraft":
    case "missile":
      return "rose";
    case "space":
      return "violet";
    case "cyber":
    case "C2":
      return "sky";
    case "RDT&E":
      return "emerald";
    default:
      return "default";
  }
}

export function momentumTone(m: string | null | undefined): Tone {
  switch (m) {
    case "new_start":
      return "ember";
    case "follow_on":
      return "sky";
    case "maintenance":
      return "default";
    default:
      return "default";
  }
}
