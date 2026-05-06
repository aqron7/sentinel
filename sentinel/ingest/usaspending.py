import httpx
from datetime import date, timedelta

BASE = "https://api.usaspending.gov/api/v2"
TARGET_CONTRACTORS = [
    "NORTHROP GRUMMAN CORPORATION",
    "RAYTHEON TECHNOLOGIES CORP",
    "GENERAL ATOMICS",
]


async def fetch_recent_awards(days_back: int = 90) -> list[dict]:
    start = (date.today() - timedelta(days=days_back)).isoformat()

    payload = {
        "filters": {
            "recipient_search_text": TARGET_CONTRACTORS,
            "time_period": [{"start_date": start, "end_date": date.today().isoformat()}],
            "award_type_codes": ["A", "B", "C", "D"],
        },
        "fields": [
            "Award ID",
            "Recipient Name",
            "Award Amount",
            "Description",
            "Awarding Agency",
            "Period of Performance Start Date",
        ],
        "limit": 100,
        "sort": "Award Amount",
        "order": "desc",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(f"{BASE}/search/spending_by_award/", json=payload)
        resp.raise_for_status()
        return resp.json()["results"]
