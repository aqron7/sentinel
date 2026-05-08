import { useEffect, useMemo, useState } from "react";
import { SkillEntry } from "../api";
import { Tag } from "../components/Tag";

const LS_COURSES = "sentinel_my_courses";
const LS_NAME = "sentinel_my_name";

type Tab = "courses" | "gap";

function loadCourses(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_COURSES);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveCourses(courses: Set<string>) {
  localStorage.setItem(LS_COURSES, JSON.stringify([...courses]));
}

export function MyProfile({ skillsMap }: { skillsMap: SkillEntry[] }) {
  const [tab, setTab] = useState<Tab>("courses");
  const [myCourses, setMyCourses] = useState<Set<string>>(loadCourses);
  const [myName, setMyName] = useState(
    () => localStorage.getItem(LS_NAME) ?? "",
  );
  const [resumeText, setResumeText] = useState("");
  const [analyzed, setAnalyzed] = useState(false);

  useEffect(() => {
    saveCourses(myCourses);
  }, [myCourses]);

  useEffect(() => {
    localStorage.setItem(LS_NAME, myName);
  }, [myName]);

  const toggleCourse = (course: string) => {
    setMyCourses((prev) => {
      const next = new Set(prev);
      if (next.has(course)) next.delete(course);
      else next.add(course);
      return next;
    });
  };

  // Compute coverage: which tech domains do my courses cover?
  const coverage = useMemo(() => {
    return skillsMap.map((s) => {
      const taken = s.courses.filter((c) => myCourses.has(c));
      return {
        keyword: s.keyword,
        momentum_score: s.momentum_score,
        total: s.courses.length,
        taken: taken.length,
        pct: s.courses.length > 0 ? taken.length / s.courses.length : 0,
        missing: s.courses.filter((c) => !myCourses.has(c)),
      };
    });
  }, [skillsMap, myCourses]);

  // All unique courses sorted by how many domains they cover
  const allCourses = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const s of skillsMap) {
      for (const c of s.courses) {
        if (!map.has(c)) map.set(c, []);
        map.get(c)!.push(s.keyword);
      }
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [skillsMap]);

  // Resume keyword gap analysis
  const gapAnalysis = useMemo(() => {
    if (!resumeText) return null;
    const lower = resumeText.toLowerCase();
    const present: string[] = [];
    const missing: string[] = [];
    for (const s of skillsMap) {
      const found =
        lower.includes(s.keyword.toLowerCase()) ||
        s.skills.some((sk) => lower.includes(sk.toLowerCase())) ||
        s.tools.some((t) => lower.includes(t.toLowerCase()));
      if (found) present.push(s.keyword);
      else missing.push(s.keyword);
    }
    return { present, missing };
  }, [resumeText, skillsMap, analyzed]); // eslint-disable-line react-hooks/exhaustive-deps

  const topGaps = gapAnalysis?.missing
    .slice()
    .sort(
      (a, b) =>
        (skillsMap.find((s) => s.keyword === b)?.momentum_score ?? 0) -
        (skillsMap.find((s) => s.keyword === a)?.momentum_score ?? 0),
    )
    .slice(0, 6) ?? [];

  return (
    <div className="flex flex-col gap-4">
      {/* Name input */}
      <div className="flex items-center gap-3">
        <input
          value={myName}
          onChange={(e) => setMyName(e.target.value)}
          placeholder="Your name (used in email templates)"
          className="flex-1 rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 placeholder-ink-600 focus:border-ember-500/50 focus:outline-none"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-ink-800">
        {(["courses", "gap"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "rounded-t-md border-b-2 px-3 py-2 text-xs font-medium transition-colors " +
              (tab === t
                ? "border-ember-500 text-ember-300"
                : "border-transparent text-ink-400 hover:text-ink-200")
            }
          >
            {t === "courses" ? "Course Tracker" : "Resume / LinkedIn Gap"}
          </button>
        ))}
      </div>

      {tab === "courses" && (
        <CoursesTab
          allCourses={allCourses}
          myCourses={myCourses}
          coverage={coverage}
          onToggle={toggleCourse}
        />
      )}

      {tab === "gap" && (
        <GapTab
          resumeText={resumeText}
          onTextChange={(t) => { setResumeText(t); setAnalyzed(false); }}
          onAnalyze={() => setAnalyzed(true)}
          gapAnalysis={gapAnalysis}
          topGaps={topGaps}
          skillsMap={skillsMap}
          myName={myName}
        />
      )}
    </div>
  );
}

function CoursesTab({
  allCourses,
  myCourses,
  coverage,
  onToggle,
}: {
  allCourses: [string, string[]][];
  myCourses: Set<string>;
  coverage: { keyword: string; momentum_score: number; total: number; taken: number; pct: number; missing: string[] }[];
  onToggle: (c: string) => void;
}) {
  const takenCount = myCourses.size;
  const totalCount = allCourses.length;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-ink-400">
        Check courses you've taken or are currently taking. Sentinel maps them to defense tech domains and shows your coverage gaps.
      </p>

      {/* Coverage heatmap */}
      {takenCount > 0 && (
        <div>
          <div className="mb-2 text-[11px] uppercase tracking-wider text-ink-500">
            Domain coverage ({takenCount} courses marked)
          </div>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {[...coverage]
              .sort((a, b) => b.momentum_score - a.momentum_score)
              .map((c) => (
                <div key={c.keyword} className="flex items-center gap-2">
                  <div className="w-24 shrink-0 text-right text-[11px] text-ink-400">
                    {c.keyword}
                  </div>
                  <div className="flex-1 rounded-full bg-ink-800 h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-ember-500 transition-all"
                      style={{ width: `${c.pct * 100}%` }}
                    />
                  </div>
                  <div className="w-10 text-[11px] text-ink-500 font-mono">
                    {c.taken}/{c.total}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Course checklist */}
      <div>
        <div className="mb-2 text-[11px] uppercase tracking-wider text-ink-500">
          All courses ({totalCount} total — check what you've taken)
        </div>
        <div className="grid gap-1 sm:grid-cols-2">
          {allCourses.map(([course, domains]) => (
            <label
              key={course}
              className={
                "flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 transition-colors " +
                (myCourses.has(course)
                  ? "border-ember-500/40 bg-ember-500/10"
                  : "border-ink-800 bg-ink-900/30 hover:border-ink-700")
              }
            >
              <input
                type="checkbox"
                checked={myCourses.has(course)}
                onChange={() => onToggle(course)}
                className="mt-0.5 accent-orange-500"
              />
              <div className="min-w-0">
                <div className="text-xs text-ink-200 leading-snug">{course}</div>
                <div className="mt-0.5 flex flex-wrap gap-1">
                  {domains.slice(0, 3).map((d) => (
                    <Tag key={d} tone="default">{d}</Tag>
                  ))}
                  {domains.length > 3 && (
                    <span className="text-[10px] text-ink-600">+{domains.length - 3}</span>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function GapTab({
  resumeText,
  onTextChange,
  onAnalyze,
  gapAnalysis,
  topGaps,
  skillsMap,
  myName,
}: {
  resumeText: string;
  onTextChange: (t: string) => void;
  onAnalyze: () => void;
  gapAnalysis: { present: string[]; missing: string[] } | null;
  topGaps: string[];
  skillsMap: SkillEntry[];
  myName: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-ink-400">
        Paste your resume or LinkedIn summary. Sentinel checks which defense tech keywords and skills are missing — ranked by current contract momentum.
      </p>
      <textarea
        value={resumeText}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Paste your resume or LinkedIn summary here..."
        rows={8}
        className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-200 placeholder-ink-600 focus:border-ember-500/50 focus:outline-none resize-none"
      />
      <button
        onClick={onAnalyze}
        disabled={!resumeText.trim()}
        className="self-start rounded-lg border border-ember-500/40 bg-ember-500/10 px-4 py-2 text-sm font-medium text-ember-300 transition hover:bg-ember-500/20 disabled:opacity-40"
      >
        Analyze gaps
      </button>

      {gapAnalysis && (
        <div className="flex flex-col gap-4">
          {/* Present */}
          {gapAnalysis.present.length > 0 && (
            <div>
              <div className="mb-2 text-[11px] uppercase tracking-wider text-emerald-500">
                Already covered ({gapAnalysis.present.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {gapAnalysis.present.map((kw) => (
                  <Tag key={kw} tone="emerald">{kw}</Tag>
                ))}
              </div>
            </div>
          )}

          {/* Missing — ranked by momentum */}
          {topGaps.length > 0 && (
            <div>
              <div className="mb-2 text-[11px] uppercase tracking-wider text-rose-400">
                Top gaps by contract momentum
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {topGaps.map((kw) => {
                  const sm = skillsMap.find((s) => s.keyword === kw);
                  return (
                    <div
                      key={kw}
                      className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-rose-200">{kw}</span>
                        <span className="text-[11px] text-ink-500 font-mono">
                          {((sm?.momentum_score ?? 0) * 100).toFixed(0)}% momentum
                        </span>
                      </div>
                      {sm && (
                        <>
                          <p className="mt-1 text-xs text-ink-400">{sm.why}</p>
                          <div className="mt-2 text-[11px] text-ink-500">
                            Add: {sm.skills.slice(0, 2).join(", ")}
                            {sm.tools.length > 0 && ` · ${sm.tools[0]}`}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {gapAnalysis.missing.length === 0 && (
            <p className="text-sm text-emerald-400">
              Your resume covers all tracked tech domains.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
