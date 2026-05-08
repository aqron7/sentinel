import { ContractorDetail as Detail } from "../api";
import { Tag, classificationTone, momentumTone } from "../components/Tag";
import { fmtDate, fmtUSD, fmtUSDCompact } from "../format";

export function ContractorDetail({
  data,
  onClose,
}: {
  data: Detail;
  onClose: () => void;
}) {
  const { contractor, summary, awards, patents, solicitations } = data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-ink-100">{contractor}</h2>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {summary.top_keywords.map((k) => (
              <Tag key={k} tone="ember">
                {k}
              </Tag>
            ))}
          </div>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-md border border-ink-800 px-3 py-1.5 text-xs text-ink-400 transition hover:border-ink-600 hover:text-ink-200"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatPill label="Contract $" value={fmtUSDCompact(summary.total_contract_dollars)} />
        <StatPill label="Awards" value={String(summary.award_count)} />
        <StatPill label="Patents" value={String(summary.patent_count)} />
        <StatPill label="Open RFPs" value={String(summary.open_solicitation_count)} />
      </div>

      {awards.length > 0 && (
        <section>
          <SectionHeader>Awards ({awards.length})</SectionHeader>
          <div className="divide-y divide-ink-800/80">
            {awards.slice(0, 20).map((a) => (
              <article key={a.id} className="grid grid-cols-12 gap-3 py-3">
                <div className="col-span-12 md:col-span-8">
                  <div className="text-[11px] font-mono text-ink-500">
                    {a.agency || "—"}
                  </div>
                  <div className="mt-0.5 line-clamp-2 text-sm text-ink-100">
                    {a.summary || a.description || "—"}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
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
                  </div>
                </div>
                <div className="col-span-12 md:col-span-4 md:text-right">
                  <div className="font-mono text-base text-ember-200">
                    {fmtUSD(a.amount)}
                  </div>
                  <div className="text-[11px] text-ink-500">
                    {fmtDate(a.period_start)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {patents.length > 0 && (
        <section>
          <SectionHeader>Patents ({patents.length})</SectionHeader>
          <div className="divide-y divide-ink-800/80">
            {patents.slice(0, 20).map((p) => (
              <article key={p.id} className="py-3">
                <div className="text-[11px] font-mono text-ink-500">
                  {p.patent_number} · {fmtDate(p.grant_date)}
                </div>
                <div className="mt-0.5 text-sm text-ink-100">{p.title}</div>
                {p.abstract && (
                  <div className="mt-1 line-clamp-2 text-xs text-ink-400">
                    {p.abstract}
                  </div>
                )}
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {p.tech_keywords.slice(0, 5).map((k) => (
                    <Tag key={k}>{k}</Tag>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {solicitations.length > 0 && (
        <section>
          <SectionHeader>Open solicitations ({solicitations.length})</SectionHeader>
          <div className="divide-y divide-ink-800/80">
            {solicitations.map((s) => (
              <article key={s.id} className="py-3">
                <div className="text-[11px] font-mono text-ink-500">
                  {s.agency || "—"} · posted {fmtDate(s.posted_date)}
                </div>
                <div className="mt-0.5 text-sm text-ink-100">{s.title}</div>
                {s.summary && (
                  <div className="mt-1 line-clamp-2 text-xs text-ink-400">
                    {s.summary}
                  </div>
                )}
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {s.classification && (
                    <Tag tone={classificationTone(s.classification)}>
                      {s.classification}
                    </Tag>
                  )}
                  {s.tech_keywords.slice(0, 4).map((k) => (
                    <Tag key={k}>{k}</Tag>
                  ))}
                  {s.response_deadline && (
                    <span className="text-[11px] text-ink-500">
                      due {fmtDate(s.response_deadline)}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {awards.length === 0 && patents.length === 0 && solicitations.length === 0 && (
        <p className="py-8 text-center text-sm text-ink-500">
          No data yet — run the ingest job to populate.
        </p>
      )}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900/40 px-4 py-3">
      <div className="text-[11px] uppercase tracking-wider text-ink-500">{label}</div>
      <div className="mt-0.5 font-mono text-lg text-ink-100">{value}</div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
      {children}
    </h3>
  );
}
