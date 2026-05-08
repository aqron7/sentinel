import json

import anthropic

from sentinel.extract.prompts import (
    CONTRACT_EXTRACTION_PROMPT,
    PATENT_EXTRACTION_PROMPT,
    SOLICITATION_EXTRACTION_PROMPT,
)

client = anthropic.Anthropic()
MODEL = "claude-opus-4-7"
MAX_TOKENS = 512


def _call(prompt: str) -> dict:
    msg = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        messages=[{"role": "user", "content": prompt}],
    )
    return json.loads(msg.content[0].text)


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
