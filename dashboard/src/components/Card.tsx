import clsx from "clsx";
import { ReactNode } from "react";

type CardProps = {
  title?: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Card({ title, subtitle, right, className, children }: CardProps) {
  return (
    <section
      className={clsx(
        "rounded-2xl border border-ink-800/80 bg-ink-900/60 backdrop-blur-sm",
        "shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]",
        className,
      )}
    >
      {(title || right) && (
        <header className="flex items-start justify-between gap-4 border-b border-ink-800/80 px-5 py-4">
          <div>
            {title && (
              <h2 className="text-sm font-semibold tracking-wide text-ink-100 uppercase">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-1 text-xs text-ink-400">{subtitle}</p>
            )}
          </div>
          {right && <div className="text-xs text-ink-400">{right}</div>}
        </header>
      )}
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}
