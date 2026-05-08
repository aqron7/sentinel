"""One-shot: pull last 5 years of history from each source."""

import asyncio
import os
import traceback

from dotenv import load_dotenv

from sentinel.db.search import init_db, save_award, save_patent, save_solicitation
from sentinel.extract.llm import extract_contract, extract_patent, extract_solicitation
from sentinel.ingest.sam import fetch_open_solicitations
from sentinel.ingest.usaspending import fetch_recent_awards
from sentinel.ingest.uspto import fetch_recent_patents

load_dotenv()

YEARS = 5
DAYS = YEARS * 365


async def _backfill_awards() -> int:
    print(f"Fetching awards ({DAYS} days back)...")
    awards = await fetch_recent_awards(days_back=DAYS)
    inserted = 0
    for a in awards:
        try:
            extracted = extract_contract(a)
            if save_award(a, extracted):
                inserted += 1
        except Exception:
            traceback.print_exc()
    print(f"  awards: {inserted} new / {len(awards)} fetched")
    return inserted


async def _backfill_solicitations() -> int:
    if not os.environ.get("SAM_API_KEY"):
        print("SAM_API_KEY unset; skipping solicitation backfill.")
        return 0
    if not os.environ.get("GROQ_API_KEY"):
        print("GROQ_API_KEY unset; skipping solicitation backfill.")
        return 0
    # SAM.gov only keeps ~90 days of history; use max window
    print("Fetching solicitations (90 days back)...")
    sols = await fetch_open_solicitations(days_back=90)
    inserted = 0
    for s in sols:
        try:
            extracted = extract_solicitation(s)
            if save_solicitation(s, extracted):
                inserted += 1
        except Exception:
            traceback.print_exc()
    print(f"  solicitations: {inserted} new / {len(sols)} fetched")
    return inserted


async def _backfill_patents() -> int:
    print(f"Fetching patents ({DAYS} days back)...")
    patents = await fetch_recent_patents(days_back=DAYS)
    inserted = 0
    for p in patents:
        try:
            extracted = extract_patent(p)
            if save_patent(p, extracted):
                inserted += 1
        except Exception:
            traceback.print_exc()
    print(f"  patents: {inserted} new / {len(patents)} fetched")
    return inserted


async def main() -> None:
    init_db()
    a, s, p = await asyncio.gather(
        _backfill_awards(),
        _backfill_solicitations(),
        _backfill_patents(),
    )
    print(f"\nBackfill complete — awards: {a} | solicitations: {s} | patents: {p}")


if __name__ == "__main__":
    asyncio.run(main())
