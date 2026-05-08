import { Solicitation } from "../api";
import { Tag, classificationTone } from "../components/Tag";
import { fmtDate } from "../format";

export function Solicitations({ items }: { items: Solicitation[] }) {
  return (
    <ul className="space-y-3">
      {items.map((s) => {
        const isNewStart =
          (s.summary ?? "").toLowerCase().includes("new start") ||
          s.classification === "RDT&E";
        return (
          <li
            key={s.id}
            className={
              "rounded-xl border bg-ink-900/40 p-4 transition hover:bg-ink-900/70 " +
              (isNewStart
                ? "border-ember-500/40 shadow-[0_0_0_1px_rgba(249,115,22,0.15)_inset]"
                : "border-ink-800")
            }
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-mono text-ink-500">
                  {s.agency || "—"}
                </div>
                <div className="mt-0.5 text-sm font-medium text-ink-100">
                  {s.title || "(untitled)"}
                </div>
              </div>
              <div className="shrink-0 text-right text-[11px] text-ink-500">
                <div>posted {fmtDate(s.posted_date)}</div>
                <div>due {fmtDate(s.response_deadline)}</div>
              </div>
            </div>
            {s.summary && (
              <p className="mt-2 text-xs text-ink-300">{s.summary}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {isNewStart && <Tag tone="ember">new start</Tag>}
              {s.classification && (
                <Tag tone={classificationTone(s.classification)}>
                  {s.classification}
                </Tag>
              )}
              {s.tech_keywords.slice(0, 5).map((k) => (
                <Tag key={k}>{k}</Tag>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
