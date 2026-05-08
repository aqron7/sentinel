import { useMemo } from "react";

type DeadlineType = "internship" | "scholarship" | "certification" | "fellowship" | "funding";

type Deadline = {
  name: string;
  type: DeadlineType;
  month: number;   // 1-12
  day: number;
  note: string;
  payoff: string;
  link: string;
  keywords: string[];
  freshman_eligible: boolean;
};

const DEADLINES: Deadline[] = [
  {
    name: "FAA Part 107 Remote Pilot Certificate",
    type: "certification",
    month: 8, day: 1,
    note: "Any time — do it before semester starts",
    payoff: "Instant resume line, legally fly UAS for research",
    link: "https://www.faa.gov/uas/commercial_operators/become_a_drone_pilot",
    keywords: ["UAS", "autonomy"],
    freshman_eligible: true,
  },
  {
    name: "Rutgers AIAA — Join",
    type: "funding",
    month: 9, day: 7,
    note: "Week 1–2 of fall semester",
    payoff: "Design competitions, industry speakers, recruiting pipeline",
    link: "https://aiaa.rutgers.edu",
    keywords: ["propulsion", "space", "UAS", "hypersonics"],
    freshman_eligible: true,
  },
  {
    name: "AFCEA Scholarship",
    type: "scholarship",
    month: 2, day: 1,
    note: "Apply February — freshman eligible",
    payoff: "$2,500–$5,000 + industry networking events",
    link: "https://www.afcea.org/scholarships",
    keywords: ["communications", "cyber", "C2", "radar"],
    freshman_eligible: true,
  },
  {
    name: "Brooke Owens Fellowship",
    type: "fellowship",
    month: 1, day: 15,
    note: "Apply January — sophomore/junior, women & gender minorities",
    payoff: "Paid aerospace internship + executive mentorship",
    link: "https://www.brookeowensfellowship.com",
    keywords: ["space", "UAS", "propulsion", "autonomy"],
    freshman_eligible: false,
  },
  {
    name: "AFRL Scholars Program",
    type: "internship",
    month: 12, day: 15,
    note: "Apply December–January for summer",
    payoff: "Paid DoD internship, clearance pipeline, WPAFB / other bases",
    link: "https://www.afrl.af.mil/Scholars/",
    keywords: ["hypersonics", "directed energy", "autonomy", "propulsion", "AI/ML"],
    freshman_eligible: true,
  },
  {
    name: "NRL NREIP Program",
    type: "internship",
    month: 11, day: 1,
    note: "Apply November–January via ASEE portal",
    payoff: "Paid federal internship at Naval Research Lab — radar, sonar, cyber, materials",
    link: "https://nreip.asee.org",
    keywords: ["radar", "sonar", "cyber", "directed energy", "electronic warfare"],
    freshman_eligible: true,
  },
  {
    name: "ARL SFFP / SREP",
    type: "internship",
    month: 12, day: 1,
    note: "Apply December–February via ASEE portal",
    payoff: "Army Research Lab — autonomy, propulsion, C2. Close to Rutgers (Adelphi, MD)",
    link: "https://www.arl.army.mil/opportunities/",
    keywords: ["autonomy", "propulsion", "C2", "AI/ML"],
    freshman_eligible: true,
  },
  {
    name: "Northrop Grumman Internship",
    type: "internship",
    month: 10, day: 1,
    note: "Apply October–December for summer",
    payoff: "Top defense prime — hypersonics, space, autonomy programs",
    link: "https://www.northropgrumman.com/careers/",
    keywords: ["hypersonics", "space", "autonomy", "ISR", "stealth"],
    freshman_eligible: false,
  },
  {
    name: "Raytheon / RTX Internship",
    type: "internship",
    month: 10, day: 1,
    note: "Apply October–January for summer",
    payoff: "Radar, missile systems, electronic warfare programs",
    link: "https://www.rtx.com/careers",
    keywords: ["radar", "electronic warfare", "missile", "directed energy"],
    freshman_eligible: false,
  },
  {
    name: "Lockheed Martin Internship",
    type: "internship",
    month: 10, day: 15,
    note: "Apply October–January for summer",
    payoff: "F-35, hypersonics, space systems — largest defense employer",
    link: "https://www.lockheedmartin.com/en-us/who-we-are/student-opportunities.html",
    keywords: ["hypersonics", "space", "stealth", "propulsion", "autonomy"],
    freshman_eligible: false,
  },
  {
    name: "Boeing Internship",
    type: "internship",
    month: 10, day: 1,
    note: "Apply October–January for summer",
    payoff: "Philadelphia area office — defense + commercial aviation",
    link: "https://jobs.boeing.com/internships",
    keywords: ["propulsion", "autonomy", "UAS", "space"],
    freshman_eligible: false,
  },
  {
    name: "L3Harris Internship",
    type: "internship",
    month: 11, day: 1,
    note: "Apply November–January for summer",
    payoff: "Radar, EW, comms — one of fastest-growing defense employers",
    link: "https://careers.l3harris.com/students",
    keywords: ["radar", "electronic warfare", "communications", "ISR"],
    freshman_eligible: false,
  },
  {
    name: "SMART Scholarship",
    type: "scholarship",
    month: 8, day: 31,
    note: "Apply August — sophomore year and above",
    payoff: "Full tuition + $25k–$38k/yr stipend + guaranteed DoD job",
    link: "https://www.smartscholarship.org",
    keywords: ["hypersonics", "propulsion", "autonomy", "AI/ML", "cyber", "radar"],
    freshman_eligible: false,
  },
  {
    name: "Rutgers Undergraduate Research Fellowship",
    type: "funding",
    month: 3, day: 1,
    note: "Apply spring semester — need faculty sponsor first",
    payoff: "Paid stipend to do research with a professor",
    link: "https://sasundergrad.rutgers.edu/research/fellowships-and-awards/undergraduate-research-fellowships",
    keywords: ["hypersonics", "propulsion", "autonomy", "AI/ML", "space"],
    freshman_eligible: true,
  },
  {
    name: "General Atomics Internship",
    type: "internship",
    month: 11, day: 15,
    note: "Apply November–February for summer",
    payoff: "UAS, directed energy, nuclear — unique programs not at other primes",
    link: "https://www.ga.com/careers",
    keywords: ["UAS", "directed energy", "nuclear", "propulsion"],
    freshman_eligible: false,
  },
  {
    name: "BAE Systems Internship",
    type: "internship",
    month: 11, day: 1,
    note: "Apply November–January for summer",
    payoff: "Electronic warfare, cyber, radar — strong NJ/MD presence",
    link: "https://www.baesystems.com/en-us/our-company/inc-businesses/electronic-systems/careers",
    keywords: ["electronic warfare", "cyber", "radar", "C2"],
    freshman_eligible: false,
  },
];

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const TYPE_COLORS: Record<DeadlineType, string> = {
  internship: "border-ember-500/40 bg-ember-500/10 text-ember-300",
  scholarship: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  fellowship: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  certification: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  funding: "border-ink-700 bg-ink-800/50 text-ink-300",
};

const TYPE_DOT: Record<DeadlineType, string> = {
  internship: "bg-ember-400",
  scholarship: "bg-violet-400",
  fellowship: "bg-sky-400",
  certification: "bg-emerald-400",
  funding: "bg-ink-400",
};

export function InternshipTimeline({
  topKeywords,
}: {
  topKeywords: string[];
}) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;

  const sorted = useMemo(() => {
    return [...DEADLINES].sort((a, b) => {
      const am = a.month < currentMonth ? a.month + 12 : a.month;
      const bm = b.month < currentMonth ? b.month + 12 : b.month;
      return am !== bm ? am - bm : a.day - b.day;
    });
  }, [currentMonth]);

  const grouped = useMemo(() => {
    const map = new Map<number, Deadline[]>();
    for (const d of sorted) {
      const key = d.month;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    }
    return map;
  }, [sorted]);

  const isHot = (d: Deadline) =>
    topKeywords.some((kw) => d.keywords.includes(kw));

  const months = Array.from(grouped.keys());

  return (
    <div className="flex flex-col gap-1">
      {/* Legend */}
      <div className="mb-3 flex flex-wrap gap-3 text-[11px]">
        {(Object.entries(TYPE_COLORS) as [DeadlineType, string][]).map(([type, cls]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${TYPE_DOT[type]}`} />
            <span className="capitalize text-ink-400">{type}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-ember-400 ring-2 ring-ember-400/30" />
          <span className="text-ink-400">matches your top domains</span>
        </div>
      </div>

      {months.map((month) => {
        const isCurrentMonth = month === currentMonth;
        const isPast = month < currentMonth;
        return (
          <div key={month} className={isPast ? "opacity-40" : ""}>
            <div
              className={
                "mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider " +
                (isCurrentMonth ? "text-ember-400" : "text-ink-500")
              }
            >
              {isCurrentMonth && (
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-ember-400" />
              )}
              {MONTH_NAMES[month - 1]}
            </div>
            <div className="mb-4 grid gap-2 sm:grid-cols-2">
              {grouped.get(month)!.map((d) => (
                <a
                  key={d.name}
                  href={d.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    "flex flex-col gap-1.5 rounded-xl border p-3 transition-opacity hover:opacity-90 " +
                    (isHot(d)
                      ? "border-ember-500/50 bg-ember-500/5 ring-1 ring-ember-500/20"
                      : "border-ink-800 bg-ink-900/30")
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-ink-100 leading-tight">
                      {d.name}
                    </span>
                    <span
                      className={
                        "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize " +
                        TYPE_COLORS[d.type]
                      }
                    >
                      {d.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-500">{d.note}</div>
                  <div className="text-xs text-ink-400">{d.payoff}</div>
                  {d.freshman_eligible && (
                    <div className="text-[10px] font-medium text-emerald-400">
                      ✓ Freshman eligible
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
