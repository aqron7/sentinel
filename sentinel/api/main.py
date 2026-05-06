from fastapi import FastAPI
from sqlmodel import Session, select

from sentinel.db.models import Award
from sentinel.db.search import ENGINE

app = FastAPI(title="Sentinel")


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.get("/awards")
def list_awards(limit: int = 50) -> list[Award]:
    with Session(ENGINE) as session:
        return list(session.exec(select(Award).order_by(Award.amount.desc()).limit(limit)))
