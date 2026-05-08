# Sentinel — Claude Code guide

Defense acquisition intelligence dashboard. Ingests public contract awards,
solicitations, and patents; runs them through an LLM for structured
extraction; surfaces contractor × technology momentum in a React dashboard.

## Environment

- Python 3.11+, Node 18+
- `GROQ_API_KEY` for the LLM extraction layer (Groq + Llama 3.3 70B)
- `SAM_API_KEY` for SAM.gov solicitation ingest (optional — solicitations skip if unset)
- SQLite database at `sentinel.db` at the repo root (git-ignored)
- All Python lives under `sentinel/` (importable package)

## Setup

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add GROQ_API_KEY
python quickstart.py   # Phase 1 end-to-end smoke test (USASpending)
```

```bash
cd dashboard && npm install
VITE_API_BASE=http://localhost:8000 npm run dev
```

## Layout

| Path | Purpose |
|------|---------|
| `sentinel/ingest/usaspending.py` | Contract awards (USASpending v2) |
| `sentinel/ingest/sam.py` | Open solicitations (SAM.gov v2, needs `SAM_API_KEY`) |
| `sentinel/ingest/uspto.py` | Patents (PatentsView) |
| `sentinel/ingest/run_all.py` | Parallel awards/sols/patents — used by GH Actions cron |
| `sentinel/extract/prompts.py` | Locked prompt templates + canonical `TECH_KEYWORDS` |
| `sentinel/extract/llm.py` | `extract_contract`, `extract_solicitation`, `extract_patent` (Groq) |
| `sentinel/db/models.py` | `Award`, `Solicitation`, `Patent` SQLModel tables |
| `sentinel/db/search.py` | `init_db`, `save_*`, FTS5 setup |
| `sentinel/api/main.py` | FastAPI: `/health`, `/awards`, `/solicitations`, `/patents`, `/aggregates` |
| `dashboard/` | Vite + React + TS + Tailwind dark UI |
| `.github/workflows/ingest.yml` | Nightly cron — runs `run_all`, uploads `sentinel.db` artifact |

## Code conventions

- LLM calls go through `sentinel/extract/llm.py` (Groq, `llama-3.3-70b-versatile`,
  `temperature=0.1`, `response_format={"type": "json_object"}`, `max_tokens=512`)
- `tech_keywords` are post-filtered to the canonical vocabulary in `prompts.py`
- Async fetchers use `httpx.AsyncClient` with `timeout=30.0`
- `tech_keywords` stored as JSON-encoded string in SQLite
- Duplicate detection: `save_*` checks for existing ID before insert, returns `bool`
- No comments unless the WHY is non-obvious; no `type: ignore`, no bare `except`

## Tech keyword vocabulary (canonical — extending it requires updating all prompts)

`hypersonics`, `directed energy`, `autonomy`, `JADC2`, `AI/ML`, `cyber`,
`ISR`, `electronic warfare`, `space`, `nuclear`, `UAS`, `VTOL`, `propulsion`,
`stealth`, `radar`, `sonar`, `logistics`, `C2`, `communications`
