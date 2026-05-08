import { useState } from "react";
import {
  ApplyNowItem,
  CareerTimelineItem,
  Club,
  Recommendations,
  RutgersLab,
  Scholarship,
  SkillEntry,
} from "../api";
import { Tag } from "../components/Tag";

const URGENCY_TONE: Record<string, string> = {
  "Do it this semester": "text-ember-300",
  "Apply December–January for summer": "text-sky-300",
  "Apply November–January for summer": "text-sky-300",
  "Apply December–February for summer": "text-sky-300",
  "Apply by February annually": "text-violet-300",
  "Apply in spring for next academic year": "text-violet-300",
  "Join Week 1 or 2 of semester": "text-ember-300",
};

type Tab = "apply" | "skills" | "labs" | "clubs" | "scholarships" | "timeline";

const TABS: { id: Tab; label: string }[] = [
  { id: "apply", label: "Apply Now" },
  { id: "skills", label: "Skills Map" },
  { id: "labs", label: "Rutgers Labs" },
  { id: "clubs", label: "Clubs" },
  { id: "scholarships", label: "Scholarships" },
  { id: "timeline", label: "4-Year Plan" },
];

export function CareerGuide({ data }: { data: Recommendations }) {
  const [tab, setTab] = useState<Tab>("apply");
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [expandedLab, setExpandedLab] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-5">
      {/* Top keyword signals */}
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-wider text-ink-500">
          Top funded domains right now — align your focus here
        </p>
        <div className="flex flex-wrap gap-2">
          {data.top_keywords.map((kw, i) => (
            <div
              key={kw}
              className="flex items-center gap-1.5 rounded-lg border border-ember-500/30 bg-ember-500/10 px-3 py-1.5"
            >
              <span className="font-mono text-[11px] text-ember-500">#{i + 1}</span>
              <span className="text-sm font-medium text-ember-200">{kw}</span>
              {data.top_contractors_by_keyword[kw]?.length > 0 && (
                <span className="text-[11px] text-ink-500">
                  · {data.top_contractors_by_keyword[kw].slice(0, 2).join(", ")}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 border-b border-ink-800 pb-0">
        {TABS.map((t) => (
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

      {/* Tab content */}
      <div>
        {tab === "apply" && <ApplyNowTab items={data.apply_now} />}
        {tab === "skills" && (
          <SkillsTab
            skills={data.skills_map}
            expanded={expandedSkill}
            onToggle={(kw) => setExpandedSkill(expandedSkill === kw ? null : kw)}
          />
        )}
        {tab === "labs" && (
          <LabsTab
            labs={data.rutgers_labs}
            expanded={expandedLab}
            onToggle={(n) => setExpandedLab(expandedLab === n ? null : n)}
          />
        )}
        {tab === "clubs" && <ClubsTab clubs={data.clubs} />}
        {tab === "scholarships" && <ScholarshipsTab items={data.scholarships} />}
        {tab === "timeline" && <TimelineTab items={data.career_timeline} />}
      </div>
    </div>
  );
}

function ApplyNowTab({ items }: { items: ApplyNowItem[] }) {
  const typeOrder = ["certification", "internship", "club", "scholarship", "funding"];
  const sorted = [...items].sort(
    (a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type),
  );
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {sorted.map((item) => (
        <div
          key={item.what}
          className="flex flex-col gap-2 rounded-xl border border-ink-800 bg-ink-900/40 p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <TypeBadge type={item.type} />
              <div className="mt-1 text-sm font-medium text-ink-100">{item.what}</div>
            </div>
          </div>
          <div
            className={
              "text-[11px] font-medium " +
              (URGENCY_TONE[item.urgency] ?? "text-ink-400")
            }
          >
            {item.urgency}
          </div>
          <div className="text-xs text-ink-400">{item.payoff}</div>
          <div className="text-[11px] text-ink-600">Effort: {item.effort}</div>
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto text-[11px] font-medium text-ember-400 hover:text-ember-300 hover:underline"
          >
            Apply →
          </a>
        </div>
      ))}
    </div>
  );
}

function SkillsTab({
  skills,
  expanded,
  onToggle,
}: {
  skills: SkillEntry[];
  expanded: string | null;
  onToggle: (kw: string) => void;
}) {
  return (
    <div className="flex flex-col divide-y divide-ink-800/60">
      {skills.map((s, i) => (
        <div key={s.keyword}>
          <button
            className="flex w-full items-center gap-3 py-3 text-left"
            onClick={() => onToggle(s.keyword)}
          >
            <span className="font-mono text-[11px] text-ember-500 w-4">
              #{i + 1}
            </span>
            <span className="flex-1 text-sm font-medium text-ink-100">
              {s.keyword}
            </span>
            <span className="text-[11px] text-ink-500">
              momentum {(s.momentum_score * 100).toFixed(0)}%
            </span>
            <span className="text-ink-500 text-xs">{expanded === s.keyword ? "▲" : "▼"}</span>
          </button>
          {expanded === s.keyword && (
            <div className="pb-4 pl-7 flex flex-col gap-3">
              <p className="text-xs text-ink-300">{s.why}</p>
              <div className="grid gap-3 sm:grid-cols-3 text-xs">
                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-ink-500">Rutgers courses</div>
                  <ul className="space-y-1">
                    {s.courses.map((c) => (
                      <li key={c} className="text-ink-300">• {c}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-ink-500">Skills to build</div>
                  <ul className="space-y-1">
                    {s.skills.map((sk) => (
                      <li key={sk} className="text-ink-300">• {sk}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-ink-500">Tools</div>
                  <ul className="space-y-1">
                    {s.tools.map((t) => (
                      <li key={t} className="text-ink-300">• {t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function LabsTab({
  labs,
  expanded,
  onToggle,
}: {
  labs: RutgersLab[];
  expanded: string | null;
  onToggle: (name: string) => void;
}) {
  if (labs.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-ink-500">
        No Rutgers labs match the current top domains — run ingest to populate data.
      </p>
    );
  }
  return (
    <div className="flex flex-col divide-y divide-ink-800/60">
      {labs.map((lab) => (
        <div key={lab.name}>
          <button
            className="flex w-full items-start gap-3 py-3 text-left"
            onClick={() => onToggle(lab.name)}
          >
            <div className="flex-1">
              <div className="text-sm font-medium text-ink-100">{lab.name}</div>
              <div className="text-[11px] text-ink-500">
                {lab.department} · {lab.faculty}
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {lab.relevant_keywords.map((kw) => (
                  <Tag key={kw} tone="ember">{kw}</Tag>
                ))}
              </div>
            </div>
            <span className="shrink-0 text-ink-500 text-xs pt-1">
              {expanded === lab.name ? "▲" : "▼"}
            </span>
          </button>
          {expanded === lab.name && (
            <div className="pb-4 pl-3 flex flex-col gap-3">
              <p className="text-xs text-ink-300">{lab.description}</p>
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                <div className="text-[10px] uppercase tracking-wider text-emerald-500 mb-1">Why apply as a freshman</div>
                <p className="text-xs text-emerald-200">{lab.why_apply}</p>
              </div>
              <div className="rounded-lg border border-ink-800 px-3 py-2">
                <div className="text-[10px] uppercase tracking-wider text-ink-500 mb-1">How to apply</div>
                <p className="text-xs text-ink-300">{lab.how_to_apply}</p>
              </div>
              <a
                href={lab.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-medium text-ember-400 hover:text-ember-300 hover:underline"
              >
                Lab website →
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ClubsTab({ clubs }: { clubs: Club[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {clubs.map((c) => (
        <div
          key={c.name}
          className="flex flex-col gap-2 rounded-xl border border-ink-800 bg-ink-900/40 p-4"
        >
          <div className="text-sm font-medium text-ink-100">{c.name}</div>
          <p className="text-xs text-ink-400">{c.description}</p>
          <div className="flex flex-wrap gap-1">
            {c.relevant_keywords.map((kw) => (
              <Tag key={kw}>{kw}</Tag>
            ))}
          </div>
          <div className="mt-auto rounded-md bg-ink-800/50 px-2 py-1.5 text-[11px] text-ink-400">
            <span className="font-medium text-ink-300">How to join: </span>
            {c.how_to_join}
          </div>
        </div>
      ))}
    </div>
  );
}

function ScholarshipsTab({ items }: { items: Scholarship[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((s) => (
        <div
          key={s.name}
          className="flex flex-col gap-2 rounded-xl border border-ink-800 bg-ink-900/40 p-4"
        >
          <div className="text-sm font-medium text-ink-100">{s.name}</div>
          <div className="text-[11px] text-ink-500">{s.sponsor}</div>
          <div className="font-mono text-base text-emerald-300">{s.amount}</div>
          <div className="text-xs text-ink-400">
            <span className="font-medium text-ink-300">Deadline: </span>
            {s.deadline_note}
          </div>
          <div className="flex flex-wrap gap-1">
            {s.relevant_keywords.slice(0, 4).map((kw) => (
              <Tag key={kw}>{kw}</Tag>
            ))}
          </div>
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto text-[11px] font-medium text-ember-400 hover:text-ember-300 hover:underline"
          >
            Apply →
          </a>
        </div>
      ))}
    </div>
  );
}

function TimelineTab({ items }: { items: CareerTimelineItem[] }) {
  return (
    <div className="relative flex flex-col gap-0 pl-6">
      <div className="absolute left-2 top-2 bottom-2 w-px bg-ink-800" />
      {items.map((item, i) => (
        <div key={item.year} className="relative pb-6">
          <div className="absolute -left-[18px] top-1 h-3 w-3 rounded-full border-2 border-ember-500 bg-ink-950" />
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ember-400">
            {item.year}
          </div>
          <div className="mt-1 text-sm text-ink-100">{item.action}</div>
          <div className="mt-1 text-xs text-ink-500">{item.rationale}</div>
          {i < items.length - 1 && <div className="mt-3 border-b border-ink-800/40" />}
        </div>
      ))}
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    certification: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
    internship: "bg-ember-500/10 text-ember-300 ring-ember-500/30",
    scholarship: "bg-violet-500/10 text-violet-300 ring-violet-500/30",
    funding: "bg-sky-500/10 text-sky-300 ring-sky-500/30",
    club: "bg-ink-800 text-ink-300 ring-ink-700",
  };
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ring-1 ring-inset " +
        (colors[type] ?? colors.club)
      }
    >
      {type}
    </span>
  );
}
