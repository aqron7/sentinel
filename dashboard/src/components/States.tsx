import { ReactNode } from "react";

export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-8 text-ink-400">
      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-ember-400" />
      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-ember-400 [animation-delay:120ms]" />
      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-ember-400 [animation-delay:240ms]" />
      <span className="ml-2 text-xs uppercase tracking-wider">{label}</span>
    </div>
  );
}

export function ErrorState({ error }: { error: string }) {
  return (
    <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 px-4 py-3 text-sm text-rose-300">
      <div className="font-semibold">Failed to load</div>
      <div className="mt-1 font-mono text-xs text-rose-400/80">{error}</div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-ink-700 bg-ink-900/40 px-4 py-8 text-center text-sm text-ink-400">
      {children}
    </div>
  );
}
