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

export type Aggregates = {
  contractors: string[];
  tech_keywords: string[];
  matrix: MatrixCell[][];
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
};
