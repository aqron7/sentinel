"""USPTO / PatentsView patent fetcher (Phase 3)."""

from datetime import date, timedelta

import httpx

BASE = "https://search.patentsview.org/api/v1/patent/search"

DEFAULT_ASSIGNEES = [
    "Northrop Grumman",
    "Raytheon",
    "General Atomics",
    "Lockheed Martin",
    "Boeing",
    "L3Harris",
    "BAE Systems",
]


async def fetch_recent_patents(
    assignees: list[str] | None = None,
    days_back: int = 90,
) -> list[dict]:
    assignees = assignees or DEFAULT_ASSIGNEES
    cutoff = (date.today() - timedelta(days=days_back)).isoformat()

    body = {
        "q": {
            "_and": [
                {"_or": [{"assignees.assignee_organization": a} for a in assignees]},
                {"_gte": {"patent_date": cutoff}},
            ],
        },
        "f": [
            "patent_id",
            "patent_title",
            "patent_abstract",
            "patent_date",
            "assignees.assignee_organization",
        ],
        "o": {"size": 100},
        "s": [{"patent_date": "desc"}],
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(BASE, json=body)
        resp.raise_for_status()
        return resp.json().get("patents", [])
