"""Phase 1 smoke-test: fetch awards -> Claude extract -> save -> print."""

import asyncio
import json

from dotenv import load_dotenv

from sentinel.db.search import init_db, save_award
from sentinel.extract.llm import extract_contract
from sentinel.ingest.usaspending import fetch_recent_awards

load_dotenv()


async def main() -> None:
    print("Initialising database...")
    init_db()

    print("Fetching recent awards...")
    awards = await fetch_recent_awards(days_back=30)
    print(f"  {len(awards)} awards returned")

    inserted = 0
    for award in awards[:5]:
        extracted = extract_contract(award)
        new = save_award(award, extracted)
        status = "NEW" if new else "dup"
        keywords = extracted.get("tech_keywords", [])
        if isinstance(keywords, str):
            keywords = json.loads(keywords or "[]")
        print(
            f"[{status}] {award['Recipient Name']:40} | "
            f"{extracted.get('classification', '?'):15} | "
            f"{keywords}"
        )
        if new:
            inserted += 1

    print(f"\n{inserted} new award(s) saved to sentinel.db")


if __name__ == "__main__":
    asyncio.run(main())
