"""SAM.gov solicitation fetcher (Phase 2)."""

import os
from datetime import date, timedelta

import httpx

BASE = "https://api.sam.gov/opportunities/v2/search"

TARGET_KEYWORDS = "Northrop Grumman Raytheon General Atomics Lockheed Martin"


async def fetch_open_solicitations(days_back: int = 30) -> list[dict]:
    api_key = os.environ.get("SAM_API_KEY")
    if not api_key:
        raise RuntimeError(
            "SAM_API_KEY is not set; SAM.gov v2 requires an API key."
        )

    posted_to = date.today()
    posted_from = posted_to - timedelta(days=days_back)

    params = {
        "limit": 100,
        "postedFrom": posted_from.strftime("%m/%d/%Y"),
        "postedTo": posted_to.strftime("%m/%d/%Y"),
        "keywords": TARGET_KEYWORDS,
        "ptype": "o,p,k,r",
        "api_key": api_key,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(BASE, params=params)
        resp.raise_for_status()
        return resp.json().get("opportunitiesData", [])
