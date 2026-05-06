"""FTS5 full-text search helpers and shared DB helpers."""

import json
from pathlib import Path

from sqlmodel import Session, SQLModel, create_engine, select

DB_PATH = Path(__file__).resolve().parents[2] / "sentinel.db"
ENGINE = create_engine(f"sqlite:///{DB_PATH}")


def init_db() -> None:
    from sentinel.db import models  # noqa: F401  -- register tables

    SQLModel.metadata.create_all(ENGINE)
    init_sql = (Path(__file__).parent / "init.sql").read_text()
    with ENGINE.begin() as conn:
        for stmt in init_sql.split(";"):
            if stmt.strip():
                conn.exec_driver_sql(stmt)


def save_award(raw: dict, extracted: dict) -> bool:
    """Persist one award. Returns True if inserted, False if already exists."""
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
