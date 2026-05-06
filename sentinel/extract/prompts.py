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
  "classification": "one of: aircraft, missile, cyber, C2, space, ground, maritime, logistics, RDT&E, other",
  "momentum_signal": "one of: new_start, follow_on, maintenance, unclear",
  "summary": "one sentence plain-English description"
}}

Tech keyword vocabulary (use only from this list):
hypersonics, directed energy, autonomy, JADC2, AI/ML, cyber,
ISR, electronic warfare, space, nuclear, UAS, VTOL, propulsion,
stealth, radar, sonar, logistics, C2, communications
"""
