"""FTS5 full-text search helpers. Implemented alongside the API layer."""

from pathlib import Path

from sqlmodel import SQLModel, create_engine

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
