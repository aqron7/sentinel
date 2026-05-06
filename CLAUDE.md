# Sentinel — Claude Code guide

Defense acquisition intelligence dashboard. Ingests public contract awards,
solicitations, and patents; runs them through Claude for structured extraction;
surfaces contractor × technology momentum in a React dashboard.

## Environment

- Python 3.11+, Node 18+
- `ANTHROPIC_API_KEY` is available as a Codespace/env secret — do not hardcode it
- SQLite database written to `sentinel.db` at the repo root (git-ignored)
- All Python lives under `sentinel/` (importable package); `quickstart.py` is the Phase 1 smoke-test

## Setup

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # key is already injected in Codespaces, .env is a fallback
python quickstart.py   # Phase 1 end-to-end smoke-test
```

## What is already built (Phase 1)

| File | Status | Notes |
|------|--------|-------|
| `sentinel/ingest/usaspending.py` | Done | Async fetch, 3 contractors, configurable lookback |
| `sentinel/extract/prompts.py` | Done | `CONTRACT_EXTRACTION_PROMPT` with locked keyword vocab |
| `sentinel/extract/claude.py` | Done | `extract_contract()` → `claude-opus-4-7`, returns parsed dict |
| `sentinel/db/models.py` | Done | `Award`, `Solicitation`, `Patent` SQLModel tables |
| `sentinel/db/search.py` | Done | `init_db()`, `save_award()` |
| `sentinel/db/init.sql` | Done | FTS5 virtual tables + triggers |
| `sentinel/api/main.py` | Done | `/health`, `/awards` FastAPI routes |
| `quickstart.py` | Done | fetch → extract → save → print |

## What to build next

### Phase 2 — SAM.gov solicitations (`sentinel/ingest/sam.py`)

Implement `fetch_open_solicitations(days_back=30) -> list[dict]`.

Use the SAM.gov Opportunities API (no key needed for public data):
```
GET https://api.sam.gov/opportunities/v2/search
    ?limit=100
    &postedFrom=<date>
    &postedTo=<date>
    &keywords=Northrop+Grumman,Raytheon,General+Atomics
    &ptype=o,p,k,r      # presolicitation, pre-sol, sources sought, RFP
```

Add `save_solicitation(raw, extracted)` in `sentinel/db/search.py` mirroring
`save_award()`. Add an `extract_solicitation()` function in
`sentinel/extract/claude.py` using a new `SOLICITATION_EXTRACTION_PROMPT` in
`prompts.py` — same JSON shape as `CONTRACT_EXTRACTION_PROMPT` plus
`"response_deadline"` field. Wire it into `quickstart.py`.

Surface open solicitations prominently in the API: add `GET /solicitations` route,
filter by `status = 'open_solicitation'`.

### Phase 3 — USPTO patents (`sentinel/ingest/uspto.py`)

Use the PatentsView API (free, no key):
```
POST https://search.patentsview.org/api/v1/patent/search
Body: {
  "q": {"assignee_organization": ["Northrop Grumman", "Raytheon", "General Atomics"]},
  "f": ["patent_number", "patent_title", "patent_abstract", "patent_date", "assignee_organization"],
  "o": {"per_page": 100, "sort": [{"patent_date": "desc"}]}
}
```

Add `extract_patent()` + `PATENT_EXTRACTION_PROMPT` (same keyword vocabulary,
drop `momentum_signal`, keep `tech_keywords` and `classification`).
Add `save_patent()` to `sentinel/db/search.py`.

### Phase 4 — Dashboard (`dashboard/`)

React + Vite app. Scaffold with:
```bash
cd dashboard && npm create vite@latest . -- --template react-ts
npm install
```

**The killer view:** a contractor × tech-domain matrix.
- Rows: Northrop Grumman, Raytheon, General Atomics, Lockheed Martin
- Columns: the 16 tech keywords from `prompts.py`
- Cells: combined momentum score — contract dollars + patent count + open solicitation count
- Colour scale: white → deep orange by intensity

Secondary views:
- Recent awards list (sortable by amount, date, classification)
- Open solicitations list (highlight `momentum_signal = new_start`)
- Patent timeline per contractor

API base URL should read from `VITE_API_BASE` env var (default `http://localhost:8000`).
The FastAPI server serves the built dashboard static files from `dashboard/dist/`
when `NODE_ENV=production`.

### GitHub Actions cron (`/.github/workflows/ingest.yml`)

Nightly ingestion so the DB stays fresh without a running server:

```yaml
on:
  schedule:
    - cron: '0 6 * * *'   # 06:00 UTC daily
  workflow_dispatch:
jobs:
  ingest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - run: pip install -r requirements.txt
      - run: python -m sentinel.ingest.run_all
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      - uses: actions/upload-artifact@v4
        with: { name: sentinel-db, path: sentinel.db }
```

Create `sentinel/ingest/run_all.py` that calls all three fetchers and saves results.

## Code conventions

- Async fetchers (`fetch_*`): use `httpx.AsyncClient` with `timeout=30.0`
- All Claude calls use model `claude-opus-4-7` and `max_tokens=512`
- `tech_keywords` stored as JSON-encoded string in SQLite (`json.dumps`/`json.loads`)
- Duplicate detection: `save_*` functions check for existing ID before inserting, return `bool`
- No comments unless the WHY is non-obvious
- No type: ignore, no bare except

## Running the API

```bash
uvicorn sentinel.api.main:app --reload
```

## Tech keyword vocabulary (canonical — do not extend without updating all prompts)

`hypersonics`, `directed energy`, `autonomy`, `JADC2`, `AI/ML`, `cyber`,
`ISR`, `electronic warfare`, `space`, `nuclear`, `UAS`, `VTOL`, `propulsion`,
`stealth`, `radar`, `sonar`, `logistics`, `C2`, `communications`
