import json

import anthropic

from sentinel.extract.prompts import CONTRACT_EXTRACTION_PROMPT

client = anthropic.Anthropic()


def extract_contract(award: dict) -> dict:
    prompt = CONTRACT_EXTRACTION_PROMPT.format(
        description=award.get("Description", "") or "",
        contractor=award.get("Recipient Name", "") or "",
        amount=award.get("Award Amount", 0) or 0,
        agency=award.get("Awarding Agency", "") or "",
    )

    msg = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = msg.content[0].text
    return json.loads(raw)
