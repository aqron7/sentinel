"""LLM extraction layer. Uses Groq + Llama 3.3 70B with strict JSON output."""

import json

from groq import Groq

from sentinel.extract.prompts import (
    CONTRACT_EXTRACTION_PROMPT,
    PATENT_EXTRACTION_PROMPT,
    SOLICITATION_EXTRACTION_PROMPT,
    TECH_KEYWORDS,
)

MODEL = "llama-3.3-70b-versatile"
MAX_TOKENS = 512

_client: Groq | None = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq()
    return _client

CANONICAL_KEYWORDS = {k.strip() for k in TECH_KEYWORDS.split(",")}


def _filter_keywords(values) -> list[str]:
    if not isinstance(values, list):
        return []
    seen: list[str] = []
    for v in values:
        if isinstance(v, str) and v in CANONICAL_KEYWORDS and v not in seen:
            seen.append(v)
    return seen


def _call(prompt: str) -> dict:
    completion = _get_client().chat.completions.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        temperature=0.1,
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": prompt}],
    )
    raw = completion.choices[0].message.content or "{}"
    data = json.loads(raw)
    if "tech_keywords" in data:
        data["tech_keywords"] = _filter_keywords(data["tech_keywords"])
    return data


def extract_contract(award: dict) -> dict:
    prompt = CONTRACT_EXTRACTION_PROMPT.format(
        description=award.get("Description", "") or "",
        contractor=award.get("Recipient Name", "") or "",
        amount=award.get("Award Amount", 0) or 0,
        agency=award.get("Awarding Agency", "") or "",
    )
    return _call(prompt)


def extract_solicitation(notice: dict) -> dict:
    prompt = SOLICITATION_EXTRACTION_PROMPT.format(
        title=notice.get("title", "") or "",
        agency=(notice.get("fullParentPathName") or notice.get("department") or ""),
        description=notice.get("description", "") or "",
        posted_date=notice.get("postedDate", "") or "",
        response_deadline=notice.get("responseDeadLine", "") or "",
    )
    return _call(prompt)


def extract_patent(patent: dict) -> dict:
    assignees = patent.get("assignees") or []
    first_assignee = ""
    if assignees:
        first_assignee = assignees[0].get("assignee_organization", "") or ""

    prompt = PATENT_EXTRACTION_PROMPT.format(
        title=patent.get("patent_title", "") or "",
        assignee=first_assignee,
        abstract=patent.get("patent_abstract", "") or "",
    )
    return _call(prompt)
