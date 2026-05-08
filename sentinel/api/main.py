"""FastAPI surface for Sentinel: awards, solicitations, patents, and the
aggregate matrix that powers the dashboard."""

import json
from collections import defaultdict
from pathlib import Path

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select

from sentinel.db.models import Award, Patent, Solicitation
from sentinel.db.search import ENGINE
from sentinel.extract.prompts import TECH_KEYWORDS

CONTRACTOR_GROUPS = {
    "Northrop Grumman": ["NORTHROP GRUMMAN"],
    "Raytheon": ["RAYTHEON", "RTX"],
    "General Atomics": ["GENERAL ATOMICS"],
    "Lockheed Martin": ["LOCKHEED MARTIN"],
}

CANONICAL_KEYWORDS = [k.strip() for k in TECH_KEYWORDS.split(",")]


def _canonical_contractor(name: str) -> str | None:
    if not name:
        return None
    upper = name.upper()
    for canonical, needles in CONTRACTOR_GROUPS.items():
        if any(n in upper for n in needles):
            return canonical
    return None


def _parse_keywords(raw: str | None) -> list[str]:
    if not raw:
        return []
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return []


def _serialize_award(a: Award) -> dict:
    return {
        "id": a.id,
        "award_id": a.award_id,
        "recipient": a.recipient,
        "contractor": _canonical_contractor(a.recipient),
        "amount": a.amount,
        "agency": a.agency,
        "description": a.description,
        "period_start": a.period_start,
        "program_name": a.program_name,
        "tech_keywords": _parse_keywords(a.tech_keywords),
        "classification": a.classification,
        "momentum_signal": a.momentum_signal,
        "summary": a.summary,
        "fetched_at": a.fetched_at.isoformat() if a.fetched_at else None,
    }


def _serialize_solicitation(s: Solicitation) -> dict:
    return {
        "id": s.id,
        "notice_id": s.notice_id,
        "title": s.title,
        "agency": s.agency,
        "contractor": _canonical_contractor(s.title + " " + s.agency),
        "posted_date": s.posted_date,
        "response_deadline": s.response_deadline,
        "description": s.description,
        "status": s.status,
        "tech_keywords": _parse_keywords(s.tech_keywords),
        "classification": s.classification,
        "summary": s.summary,
        "fetched_at": s.fetched_at.isoformat() if s.fetched_at else None,
    }


def _serialize_patent(p: Patent) -> dict:
    return {
        "id": p.id,
        "patent_number": p.patent_number,
        "assignee": p.assignee,
        "contractor": _canonical_contractor(p.assignee),
        "title": p.title,
        "abstract": p.abstract,
        "grant_date": p.grant_date,
        "tech_keywords": _parse_keywords(p.tech_keywords),
        "classification": p.classification,
        "fetched_at": p.fetched_at.isoformat() if p.fetched_at else None,
    }


app = FastAPI(title="Sentinel")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.get("/awards")
def list_awards(
    limit: int = Query(50, le=500),
    contractor: str | None = None,
    keyword: str | None = None,
) -> list[dict]:
    with Session(ENGINE) as session:
        rows = session.exec(
            select(Award).order_by(Award.amount.desc()).limit(limit * 4)
        ).all()
    out: list[dict] = []
    for a in rows:
        s = _serialize_award(a)
        if contractor and s["contractor"] != contractor:
            continue
        if keyword and keyword not in s["tech_keywords"]:
            continue
        out.append(s)
        if len(out) >= limit:
            break
    return out


@app.get("/solicitations")
def list_solicitations(limit: int = Query(50, le=500)) -> list[dict]:
    with Session(ENGINE) as session:
        rows = session.exec(
            select(Solicitation)
            .where(Solicitation.status == "open_solicitation")
            .order_by(Solicitation.posted_date.desc())
            .limit(limit)
        ).all()
    return [_serialize_solicitation(s) for s in rows]


@app.get("/patents")
def list_patents(
    limit: int = Query(100, le=500),
    contractor: str | None = None,
) -> list[dict]:
    with Session(ENGINE) as session:
        rows = session.exec(
            select(Patent).order_by(Patent.grant_date.desc()).limit(limit * 4)
        ).all()
    out: list[dict] = []
    for p in rows:
        s = _serialize_patent(p)
        if contractor and s["contractor"] != contractor:
            continue
        out.append(s)
        if len(out) >= limit:
            break
    return out


@app.get("/aggregates")
def aggregates() -> dict:
    """Contractor x tech-keyword matrix used by the dashboard heatmap."""
    contractors = list(CONTRACTOR_GROUPS.keys())

    contract_dollars: dict[tuple[str, str], float] = defaultdict(float)
    patent_count: dict[tuple[str, str], int] = defaultdict(int)
    open_sols: dict[tuple[str, str], int] = defaultdict(int)

    with Session(ENGINE) as session:
        for a in session.exec(select(Award)).all():
            c = _canonical_contractor(a.recipient)
            if not c:
                continue
            for kw in _parse_keywords(a.tech_keywords):
                if kw in CANONICAL_KEYWORDS:
                    contract_dollars[(c, kw)] += a.amount or 0.0

        for p in session.exec(select(Patent)).all():
            c = _canonical_contractor(p.assignee)
            if not c:
                continue
            for kw in _parse_keywords(p.tech_keywords):
                if kw in CANONICAL_KEYWORDS:
                    patent_count[(c, kw)] += 1

        for s in session.exec(
            select(Solicitation).where(Solicitation.status == "open_solicitation")
        ).all():
            c = _canonical_contractor((s.title or "") + " " + (s.agency or ""))
            if not c:
                continue
            for kw in _parse_keywords(s.tech_keywords):
                if kw in CANONICAL_KEYWORDS:
                    open_sols[(c, kw)] += 1

    matrix: list[list[dict]] = []
    for c in contractors:
        row: list[dict] = []
        for kw in CANONICAL_KEYWORDS:
            row.append(
                {
                    "contract_amount": contract_dollars[(c, kw)],
                    "patent_count": patent_count[(c, kw)],
                    "open_solicitations": open_sols[(c, kw)],
                }
            )
        matrix.append(row)

    return {
        "contractors": contractors,
        "tech_keywords": CANONICAL_KEYWORDS,
        "matrix": matrix,
    }


_DIST = Path(__file__).resolve().parents[2] / "dashboard" / "dist"
if _DIST.is_dir():
    app.mount(
        "/assets",
        StaticFiles(directory=_DIST / "assets"),
        name="assets",
    )

    @app.get("/")
    def _root() -> FileResponse:
        return FileResponse(_DIST / "index.html")
