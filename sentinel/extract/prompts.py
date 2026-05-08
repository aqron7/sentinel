TECH_KEYWORDS = (
    "hypersonics, directed energy, autonomy, JADC2, AI/ML, cyber, "
    "ISR, electronic warfare, space, nuclear, UAS, VTOL, propulsion, "
    "stealth, radar, sonar, logistics, C2, communications"
)

CLASSIFICATIONS = (
    "aircraft, missile, cyber, C2, space, ground, maritime, "
    "logistics, RDT&E, other"
)


CONTRACT_EXTRACTION_PROMPT = """
You are a defense acquisition analyst. Extract structured data from this contract award.

Contract description: {description}
Contractor: {contractor}
Award amount: ${amount:,.0f}
Agency: {agency}

Return ONLY valid JSON with these fields:
{{
  "program_name": "best guess at the program/platform name",
  "tech_keywords": ["list", "of", "technology", "domains"],
  "classification": "one of: """ + CLASSIFICATIONS + """",
  "momentum_signal": "one of: new_start, follow_on, maintenance, unclear",
  "summary": "one sentence plain-English description"
}}

Tech keyword vocabulary (use only from this list):
""" + TECH_KEYWORDS + """
"""


SOLICITATION_EXTRACTION_PROMPT = """
You are a defense acquisition analyst. Extract structured data from this open solicitation.

Title: {title}
Agency: {agency}
Description: {description}
Posted: {posted_date}
Response deadline: {response_deadline}

Return ONLY valid JSON with these fields:
{{
  "program_name": "best guess at the program/platform name (or null)",
  "tech_keywords": ["list", "of", "technology", "domains"],
  "classification": "one of: """ + CLASSIFICATIONS + """",
  "momentum_signal": "one of: new_start, follow_on, maintenance, unclear",
  "response_deadline": "ISO date if parsable, else the original string",
  "summary": "one sentence plain-English description"
}}

Tech keyword vocabulary (use only from this list):
""" + TECH_KEYWORDS + """
"""


PATENT_EXTRACTION_PROMPT = """
You are a defense acquisition analyst. Classify this patent.

Title: {title}
Assignee: {assignee}
Abstract: {abstract}

Return ONLY valid JSON with these fields:
{{
  "tech_keywords": ["list", "of", "technology", "domains"],
  "classification": "one of: """ + CLASSIFICATIONS + """"
}}

Tech keyword vocabulary (use only from this list):
""" + TECH_KEYWORDS + """
"""
