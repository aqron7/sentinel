import asyncio

from dotenv import load_dotenv

from sentinel.extract.claude import extract_contract
from sentinel.ingest.usaspending import fetch_recent_awards

load_dotenv()


async def main() -> None:
    awards = await fetch_recent_awards(days_back=30)
    for award in awards[:5]:
        extracted = extract_contract(award)
        print(
            f"{award['Recipient Name']:40} | "
            f"{extracted['classification']:15} | "
            f"{extracted['tech_keywords']}"
        )


if __name__ == "__main__":
    asyncio.run(main())
