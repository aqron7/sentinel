import { useMemo, useState } from "react";
import { Award } from "../api";
import { Tag, classificationTone, momentumTone } from "../components/Tag";
import { fmtDate, fmtUSD } from "../format";

type Sort = "amount" | "date" | "classification";

export function RecentAwards({ awards }: { awards: Award[] }) {
  const [sort, setSort] = useState<Sort>("amount");

  const rows = useMemo(() => {
    const a = awards.slice();
    if (sort === "amount") a.sort((x, y) => y.amount - x.amount);
    if (sort === "date")
      a.sort((x, y) =>
        (y.period_start ?? "").localeCompare(x.period_start ?? ""),
      );
    if (sort === "classification")
      a.sort((x, y) =>
        (x.classification ?? "zzz").localeCompare(y.classification ?? "zzz"),
      );
    return a;
  }, [awards, sort]);

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-xs">
        <span className="text-ink-500 uppercase tracking-wider">Sort</span>
        {(["amount", "date", "classification"] as Sort[]).map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={
              "rounded-md border px-2 py-1 font-medium transition " +
              (sort === s
                ? "border-ember-500/40 bg-ember-500/10 text-ember-200"
                : "border-ink-800 text-ink-400 hover:border-ink-700 hover:text-ink-200")
            }
          >
            {s}
          </button>
        ))}
      </div>

      <div className="divide-y divide-ink-800/80">
        {rows.map((a) => (
          <article key={a.id} className="grid grid-cols-12 gap-3 py-3">
            <div className="col-span-12 md:col-span-7">
              <div className="text-[11px] font-mono text-ink-500">
                {a.contractor ?? a.recipient}
                {a.agency ? ` - ${a.agency}` : ""}
              </div>
              <div className="mt-0.5 line-clamp-2 text-sm text-ink-100">
                {a.summary || a.description || "—"}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {a.classification && (
                  <Tag tone={classificationTone(a.classification)}>
                    {a.classification}
                  </Tag>
                )}
                {a.momentum_signal && (
                  <Tag tone={momentumTone(a.momentum_signal)}>
                    {a.momentum_signal.replace("_", " ")}
                  </Tag>
                )}
                {a.tech_keywords.slice(0, 4).map((k) => (
                  <Tag key={k}>{k}</Tag>
                ))}
                {a.tech_keywords.length > 4 && (
                  <span className="text-[11px] text-ink-500">
                    +{a.tech_keywords.length - 4}
                  </span>
                )}
              </div>
            </div>
            <div className="col-span-12 md:col-span-5 md:text-right">
              <div className="font-mono text-base text-ember-200">
                {fmtUSD(a.amount)}
              </div>
              <div className="text-[11px] text-ink-500">
                {fmtDate(a.period_start)}
              </div>
              <div className="mt-1 text-[11px] font-mono text-ink-600">
                {a.award_id}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
