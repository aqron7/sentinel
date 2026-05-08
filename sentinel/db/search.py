"""Shared DB engine, init, and save helpers for awards / solicitations / patents."""

import json
import sqlite3
from pathlib import Path

from sqlmodel import Session, SQLModel, create_engine, select

DB_PATH = Path(__file__).resolve().parents[2] / "sentinel.db"
ENGINE = create_engine(f"sqlite:///{DB_PATH}")


def init_db() -> None:
    from sentinel.db import models  # noqa: F401  -- register tables

    SQLModel.metadata.create_all(ENGINE)
    init_sql = (Path(__file__).parent / "init.sql").read_text()
    with sqlite3.connect(str(DB_PATH)) as conn:
        conn.executescript(init_sql)


def save_award(raw: dict, extracted: dict) -> bool:
    from sentinel.db.models import Award

    award_id = raw.get("Award ID", "")
    with Session(ENGINE) as session:
        if session.exec(select(Award).where(Award.award_id == award_id)).first():
            return False
        session.add(
            Award(
                award_id=award_id,
                recipient=raw.get("Recipient Name", ""),
                amount=raw.get("Award Amount") or 0.0,
                agency=raw.get("Awarding Agency", ""),
                description=raw.get("Description", ""),
                period_start=raw.get("Period of Performance Start Date"),
                program_name=extracted.get("program_name"),
                tech_keywords=json.dumps(extracted.get("tech_keywords", [])),
                classification=extracted.get("classification"),
                momentum_signal=extracted.get("momentum_signal"),
                summary=extracted.get("summary"),
            )
        )
        session.commit()
    return True


def save_solicitation(raw: dict, extracted: dict) -> bool:
    from sentinel.db.models import Solicitation

    notice_id = raw.get("noticeId") or raw.get("solicitationNumber") or ""
    with Session(ENGINE) as session:
        if session.exec(
            select(Solicitation).where(Solicitation.notice_id == notice_id)
        ).first():
            return False
        session.add(
            Solicitation(
                notice_id=notice_id,
                title=raw.get("title", "") or "",
                agency=(raw.get("fullParentPathName") or raw.get("department") or ""),
                posted_date=raw.get("postedDate", "") or "",
                response_deadline=extracted.get("response_deadline")
                or raw.get("responseDeadLine"),
                description=raw.get("description", "") or "",
                tech_keywords=json.dumps(extracted.get("tech_keywords", [])),
                classification=extracted.get("classification"),
                summary=extracted.get("summary"),
            )
        )
        session.commit()
    return True


def save_patent(raw: dict, extracted: dict) -> bool:
    from sentinel.db.models import Patent

    patent_number = raw.get("patent_id") or raw.get("patent_number") or ""
    assignees = raw.get("assignees") or []
    assignee = ""
    if assignees:
        assignee = assignees[0].get("assignee_organization", "") or ""

    with Session(ENGINE) as session:
        if session.exec(
            select(Patent).where(Patent.patent_number == patent_number)
        ).first():
            return False
        session.add(
            Patent(
                patent_number=patent_number,
                assignee=assignee,
                title=raw.get("patent_title", "") or "",
                abstract=raw.get("patent_abstract", "") or "",
                grant_date=raw.get("patent_date", "") or "",
                tech_keywords=json.dumps(extracted.get("tech_keywords", [])),
                classification=extracted.get("classification"),
            )
        )
        session.commit()
    return True
