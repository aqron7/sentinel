const BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "";

export type Award = {
  id: number;
  award_id: string;
  recipient: string;
  contractor: string | null;
  amount: number;
  agency: string;
  description: string;
  period_start: string | null;
  program_name: string | null;
  tech_keywords: string[];
  classification: string | null;
  momentum_signal: string | null;
  summary: string | null;
  fetched_at: string | null;
};

export type Solicitation = {
  id: number;
  notice_id: string;
  title: string;
  agency: string;
  contractor: string | null;
  posted_date: string;
  response_deadline: string | null;
  description: string;
  status: string;
  tech_keywords: string[];
  classification: string | null;
  summary: string | null;
  fetched_at: string | null;
};

export type Patent = {
  id: number;
  patent_number: string;
  assignee: string;
  contractor: string | null;
  title: string;
  abstract: string;
  grant_date: string;
  tech_keywords: string[];
  classification: string | null;
  fetched_at: string | null;
};

export type MatrixCell = {
  contract_amount: number;
  patent_count: number;
  open_solicitations: number;
};

export type TrendCell = {
  contract_amount_delta: number;
  patent_count_delta: number;
};

export type Aggregates = {
  contractors: string[];
  tech_keywords: string[];
  matrix: MatrixCell[][];
  trend: TrendCell[][];
};

export type SkillEntry = {
  keyword: string;
  momentum_score: number;
  courses: string[];
  skills: string[];
  tools: string[];
  why: string;
};

export type Club = {
  name: string;
  description: string;
  relevant_keywords: string[];
  how_to_join: string;
};

export type Scholarship = {
  name: string;
  sponsor: string;
  amount: string;
  deadline_note: string;
  url: string;
  relevant_keywords: string[];
};

export type RutgersLab = {
  name: string;
  department: string;
  faculty: string;
  relevant_keywords: string[];
  description: string;
  why_apply: string;
  url: string;
  how_to_apply: string;
};

export type ApplyNowItem = {
  what: string;
  type: string;
  urgency: string;
  effort: string;
  payoff: string;
  link: string;
  relevant_keywords: string[];
};

export type CareerTimelineItem = {
  year: string;
  action: string;
  rationale: string;
  relevant_keywords: string[];
};

export type Recommendations = {
  top_keywords: string[];
  skills_map: SkillEntry[];
  clubs: Club[];
  scholarships: Scholarship[];
  rutgers_labs: RutgersLab[];
  apply_now: ApplyNowItem[];
  career_timeline: CareerTimelineItem[];
  top_contractors_by_keyword: Record<string, string[]>;
};

export type ContractorSummary = {
  total_contract_dollars: number;
  award_count: number;
  patent_count: number;
  open_solicitation_count: number;
  top_keywords: string[];
};

export type ContractorDetail = {
  contractor: string;
  summary: ContractorSummary;
  awards: Award[];
  patents: Patent[];
  solicitations: Solicitation[];
};

export type SearchResults = {
  awards: Award[];
  solicitations: Solicitation[];
  patents: Patent[];
};

export type SchoolResult = {
  name: string;
  full_name: string;
  location: string;
  relevant_keywords: string[];
  strong_majors: string[];
  defense_strength: string;
  why: string;
  notable_programs: string[];
  defense_connections: string;
  url: string;
  matched_keywords: string[];
  relevance_score: number;
};

export type SchoolPlannerResult = {
  schools: SchoolResult[];
  requested_domains: string[];
  momentum_scores: Record<string, number>;
};

export type MajorGuide = {
  major: string;
  description: string;
  keywords: string[];
  skills: SkillEntry[];
  top_schools: SchoolResult[];
  scholarships: Scholarship[];
  career_timeline: CareerTimelineItem[];
  majors_list: string[];
};

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new Error(`${path} -> HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export const api = {
  health: () => get<{ ok: boolean }>("/health"),
  aggregates: () => get<Aggregates>("/aggregates"),
  awards: (limit = 50) => get<Award[]>(`/awards?limit=${limit}`),
  solicitations: (limit = 50) =>
    get<Solicitation[]>(`/solicitations?limit=${limit}`),
  patents: (limit = 200) => get<Patent[]>(`/patents?limit=${limit}`),
  contractor: (name: string) =>
    get<ContractorDetail>(`/contractor/${encodeURIComponent(name)}`),
  search: (q: string, source = "all", limit = 20) =>
    get<SearchResults>(
      `/search?q=${encodeURIComponent(q)}&source=${source}&limit=${limit}`,
    ),
  recommendations: (topN = 5) =>
    get<Recommendations>(`/recommendations?top_n=${topN}`),
  schoolPlanner: (domains: string[], school = "") =>
    get<SchoolPlannerResult>(
      `/school-planner?domains=${encodeURIComponent(domains.join(","))}&school=${encodeURIComponent(school)}`,
    ),
  majorGuide: (major: string) =>
    get<MajorGuide>(`/major-guide?major=${encodeURIComponent(major)}`),
  majors: () => get<{ majors: string[] }>("/majors"),
};
