import { useEffect, useMemo, useState } from "react";
import { Award } from "./api";
import { Card } from "./components/Card";
import { Empty, ErrorState, Loading } from "./components/States";
import { api } from "./api";
import { useAsync } from "./hooks";
import { CareerGuide } from "./views/CareerGuide";
import { ContractorDetail } from "./views/ContractorDetail";
import { InternshipTimeline } from "./views/InternshipTimeline";
import { Matrix } from "./views/Matrix";
import { MyProfile } from "./views/MyProfile";
import { PatentTimeline } from "./views/PatentTimeline";
import { RecentAwards } from "./views/RecentAwards";
import { SchoolPlanner } from "./views/SchoolPlanner";
import { Solicitations } from "./views/Solicitations";
import { fmtUSDCompact } from "./format";

const LS_WATCHLIST = "sentinel_watchlist";

function loadWatchlist(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_WATCHLIST);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export default function App() {
  const [selectedContractor, setSelectedContractor] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<Set<string>>(loadWatchlist);

  const contractorData = useAsync(
    () => (selectedContractor ? api.contractor(selectedContractor) : Promise.resolve(null)),
    [selectedContractor],
  );

  const aggregates = useAsync(() => api.aggregates(), []);
  const awards = useAsync(() => api.awards(200), []);
  const sols = useAsync(() => api.solicitations(30), []);
  const patents = useAsync(() => api.patents(300), []);
  const health = useAsync(() => api.health(), []);
  const recommendations = useAsync(() => api.recommendations(6), []);

  useEffect(() => {
    localStorage.setItem(LS_WATCHLIST, JSON.stringify([...watchlist]));
  }, [watchlist]);

  const toggleWatchlist = (contractor: string) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(contractor)) next.delete(contractor);
      else next.add(contractor);
      return next;
    });
  };

  const watchlistAwards = useMemo<Award[]>(() => {
    if (awards.status !== "ready" || watchlist.size === 0) return [];
    return awards.data
      .filter((a) => a.contractor && watchlist.has(a.contractor))
      .slice(0, 20);
  }, [awards, watchlist]);

  const totalContractDollars =
    aggregates.status === "ready"
      ? aggregates.data.matrix
          .flat()
          .reduce((acc, c) => acc + c.contract_amount, 0)
      : 0;
  const totalPatents =
    aggregates.status === "ready"
      ? aggregates.data.matrix.flat().reduce((acc, c) => acc + c.patent_count, 0)
      : 0;
  const totalOpenSols =
    aggregates.status === "ready"
      ? aggregates.data.matrix
          .flat()
          .reduce((acc, c) => acc + c.open_solicitations, 0)
      : 0;

  return (
    <div className="mx-auto flex min-h-full max-w-[1400px] flex-col gap-6 px-6 py-8">
      <Header healthOk={health.status === "ready" && health.data.ok} />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Contract dollars (tracked)" value={fmtUSDCompact(totalContractDollars)} />
        <Stat label="Patents indexed" value={String(totalPatents)} />
        <Stat label="Open solicitations" value={String(totalOpenSols)} />
      </section>

      <Card
        title="Contractor x technology"
        subtitle="Combined momentum across awards, patents, and open solicitations. Click a contractor name for details."
      >
        {aggregates.status === "loading" && <Loading />}
        {aggregates.status === "error" && <ErrorState error={aggregates.error} />}
        {aggregates.status === "ready" && (
          <Matrix
            data={aggregates.data}
            onContractorClick={setSelectedContractor}
            watchlist={watchlist}
            onWatchlistToggle={toggleWatchlist}
          />
        )}
      </Card>

      {selectedContractor && (
        <Card title={`Contractor deep-dive`} subtitle={selectedContractor}>
          {contractorData.status === "loading" && <Loading />}
          {contractorData.status === "error" && (
            <ErrorState error={contractorData.error} />
          )}
          {contractorData.status === "ready" && contractorData.data && (
            <ContractorDetail
              data={contractorData.data}
              onClose={() => setSelectedContractor(null)}
            />
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          title="Recent awards"
          subtitle="Top contracts by dollar amount."
          className="lg:col-span-2"
        >
          {awards.status === "loading" && <Loading />}
          {awards.status === "error" && <ErrorState error={awards.error} />}
          {awards.status === "ready" &&
            (awards.data.length === 0 ? (
              <Empty>No awards yet — run <code>python quickstart.py</code>.</Empty>
            ) : (
              <RecentAwards awards={awards.data} />
            ))}
        </Card>

        <Card
          title="Open solicitations"
          subtitle="Active SAM.gov opportunities."
        >
          {sols.status === "loading" && <Loading />}
          {sols.status === "error" && <ErrorState error={sols.error} />}
          {sols.status === "ready" &&
            (sols.data.length === 0 ? (
              <Empty>None yet — set SAM_API_KEY and run the ingest job.</Empty>
            ) : (
              <Solicitations items={sols.data} />
            ))}
        </Card>
      </div>

      <Card
        title="Patents over time"
        subtitle="Monthly patent grants per contractor (PatentsView)."
      >
        {patents.status === "loading" && <Loading />}
        {patents.status === "error" && <ErrorState error={patents.error} />}
        {patents.status === "ready" && <PatentTimeline patents={patents.data} />}
      </Card>

      <Card
        title="Career guide — Rutgers AAE"
        subtitle="Recommendations driven by live contract momentum. What to study, where to apply, and which labs to join."
      >
        {recommendations.status === "loading" && <Loading />}
        {recommendations.status === "error" && (
          <ErrorState error={recommendations.error} />
        )}
        {recommendations.status === "ready" && (
          <CareerGuide data={recommendations.data} />
        )}
      </Card>

      <Card
        title="School & major planner"
        subtitle="Find schools aligned with contract momentum, explore your major's defense value, and locate clubs at any school."
      >
        {recommendations.status === "loading" && <Loading />}
        {recommendations.status === "error" && (
          <ErrorState error={recommendations.error} />
        )}
        {recommendations.status === "ready" && (
          <SchoolPlanner
            topKeywords={recommendations.data.top_keywords}
            momentumScores={{}}
          />
        )}
      </Card>

      {watchlist.size > 0 && (
        <Card
          title="Watchlist"
          subtitle={`Recent awards from ${[...watchlist].join(", ")} — click ★ on the matrix to pin contractors`}
        >
          {watchlistAwards.length === 0 ? (
            <Empty>No awards yet for your watchlist contractors.</Empty>
          ) : (
            <RecentAwards awards={watchlistAwards} />
          )}
        </Card>
      )}

      <Card
        title="Internship & scholarship calendar"
        subtitle="Deadlines sorted from now — highlighted items match your top funded domains."
      >
        {recommendations.status === "ready" ? (
          <InternshipTimeline topKeywords={recommendations.data.top_keywords} />
        ) : (
          <InternshipTimeline topKeywords={[]} />
        )}
      </Card>

      <Card
        title="My profile"
        subtitle="Track your courses and find gaps in your resume vs. what contractors are funding."
      >
        {recommendations.status === "loading" && <Loading />}
        {recommendations.status === "error" && (
          <ErrorState error={recommendations.error} />
        )}
        {recommendations.status === "ready" && (
          <MyProfile skillsMap={recommendations.data.skills_map} />
        )}
      </Card>

      <footer className="pb-4 text-center text-[11px] text-ink-600">
        Sentinel - defense acquisition intelligence - data: USASpending, SAM.gov, PatentsView
      </footer>
    </div>
  );
}

function Header({ healthOk }: { healthOk: boolean }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-ink-800 pb-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ember-500/10 ring-1 ring-ember-500/30">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-ember-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4Z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Sentinel</h1>
          <p className="text-xs text-ink-500">
            Defense acquisition intelligence
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span
          className={
            "inline-block h-2 w-2 rounded-full " +
            (healthOk ? "bg-emerald-400" : "bg-rose-400")
          }
        />
        <span className="font-mono text-ink-400">
          {healthOk ? "api online" : "api offline"}
        </span>
      </div>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900/60 px-5 py-4">
      <div className="text-[11px] uppercase tracking-wider text-ink-500">
        {label}
      </div>
      <div className="mt-1 font-mono text-2xl text-ink-100">{value}</div>
    </div>
  );
}
