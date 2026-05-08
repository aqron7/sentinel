"""Run all fetchers + extractors. Used by the nightly GH Actions job."""

import asyncio
import os
import traceback

from dotenv import load_dotenv

from sentinel.db.search import (
    init_db,
    save_award,
    save_patent,
    save_solicitation,
)
from sentinel.extract.llm import (
    extract_contract,
    extract_patent,
    extract_solicitation,
)
from sentinel.ingest.sam import fetch_open_solicitations
from sentinel.ingest.usaspending import fetch_recent_awards
from sentinel.ingest.uspto import fetch_recent_patents

load_dotenv()


async def _ingest_awards(limit: int) -> int:
    awards = await fetch_recent_awards(days_back=30)
    inserted = 0
    for a in awards[:limit]:
        try:
            extracted = extract_contract(a)
            if save_award(a, extracted):
                inserted += 1
        except Exception:
            traceback.print_exc()
    return inserted


async def _ingest_solicitations(limit: int) -> int:
    if not os.environ.get("SAM_API_KEY"):
        print("SAM_API_KEY unset; skipping solicitation ingest.")
        return 0
    if not os.environ.get("GROQ_API_KEY"):
        print("GROQ_API_KEY unset; skipping solicitation ingest.")
        return 0
    sols = await fetch_open_solicitations(days_back=14)
    inserted = 0
    for s in sols[:limit]:
        try:
            extracted = extract_solicitation(s)
            if save_solicitation(s, extracted):
                inserted += 1
        except Exception:
            traceback.print_exc()
    return inserted


async def _ingest_patents(limit: int) -> int:
    pats = await fetch_recent_patents(days_back=60)
    inserted = 0
    for p in pats[:limit]:
        try:
            extracted = extract_patent(p)
            if save_patent(p, extracted):
                inserted += 1
        except Exception:
            traceback.print_exc()
    return inserted


async def main() -> None:
    init_db()

    limit = int(os.environ.get("INGEST_LIMIT", "10"))

    a, s, p = await asyncio.gather(
        _ingest_awards(limit),
        _ingest_solicitations(limit),
        _ingest_patents(limit),
    )
    print(f"awards: {a} new | solicitations: {s} new | patents: {p} new")


if __name__ == "__main__":
    asyncio.run(main())
