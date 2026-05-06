# Sentinel

Defense acquisition intelligence: ingest contract awards, solicitations, and patents from public sources, run them through Claude for structured extraction, and surface contractor × technology momentum.

## Layout

```
sentinel/
  ingest/      USASpending, SAM.gov, USPTO, CBO fetchers + scheduler
  extract/     Claude extraction calls + prompt templates
  db/          SQLite (SQLModel) + FTS5 search
  api/         FastAPI routes
dashboard/     React + Vite frontend
scripts/       Backfill and one-shot jobs
```

## Build phases

- **Phase 1 (MVP):** USASpending → Claude → SQLite. ✅ scaffolded.
- **Phase 2:** SAM.gov open solicitations.
- **Phase 3:** USPTO patents (PatentsView API).
- **Phase 4:** Dashboard — contractor × tech-domain matrix.

## Quickstart

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # add ANTHROPIC_API_KEY
python quickstart.py
```
