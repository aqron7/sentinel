import { useEffect, useMemo, useState } from "react";
import { AsyncState } from "./hooks";
import { Aggregates, Award, ContractorDetail as ContractorDetailType, Recommendations, Solicitation, Patent } from "./api";
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
const LS_PAGE = "sentinel_page";

type Page = "home" | "intel";

function loadWatchlist(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_WATCHLIST);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export default function App() {
  const [page, setPage] = useState<Page>(
    () => (localStorage.getItem(LS_PAGE) as Page | null) ?? "home",
  );
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

  useEffect(() => {
    localStorage.setItem(LS_PAGE, page);
  }, [page]);

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

  const topKeywords =
    recommendations.status === "ready" ? recommendations.data.top_keywords : [];

  return (
    <div className="mx-auto flex min-h-full max-w-[1400px] flex-col gap-6 px-6 py-8">
      <Header
        healthOk={health.status === "ready" && health.data.ok}
        page={page}
        onPageChange={setPage}
      />

      {page === "home" && (
        <HomeDashboard topKeywords={topKeywords} />
      )}

      {page === "intel" && (
        <IntelDashboard
          aggregates={aggregates}
          awards={awards}
          sols={sols}
          patents={patents}
          recommendations={recommendations}
          contractorData={contractorData}
          selectedContractor={selectedContractor}
          setSelectedContractor={setSelectedContractor}
          watchlist={watchlist}
          toggleWatchlist={toggleWatchlist}
          watchlistAwards={watchlistAwards}
          totalContractDollars={totalContractDollars}
          totalPatents={totalPatents}
          totalOpenSols={totalOpenSols}
          topKeywords={topKeywords}
        />
      )}

      <footer className="pb-4 text-center text-[11px] text-ink-600">
        Sentinel · data: USASpending, SAM.gov, PatentsView
      </footer>
    </div>
  );
}

function HomeDashboard({ topKeywords }: { topKeywords: string[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-ink-100">School & Major Planner</h2>
        <p className="mt-1 text-sm text-ink-400">
          Find schools, explore any major, and discover clubs and opportunities — for every student at every school.
        </p>
      </div>

      <SchoolPlanner topKeywords={topKeywords} momentumScores={{}} />

      <Card
        title="Internship & scholarship calendar"
        subtitle="Deadlines sorted from now — highlighted items match top funded defense domains."
      >
        <InternshipTimeline topKeywords={topKeywords} />
      </Card>
    </div>
  );
}

function IntelDashboard({
  aggregates,
  awards,
  sols,
  patents,
  recommendations,
  contractorData,
  selectedContractor,
  setSelectedContractor,
  watchlist,
  toggleWatchlist,
  watchlistAwards,
  totalContractDollars,
  totalPatents,
  totalOpenSols,
  topKeywords,
}: {
  aggregates: AsyncState<Aggregates>;
  awards: AsyncState<Award[]>;
  sols: AsyncState<Solicitation[]>;
  patents: AsyncState<Patent[]>;
  recommendations: AsyncState<Recommendations>;
  contractorData: AsyncState<ContractorDetailType | null>;
  selectedContractor: string | null;
  setSelectedContractor: (v: string | null) => void;
  watchlist: Set<string>;
  toggleWatchlist: (c: string) => void;
  watchlistAwards: Award[];
  totalContractDollars: number;
  totalPatents: number;
  totalOpenSols: number;
  topKeywords: string[];
}) {
  return (
    <div className="flex flex-col gap-6">
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
        <Card title="Contractor deep-dive" subtitle={selectedContractor}>
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

        <Card title="Open solicitations" subtitle="Active SAM.gov opportunities.">
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
        title="Career guide — defense tech"
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
    </div>
  );
}

function Header({
  healthOk,
  page,
  onPageChange,
}: {
  healthOk: boolean;
  page: Page;
  onPageChange: (p: Page) => void;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-800 pb-5">
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
          <p className="text-xs text-ink-500">College & career planning · defense intelligence</p>
        </div>
      </div>

      {/* Page nav */}
      <nav className="flex rounded-lg border border-ink-800 bg-ink-900/60 p-1">
        <button
          onClick={() => onPageChange("home")}
          className={
            "rounded-md px-4 py-1.5 text-xs font-medium transition-colors " +
            (page === "home"
              ? "bg-ember-500/20 text-ember-300"
              : "text-ink-400 hover:text-ink-200")
          }
        >
          Home
        </button>
        <button
          onClick={() => onPageChange("intel")}
          className={
            "rounded-md px-4 py-1.5 text-xs font-medium transition-colors " +
            (page === "intel"
              ? "bg-ember-500/20 text-ember-300"
              : "text-ink-400 hover:text-ink-200")
          }
        >
          Defense Intel
        </button>
      </nav>

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
      <div className="text-[11px] uppercase tracking-wider text-ink-500">{label}</div>
      <div className="mt-1 font-mono text-2xl text-ink-100">{value}</div>
    </div>
  );
}
