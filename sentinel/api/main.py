"""FastAPI surface for Sentinel: awards, solicitations, patents, and the
aggregate matrix that powers the dashboard."""

import json
import sqlite3
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select

from sentinel.career.knowledge import (
    APPLY_NOW,
    CAREER_TIMELINE,
    CLUBS,
    RUTGERS_LABS,
    SCHOLARSHIPS,
    SKILLS_MAP,
)
from sentinel.db.models import Award, Patent, Solicitation
from sentinel.db.search import DB_PATH, ENGINE
from sentinel.extract.prompts import TECH_KEYWORDS

CONTRACTOR_GROUPS = {
    "Northrop Grumman": ["NORTHROP GRUMMAN"],
    "Raytheon": ["RAYTHEON", "RTX"],
    "General Atomics": ["GENERAL ATOMICS"],
    "Lockheed Martin": ["LOCKHEED MARTIN"],
    "Boeing": ["BOEING"],
    "L3Harris": ["L3HARRIS", "L3 HARRIS"],
    "BAE Systems": ["BAE SYSTEMS"],
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


def _build_matrix(
    awards: list[Award],
    patents: list[Patent],
    solicitations: list[Solicitation],
    contractors: list[str],
) -> list[list[dict]]:
    contract_dollars: dict[tuple[str, str], float] = defaultdict(float)
    patent_count: dict[tuple[str, str], int] = defaultdict(int)
    open_sols: dict[tuple[str, str], int] = defaultdict(int)

    for a in awards:
        c = _canonical_contractor(a.recipient)
        if not c:
            continue
        for kw in _parse_keywords(a.tech_keywords):
            if kw in CANONICAL_KEYWORDS:
                contract_dollars[(c, kw)] += a.amount or 0.0

    for p in patents:
        c = _canonical_contractor(p.assignee)
        if not c:
            continue
        for kw in _parse_keywords(p.tech_keywords):
            if kw in CANONICAL_KEYWORDS:
                patent_count[(c, kw)] += 1

    for s in solicitations:
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
    return matrix


@app.get("/aggregates")
def aggregates() -> dict:
    """Contractor x tech-keyword matrix with 30-day trend deltas."""
    contractors = list(CONTRACTOR_GROUPS.keys())
    now = datetime.utcnow()
    cutoff_recent = now - timedelta(days=30)
    cutoff_prior = now - timedelta(days=60)

    with Session(ENGINE) as session:
        all_awards = session.exec(select(Award)).all()
        all_patents = session.exec(select(Patent)).all()
        all_sols = session.exec(
            select(Solicitation).where(Solicitation.status == "open_solicitation")
        ).all()

    def _after(fetched_at: datetime | None, cutoff: datetime) -> bool:
        return fetched_at is not None and fetched_at >= cutoff

    recent_awards = [a for a in all_awards if _after(a.fetched_at, cutoff_recent)]
    prior_awards = [a for a in all_awards if _after(a.fetched_at, cutoff_prior) and not _after(a.fetched_at, cutoff_recent)]
    recent_patents = [p for p in all_patents if _after(p.fetched_at, cutoff_recent)]
    prior_patents = [p for p in all_patents if _after(p.fetched_at, cutoff_prior) and not _after(p.fetched_at, cutoff_recent)]

    matrix_all = _build_matrix(all_awards, all_patents, all_sols, contractors)
    matrix_recent = _build_matrix(recent_awards, recent_patents, all_sols, contractors)
    matrix_prior = _build_matrix(prior_awards, prior_patents, [], contractors)

    # Compute delta: positive = growing, negative = declining (clamped to [-1, 1])
    def _delta(recent_val: float, prior_val: float) -> float:
        if prior_val == 0:
            return 1.0 if recent_val > 0 else 0.0
        raw = (recent_val - prior_val) / prior_val
        return max(-1.0, min(1.0, raw))

    trend: list[list[dict]] = []
    for i, c in enumerate(contractors):
        row: list[dict] = []
        for j in range(len(CANONICAL_KEYWORDS)):
            r = matrix_recent[i][j]
            p = matrix_prior[i][j]
            row.append({
                "contract_amount_delta": _delta(r["contract_amount"], p["contract_amount"]),
                "patent_count_delta": _delta(r["patent_count"], p["patent_count"]),
            })
        trend.append(row)

    return {
        "contractors": contractors,
        "tech_keywords": CANONICAL_KEYWORDS,
        "matrix": matrix_all,
        "trend": trend,
    }


def _keyword_momentum_scores() -> dict[str, float]:
    """Compute a single momentum score per tech keyword across all contractors."""
    with Session(ENGINE) as session:
        all_awards = session.exec(select(Award)).all()
        all_patents = session.exec(select(Patent)).all()
        all_sols = session.exec(
            select(Solicitation).where(Solicitation.status == "open_solicitation")
        ).all()

    dollar_by_kw: dict[str, float] = defaultdict(float)
    patent_by_kw: dict[str, int] = defaultdict(int)
    sol_by_kw: dict[str, int] = defaultdict(int)

    for a in all_awards:
        for kw in _parse_keywords(a.tech_keywords):
            if kw in CANONICAL_KEYWORDS:
                dollar_by_kw[kw] += a.amount or 0.0

    for p in all_patents:
        for kw in _parse_keywords(p.tech_keywords):
            if kw in CANONICAL_KEYWORDS:
                patent_by_kw[kw] += 1

    for s in all_sols:
        for kw in _parse_keywords(s.tech_keywords):
            if kw in CANONICAL_KEYWORDS:
                sol_by_kw[kw] += 1

    max_d = max(dollar_by_kw.values(), default=1.0) or 1.0
    max_p = max(patent_by_kw.values(), default=1) or 1
    max_s = max(sol_by_kw.values(), default=1) or 1

    scores: dict[str, float] = {}
    for kw in CANONICAL_KEYWORDS:
        scores[kw] = (
            0.6 * dollar_by_kw[kw] / max_d
            + 0.25 * patent_by_kw[kw] / max_p
            + 0.15 * sol_by_kw[kw] / max_s
        )
    return scores


@app.get("/recommendations")
def recommendations(top_n: int = Query(5, le=10)) -> dict:
    """Career guidance for an incoming Rutgers AAE student based on contract momentum."""
    scores = _keyword_momentum_scores()
    ranked = sorted(CANONICAL_KEYWORDS, key=lambda k: -scores[k])
    top_keywords = ranked[:top_n]

    skills: list[dict] = []
    for kw in top_keywords:
        sm = SKILLS_MAP.get(kw)
        if sm:
            skills.append({
                "keyword": kw,
                "momentum_score": round(scores[kw], 3),
                "courses": sm["courses"],
                "skills": sm["skills"],
                "tools": sm["tools"],
                "why": sm["why"],
            })

    relevant_clubs = [
        c for c in CLUBS
        if any(kw in c["relevant_keywords"] for kw in top_keywords)
    ]

    relevant_scholarships = [
        s for s in SCHOLARSHIPS
        if any(kw in s["relevant_keywords"] for kw in top_keywords)
    ]

    relevant_labs = [
        lab for lab in RUTGERS_LABS
        if any(kw in lab.get("relevant_keywords", []) for kw in top_keywords)
    ]

    relevant_apply_now = [
        a for a in APPLY_NOW
        if any(kw in a["relevant_keywords"] for kw in top_keywords)
    ]

    # Top contractors per top keyword
    with Session(ENGINE) as session:
        all_awards = session.exec(select(Award)).all()

    contractor_kw_dollars: dict[str, dict[str, float]] = defaultdict(lambda: defaultdict(float))
    for a in all_awards:
        c = _canonical_contractor(a.recipient)
        if not c:
            continue
        for kw in _parse_keywords(a.tech_keywords):
            if kw in top_keywords:
                contractor_kw_dollars[kw][c] += a.amount or 0.0

    top_contractors_by_kw: dict[str, list[str]] = {}
    for kw in top_keywords:
        sorted_contractors = sorted(
            contractor_kw_dollars[kw], key=lambda c: -contractor_kw_dollars[kw][c]
        )
        top_contractors_by_kw[kw] = sorted_contractors[:3]

    return {
        "top_keywords": top_keywords,
        "skills_map": skills,
        "clubs": relevant_clubs,
        "scholarships": relevant_scholarships,
        "rutgers_labs": relevant_labs,
        "apply_now": relevant_apply_now,
        "career_timeline": CAREER_TIMELINE,
        "top_contractors_by_keyword": top_contractors_by_kw,
    }


@app.get("/search")
def search(
    q: str = Query(..., min_length=1),
    source: str = Query("all"),
    limit: int = Query(20, le=100),
) -> dict:
    """Full-text search across awards, solicitations, and patents via FTS5."""
    results: dict[str, list[dict]] = {"awards": [], "solicitations": [], "patents": []}
    safe_q = q.replace('"', "")  # strip quotes to avoid FTS5 syntax injection

    with sqlite3.connect(str(DB_PATH)) as conn:
        conn.row_factory = sqlite3.Row

        if source in ("all", "awards"):
            rows = conn.execute(
                "SELECT a.* FROM award a "
                "JOIN award_fts f ON a.id = f.rowid "
                "WHERE award_fts MATCH ? ORDER BY rank LIMIT ?",
                (safe_q, limit),
            ).fetchall()
            with Session(ENGINE) as session:
                for row in rows:
                    a = session.get(Award, row["id"])
                    if a:
                        results["awards"].append(_serialize_award(a))

        if source in ("all", "solicitations"):
            rows = conn.execute(
                "SELECT s.* FROM solicitation s "
                "JOIN solicitation_fts f ON s.id = f.rowid "
                "WHERE solicitation_fts MATCH ? ORDER BY rank LIMIT ?",
                (safe_q, limit),
            ).fetchall()
            with Session(ENGINE) as session:
                for row in rows:
                    s = session.get(Solicitation, row["id"])
                    if s:
                        results["solicitations"].append(_serialize_solicitation(s))

        if source in ("all", "patents"):
            rows = conn.execute(
                "SELECT p.* FROM patent p "
                "JOIN patent_fts f ON p.id = f.rowid "
                "WHERE patent_fts MATCH ? ORDER BY rank LIMIT ?",
                (safe_q, limit),
            ).fetchall()
            with Session(ENGINE) as session:
                for row in rows:
                    p = session.get(Patent, row["id"])
                    if p:
                        results["patents"].append(_serialize_patent(p))

    return results


@app.get("/contractor/{name}")
def contractor_detail(
    name: str,
    awards_limit: int = Query(50, le=500),
    patents_limit: int = Query(100, le=500),
    sols_limit: int = Query(50, le=500),
) -> dict:
    """All data for a single canonical contractor."""
    if name not in CONTRACTOR_GROUPS:
        raise HTTPException(status_code=404, detail=f"Unknown contractor: {name}")

    with Session(ENGINE) as session:
        all_awards = session.exec(
            select(Award).order_by(Award.amount.desc()).limit(awards_limit * 10)
        ).all()
        all_patents = session.exec(
            select(Patent).order_by(Patent.grant_date.desc()).limit(patents_limit * 10)
        ).all()
        all_sols = session.exec(
            select(Solicitation)
            .where(Solicitation.status == "open_solicitation")
            .order_by(Solicitation.posted_date.desc())
            .limit(sols_limit * 10)
        ).all()

    awards = [
        _serialize_award(a)
        for a in all_awards
        if _canonical_contractor(a.recipient) == name
    ][:awards_limit]

    patents = [
        _serialize_patent(p)
        for p in all_patents
        if _canonical_contractor(p.assignee) == name
    ][:patents_limit]

    solicitations = [
        _serialize_solicitation(s)
        for s in all_sols
        if _canonical_contractor((s.title or "") + " " + (s.agency or "")) == name
    ][:sols_limit]

    total_contract_dollars = sum(a["amount"] for a in awards)
    kw_counts: dict[str, int] = defaultdict(int)
    for a in awards:
        for kw in a["tech_keywords"]:
            kw_counts[kw] += 1
    for p in patents:
        for kw in p["tech_keywords"]:
            kw_counts[kw] += 1

    return {
        "contractor": name,
        "summary": {
            "total_contract_dollars": total_contract_dollars,
            "award_count": len(awards),
            "patent_count": len(patents),
            "open_solicitation_count": len(solicitations),
            "top_keywords": sorted(kw_counts, key=lambda k: -kw_counts[k])[:5],
        },
        "awards": awards,
        "patents": patents,
        "solicitations": solicitations,
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
