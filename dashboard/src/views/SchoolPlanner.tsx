import { useEffect, useState } from "react";
import { MajorGuide, SchoolResult } from "../api";
import { api } from "../api";
import { Tag } from "../components/Tag";
import { Loading, ErrorState } from "../components/States";

const CANONICAL_KEYWORDS = [
  "hypersonics", "directed energy", "autonomy", "JADC2", "AI/ML", "cyber",
  "ISR", "electronic warfare", "space", "nuclear", "UAS", "VTOL", "propulsion",
  "stealth", "radar", "sonar", "logistics", "C2", "communications",
];

const LS_SCHOOL = "sentinel_school";
const LS_MAJOR = "sentinel_major";

type Tab = "school-search" | "major-guide" | "clubs";

const STRENGTH_LABEL: Record<string, { label: string; color: string }> = {
  top_5: { label: "Top 5", color: "text-ember-300 border-ember-500/40 bg-ember-500/10" },
  top_10: { label: "Top 10", color: "text-sky-300 border-sky-500/40 bg-sky-500/10" },
  regional: { label: "Strong Regional", color: "text-violet-300 border-violet-500/40 bg-violet-500/10" },
};

// Generic club templates — any school can have these; we guide users to find them
const GENERIC_CLUB_TEMPLATES = [
  {
    type: "AIAA Student Chapter",
    search: "site:aiaa.org OR [school] AIAA student chapter",
    why: "Every aerospace-connected school has one or can start one. Recruiting pipeline for every prime contractor. Find yours at aiaa.org/membership/students.",
    link: "https://www.aiaa.org/membership/students",
    keywords: ["hypersonics", "propulsion", "UAS", "space", "VTOL", "stealth"],
  },
  {
    type: "IEEE Student Branch",
    search: "[school] IEEE student branch",
    why: "IEEE branches at every engineering school. Working groups on robotics, communications, and signal processing map directly to defense EE roles.",
    link: "https://www.ieee.org/membership/students/index.html",
    keywords: ["radar", "electronic warfare", "communications", "cyber", "C2"],
  },
  {
    type: "Rocketry / High-Power Rocketry Club",
    search: "[school] rocketry club OR high power rocketry",
    why: "Hands-on propulsion and avionics. Competes in Spaceport America Cup. Direct experience that defense employers value.",
    link: "https://www.soundingrocket.org/",
    keywords: ["propulsion", "space", "UAS", "autonomy"],
  },
  {
    type: "Autonomous Vehicles / Robotics Club",
    search: "[school] autonomous vehicles robotics club",
    why: "Hands-on autonomy experience. Competitions include DARPA challenge spinoffs and NASA mining/robotics challenges.",
    link: "https://robonation.org/programs/",
    keywords: ["autonomy", "AI/ML", "UAS", "C2"],
  },
  {
    type: "Cybersecurity / CTF Club",
    search: "[school] cyber CTF club security",
    why: "CTF competitions translate directly to DoD cyber clearance pipelines. Many DoD agencies scout CTF leaderboards.",
    link: "https://ctftime.org/",
    keywords: ["cyber", "C2", "JADC2", "communications"],
  },
  {
    type: "Society of Women Engineers (SWE)",
    search: "[school] SWE society of women engineers",
    why: "Boeing, Lockheed, and Raytheon sponsor SWE heavily and use it as a recruiting pipeline. Open to all students as allies.",
    link: "https://swe.org/",
    keywords: ["hypersonics", "propulsion", "autonomy", "space", "UAS"],
  },
  {
    type: "ROTC Program (Air Force, Navy, Army)",
    search: "[school] AFROTC NROTC ROTC",
    why: "ROTC provides a direct path to officer commission + scholarship. AF ROTC specifically feeds into AFRL, Edwards AFB, and acquisition corps.",
    link: "https://www.afrotc.com/",
    keywords: ["hypersonics", "directed energy", "autonomy", "cyber", "space", "propulsion"],
  },
  {
    type: "National Defense Industrial Association (NDIA) Student Chapter",
    search: "[school] NDIA student chapter defense",
    why: "NDIA chapters connect students directly with defense industry professionals and hiring managers.",
    link: "https://www.ndia.org/",
    keywords: ["C2", "JADC2", "ISR", "logistics", "autonomy"],
  },
  {
    type: "Space Systems / CubeSat Club",
    search: "[school] cubesat space systems club",
    why: "Building and launching a real CubeSat is one of the fastest ways to get space engineering experience. Many compete in NASA CubeSat Launch Initiative.",
    link: "https://www.nasa.gov/smallsat-institute/",
    keywords: ["space", "ISR", "communications", "autonomy"],
  },
  {
    type: "Amateur Radio Club (HAM radio)",
    search: "[school] amateur radio club ARRL",
    why: "RF/spectrum hands-on experience. HAM license signals genuine EW/communications interest to defense EE employers.",
    link: "https://www.arrl.org/",
    keywords: ["communications", "electronic warfare", "radar", "C2"],
  },
];

export function SchoolPlanner({
  topKeywords,
  momentumScores,
}: {
  topKeywords: string[];
  momentumScores: Record<string, number>;
}) {
  const [tab, setTab] = useState<Tab>("school-search");
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(
    () => new Set(topKeywords.slice(0, 5)),
  );
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schools, setSchools] = useState<SchoolResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);

  const [selectedMajor, setSelectedMajor] = useState(
    () => localStorage.getItem(LS_MAJOR) ?? "",
  );
  const [majorGuide, setMajorGuide] = useState<MajorGuide | null>(null);
  const [majorLoading, setMajorLoading] = useState(false);
  const [majorError, setMajorError] = useState<string | null>(null);
  const [majors, setMajors] = useState<string[]>([]);

  const [mySchool, setMySchool] = useState(
    () => localStorage.getItem(LS_SCHOOL) ?? "",
  );

  useEffect(() => {
    api.majors().then((r) => setMajors(r.majors)).catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_MAJOR, selectedMajor);
    localStorage.setItem(LS_SCHOOL, mySchool);
  }, [selectedMajor, mySchool]);

  const toggleDomain = (kw: string) => {
    setSelectedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(kw)) next.delete(kw);
      else next.add(kw);
      return next;
    });
  };

  const runSchoolSearch = async () => {
    setSearchLoading(true);
    setSearchError(null);
    try {
      const result = await api.schoolPlanner([...selectedDomains], schoolQuery);
      setSchools(result.schools);
    } catch (e) {
      setSearchError(String(e));
    } finally {
      setSearchLoading(false);
    }
  };

  const loadMajorGuide = async (major: string) => {
    if (!major) return;
    setMajorLoading(true);
    setMajorError(null);
    try {
      const result = await api.majorGuide(major);
      setMajorGuide(result);
    } catch (e) {
      setMajorError(String(e));
    } finally {
      setMajorLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMajor) loadMajorGuide(selectedMajor);
  }, [selectedMajor]);

  const relevantClubTemplates = GENERIC_CLUB_TEMPLATES.filter((c) =>
    c.keywords.some((kw) => selectedDomains.has(kw) || topKeywords.includes(kw)),
  );

  return (
    <div className="flex flex-col gap-5">
      {/* School + major identity */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-wider text-ink-500">
            Your school
          </label>
          <input
            value={mySchool}
            onChange={(e) => setMySchool(e.target.value)}
            placeholder="e.g. Rutgers, Georgia Tech, MIT..."
            className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 placeholder-ink-600 focus:border-ember-500/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-wider text-ink-500">
            Your major
          </label>
          <select
            value={selectedMajor}
            onChange={(e) => setSelectedMajor(e.target.value)}
            className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 focus:border-ember-500/50 focus:outline-none"
          >
            <option value="">Select major...</option>
            {majors.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
            <option value="__other__">Other / Undecided</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-ink-800">
        {(
          [
            { id: "school-search" as Tab, label: "Find Schools" },
            { id: "major-guide" as Tab, label: "Major Guide" },
            { id: "clubs" as Tab, label: "Find Clubs" },
          ]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={
              "rounded-t-md border-b-2 px-3 py-2 text-xs font-medium transition-colors " +
              (tab === t.id
                ? "border-ember-500 text-ember-300"
                : "border-transparent text-ink-400 hover:text-ink-200")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "school-search" && (
        <SchoolSearchTab
          selectedDomains={selectedDomains}
          schoolQuery={schoolQuery}
          setSchoolQuery={setSchoolQuery}
          onToggleDomain={toggleDomain}
          onSearch={runSchoolSearch}
          loading={searchLoading}
          error={searchError}
          schools={schools}
          expandedSchool={expandedSchool}
          setExpandedSchool={setExpandedSchool}
          momentumScores={momentumScores}
          topKeywords={topKeywords}
        />
      )}

      {tab === "major-guide" && (
        <MajorGuideTab
          selectedMajor={selectedMajor}
          majorGuide={majorGuide}
          loading={majorLoading}
          error={majorError}
          topKeywords={topKeywords}
        />
      )}

      {tab === "clubs" && (
        <ClubsTab
          templates={relevantClubTemplates}
          mySchool={mySchool}
          topKeywords={topKeywords}
        />
      )}
    </div>
  );
}

function SchoolSearchTab({
  selectedDomains,
  schoolQuery,
  setSchoolQuery,
  onToggleDomain,
  onSearch,
  loading,
  error,
  schools,
  expandedSchool,
  setExpandedSchool,
  momentumScores,
  topKeywords,
}: {
  selectedDomains: Set<string>;
  schoolQuery: string;
  setSchoolQuery: (s: string) => void;
  onToggleDomain: (kw: string) => void;
  onSearch: () => void;
  loading: boolean;
  error: string | null;
  schools: SchoolResult[];
  expandedSchool: string | null;
  setExpandedSchool: (s: string | null) => void;
  momentumScores: Record<string, number>;
  topKeywords: string[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-ink-400">
        Select the defense tech domains you want to focus on — Sentinel ranks schools by how well their research aligns with current contract momentum in those areas.
      </p>

      {/* Domain selector */}
      <div>
        <div className="mb-2 text-[11px] uppercase tracking-wider text-ink-500">
          Filter by domain (top-funded highlighted)
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CANONICAL_KEYWORDS.map((kw) => {
            const isTop = topKeywords.includes(kw);
            const selected = selectedDomains.has(kw);
            return (
              <button
                key={kw}
                onClick={() => onToggleDomain(kw)}
                className={
                  "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors " +
                  (selected
                    ? isTop
                      ? "border-ember-500/60 bg-ember-500/20 text-ember-200"
                      : "border-sky-500/40 bg-sky-500/10 text-sky-200"
                    : "border-ink-700 text-ink-500 hover:border-ink-500 hover:text-ink-300")
                }
              >
                {isTop && selected && <span className="mr-1">★</span>}
                {kw}
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional school name filter */}
      <div className="flex gap-2">
        <input
          value={schoolQuery}
          onChange={(e) => setSchoolQuery(e.target.value)}
          placeholder="Filter by school name (optional)"
          className="flex-1 rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 placeholder-ink-600 focus:border-ember-500/50 focus:outline-none"
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
        />
        <button
          onClick={onSearch}
          disabled={selectedDomains.size === 0}
          className="rounded-lg border border-ember-500/40 bg-ember-500/10 px-4 py-2 text-sm font-medium text-ember-300 transition hover:bg-ember-500/20 disabled:opacity-40"
        >
          Search
        </button>
      </div>

      {loading && <Loading />}
      {error && <ErrorState error={new Error(error)} />}

      {schools.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="text-[11px] text-ink-500">
            {schools.length} school{schools.length !== 1 ? "s" : ""} found — sorted by contract momentum alignment
          </div>
          {schools.map((s, i) => (
            <SchoolCard
              key={s.name}
              school={s}
              rank={i + 1}
              expanded={expandedSchool === s.name}
              onToggle={() =>
                setExpandedSchool(expandedSchool === s.name ? null : s.name)
              }
            />
          ))}
        </div>
      )}

      {!loading && schools.length === 0 && selectedDomains.size > 0 && (
        <p className="py-4 text-center text-sm text-ink-500">
          Click Search to find schools aligned with your selected domains.
        </p>
      )}
    </div>
  );
}

function SchoolCard({
  school,
  rank,
  expanded,
  onToggle,
}: {
  school: SchoolResult;
  rank: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const strength = STRENGTH_LABEL[school.defense_strength] ?? STRENGTH_LABEL.regional;

  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900/40 overflow-hidden">
      <button className="flex w-full items-start gap-3 p-4 text-left" onClick={onToggle}>
        <div className="font-mono text-lg text-ember-500 w-6 shrink-0">#{rank}</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-ink-100">{school.name}</span>
            <span
              className={
                "rounded-full border px-2 py-0.5 text-[10px] font-medium " + strength.color
              }
            >
              {strength.label}
            </span>
          </div>
          <div className="text-[11px] text-ink-500">{school.location}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {school.matched_keywords.map((kw) => (
              <Tag key={kw} tone="ember">{kw}</Tag>
            ))}
          </div>
        </div>
        <span className="shrink-0 text-ink-500 text-xs pt-1">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="border-t border-ink-800 px-4 pb-4 pt-3 flex flex-col gap-3">
          <p className="text-xs text-ink-300">{school.why}</p>

          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div>
              <div className="mb-1 text-[10px] uppercase tracking-wider text-ink-500">Notable programs</div>
              <ul className="space-y-1">
                {school.notable_programs.map((p) => (
                  <li key={p} className="text-ink-300">• {p}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-1 text-[10px] uppercase tracking-wider text-ink-500">Strong majors</div>
              <ul className="space-y-1">
                {school.strong_majors.map((m) => (
                  <li key={m} className="text-ink-300">• {m}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-ink-800 px-3 py-2 text-xs">
            <div className="mb-1 text-[10px] uppercase tracking-wider text-ink-500">Defense connections</div>
            <p className="text-ink-300">{school.defense_connections}</p>
          </div>

          <a
            href={school.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium text-ember-400 hover:text-ember-300 hover:underline"
          >
            Visit {school.name} →
          </a>
        </div>
      )}
    </div>
  );
}

function MajorGuideTab({
  selectedMajor,
  majorGuide,
  loading,
  error,
  topKeywords,
}: {
  selectedMajor: string;
  majorGuide: MajorGuide | null;
  loading: boolean;
  error: string | null;
  topKeywords: string[];
}) {
  const [expandedKw, setExpandedKw] = useState<string | null>(null);

  if (!selectedMajor || selectedMajor === "__other__") {
    return (
      <p className="py-6 text-center text-sm text-ink-500">
        Select your major above to see a tailored guide.
      </p>
    );
  }

  if (loading) return <Loading />;
  if (error) return <ErrorState error={new Error(error)} />;
  if (!majorGuide) return null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-ink-300">{majorGuide.description}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {majorGuide.keywords.map((kw) => (
            <Tag key={kw} tone={topKeywords.includes(kw) ? "ember" : "default"}>
              {topKeywords.includes(kw) ? "★ " : ""}{kw}
            </Tag>
          ))}
        </div>
      </div>

      {/* Generic courses */}
      {majorGuide.skills[0]?.generic_courses && (
        <div>
          <div className="mb-2 text-[11px] uppercase tracking-wider text-ink-500">
            Core courses for defense relevance
          </div>
          <div className="flex flex-wrap gap-1.5">
            {majorGuide.skills[0].generic_courses.map((c) => (
              <span
                key={c}
                className="rounded-md border border-ink-700 bg-ink-800/50 px-2 py-1 text-xs text-ink-300"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Domain breakdown */}
      <div>
        <div className="mb-2 text-[11px] uppercase tracking-wider text-ink-500">
          Your domains — ranked by current contract momentum
        </div>
        <div className="divide-y divide-ink-800/60">
          {majorGuide.skills.map((s) => (
            <div key={s.keyword}>
              <button
                onClick={() => setExpandedKw(expandedKw === s.keyword ? null : s.keyword)}
                className="flex w-full items-center gap-3 py-2.5 text-left"
              >
                <span className="flex-1 text-sm font-medium text-ink-100">{s.keyword}</span>
                {topKeywords.includes(s.keyword) && (
                  <span className="text-[10px] text-ember-400 font-medium">★ hot right now</span>
                )}
                <span className="text-[11px] text-ink-500 font-mono">
                  {(s.momentum_score * 100).toFixed(0)}%
                </span>
                <span className="text-ink-500 text-xs">{expandedKw === s.keyword ? "▲" : "▼"}</span>
              </button>
              {expandedKw === s.keyword && (
                <div className="pb-3 pl-3 grid gap-3 sm:grid-cols-3 text-xs">
                  <div>
                    <div className="mb-1 text-[10px] uppercase tracking-wider text-ink-500">Skills</div>
                    <ul className="space-y-1">
                      {s.skills.map((sk) => <li key={sk} className="text-ink-300">• {sk}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="mb-1 text-[10px] uppercase tracking-wider text-ink-500">Tools</div>
                    <ul className="space-y-1">
                      {s.tools.map((t) => <li key={t} className="text-ink-300">• {t}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="mb-1 text-[10px] uppercase tracking-wider text-ink-500">Why it matters</div>
                    <p className="text-ink-400">{s.why}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Top schools for this major */}
      {majorGuide.top_schools.length > 0 && (
        <div>
          <div className="mb-2 text-[11px] uppercase tracking-wider text-ink-500">
            Top schools for {selectedMajor} in defense
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {majorGuide.top_schools.slice(0, 6).map((s) => {
              const strength = STRENGTH_LABEL[s.defense_strength] ?? STRENGTH_LABEL.regional;
              return (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-1 rounded-lg border border-ink-800 bg-ink-900/30 p-3 transition hover:border-ink-600"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink-100">{s.name}</span>
                    <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${strength.color}`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-500">{s.location}</div>
                  <p className="text-[11px] text-ink-400 line-clamp-2">{s.why}</p>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ClubsTab({
  templates,
  mySchool,
  topKeywords,
}: {
  templates: typeof GENERIC_CLUB_TEMPLATES;
  mySchool: string;
  topKeywords: string[];
}) {
  const school = mySchool || "your school";

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-ink-400">
        These club types exist at virtually every engineering school. Use the search links to find yours — or start one if it doesn't exist (starting a club as a freshman is itself a major resume differentiator).
      </p>

      {!mySchool && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-300">
          Enter your school name above to personalize the search links.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {templates.map((t) => {
          const searchQuery = t.search.replace("[school]", school);
          const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
          const isTopAligned = t.keywords.some((kw) => topKeywords.includes(kw));

          return (
            <div
              key={t.type}
              className={
                "flex flex-col gap-2 rounded-xl border p-4 " +
                (isTopAligned
                  ? "border-ember-500/30 bg-ember-500/5"
                  : "border-ink-800 bg-ink-900/30")
              }
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium text-ink-100">{t.type}</span>
                {isTopAligned && (
                  <span className="shrink-0 text-[10px] font-medium text-ember-400">★ top domain</span>
                )}
              </div>
              <p className="text-xs text-ink-400">{t.why}</p>
              <div className="flex flex-wrap gap-1">
                {t.keywords.slice(0, 4).map((kw) => (
                  <Tag key={kw} tone={topKeywords.includes(kw) ? "ember" : "default"}>{kw}</Tag>
                ))}
              </div>
              <div className="mt-auto flex gap-2 text-[11px]">
                <a
                  href={googleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ember-400 hover:text-ember-300 hover:underline"
                >
                  Find at {school} →
                </a>
                <span className="text-ink-700">·</span>
                <a
                  href={t.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink-400 hover:text-ink-200 hover:underline"
                >
                  National org →
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-ink-800 bg-ink-900/30 px-4 py-3">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
          Can't find one? Start it.
        </div>
        <p className="text-xs text-ink-400">
          Starting an AIAA or NDIA chapter as a freshman is a major differentiator — it shows initiative, leadership, and defense interest before you have work experience.
          Most require 5 students, a faculty advisor, and a short application to the national org.
        </p>
      </div>
    </div>
  );
}
