import clsx from "clsx";
import { Aggregates, MatrixCell, TrendCell } from "../api";
import { fmtUSDCompact } from "../format";

type CellKey = "contract_amount" | "patent_count" | "open_solicitations";

const KEYS: { key: CellKey; label: string; format: (n: number) => string }[] = [
  { key: "contract_amount", label: "Contracts", format: fmtUSDCompact },
  { key: "patent_count", label: "Patents", format: (n) => String(n) },
  { key: "open_solicitations", label: "Open RFPs", format: (n) => String(n) },
];

function maxOf(matrix: MatrixCell[][], key: CellKey): number {
  let max = 0;
  for (const row of matrix) {
    for (const cell of row) {
      const v = cell[key];
      if (v > max) max = v;
    }
  }
  return max;
}

function cellTotal(c: MatrixCell, maxes: Record<CellKey, number>): number {
  const a = maxes.contract_amount > 0 ? c.contract_amount / maxes.contract_amount : 0;
  const b = maxes.patent_count > 0 ? c.patent_count / maxes.patent_count : 0;
  const o = maxes.open_solicitations > 0 ? c.open_solicitations / maxes.open_solicitations : 0;
  return Math.min(1, Math.pow((a + b + o) / 3, 0.6));
}

export function Matrix({
  data,
  onContractorClick,
  watchlist,
  onWatchlistToggle,
}: {
  data: Aggregates;
  onContractorClick?: (contractor: string) => void;
  watchlist?: Set<string>;
  onWatchlistToggle?: (contractor: string) => void;
}) {
  const { contractors, tech_keywords, matrix } = data;

  const maxes: Record<CellKey, number> = {
    contract_amount: maxOf(matrix, "contract_amount"),
    patent_count: maxOf(matrix, "patent_count"),
    open_solicitations: maxOf(matrix, "open_solicitations"),
  };

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[760px] border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-ink-900/60 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">
              Contractor
            </th>
            {tech_keywords.map((k) => (
              <th
                key={k}
                className="px-2 py-2 text-left align-bottom text-[11px] font-medium uppercase tracking-wider text-ink-400"
              >
                <div className="rotate-[-30deg] origin-bottom-left whitespace-nowrap">
                  {k}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {contractors.map((c, i) => (
            <tr key={c} className="group">
              <th className="sticky left-0 z-10 bg-ink-900/60 px-3 py-2 text-left text-sm font-medium text-ink-100">
                <div className="flex items-center gap-1.5">
                  {onWatchlistToggle && (
                    <button
                      onClick={() => onWatchlistToggle(c)}
                      title={watchlist?.has(c) ? "Remove from watchlist" : "Add to watchlist"}
                      className={
                        "text-base leading-none transition-colors " +
                        (watchlist?.has(c)
                          ? "text-ember-400"
                          : "text-ink-700 hover:text-ink-400")
                      }
                    >
                      {watchlist?.has(c) ? "★" : "☆"}
                    </button>
                  )}
                  {onContractorClick ? (
                    <button
                      onClick={() => onContractorClick(c)}
                      className="text-left underline-offset-2 hover:text-ember-300 hover:underline transition-colors"
                    >
                      {c}
                    </button>
                  ) : (
                    c
                  )}
                </div>
              </th>
              {tech_keywords.map((kw, j) => {
                const cell = matrix[i][j];
                const trendCell: TrendCell | undefined = data.trend?.[i]?.[j];
                const t = cellTotal(cell, maxes);
                const has =
                  cell.contract_amount > 0 ||
                  cell.patent_count > 0 ||
                  cell.open_solicitations > 0;
                const delta = trendCell?.contract_amount_delta ?? 0;
                const trendArrow =
                  delta > 0.1 ? "▲" : delta < -0.1 ? "▼" : null;
                const trendColor =
                  delta > 0.1
                    ? "text-emerald-400"
                    : delta < -0.1
                      ? "text-rose-400"
                      : "";
                const tip = `${c} - ${kw}\nContracts: ${fmtUSDCompact(cell.contract_amount)}\nPatents: ${cell.patent_count}\nOpen RFPs: ${cell.open_solicitations}\n30-day trend: ${delta > 0 ? "+" : ""}${(delta * 100).toFixed(0)}%`;
                return (
                  <td key={kw} className="p-1 align-middle">
                    <div
                      title={tip}
                      className={clsx(
                        "relative flex h-12 min-w-[44px] flex-col items-center justify-center rounded-md border text-[10px] font-mono transition-transform",
                        has
                          ? "border-ember-500/30 text-ember-100 hover:scale-[1.04]"
                          : "border-ink-800 text-ink-600",
                      )}
                      style={{
                        background: has
                          ? `rgba(249, 115, 22, ${0.08 + 0.55 * t})`
                          : "rgba(255,255,255,0.01)",
                        boxShadow: has
                          ? `0 0 0 1px rgba(249,115,22,${0.18 + 0.4 * t}) inset`
                          : undefined,
                      }}
                    >
                      {has ? fmtUSDCompact(cell.contract_amount) : "-"}
                      {trendArrow && has && (
                        <span className={`text-[9px] leading-none ${trendColor}`}>
                          {trendArrow}
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <Legend keys={KEYS} maxes={maxes} />
    </div>
  );
}

function Legend({
  keys,
  maxes,
}: {
  keys: { key: CellKey; label: string; format: (n: number) => string }[];
  maxes: Record<CellKey, number>;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-400">
      <span className="text-[11px] uppercase tracking-wider text-ink-500">
        Color = combined momentum (contracts + patents + open RFPs)
      </span>
      <div className="flex items-center gap-2">
        <div className="h-3 w-24 rounded-sm bg-gradient-to-r from-ink-800 to-ember-500" />
        <span className="font-mono text-[11px] text-ink-500">low - high</span>
      </div>
      {keys.map((k) => (
        <span key={k.key} className="font-mono text-[11px]">
          max {k.label.toLowerCase()}: {k.format(maxes[k.key])}
        </span>
      ))}
    </div>
  );
}
