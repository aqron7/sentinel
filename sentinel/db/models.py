from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Award(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    award_id: str = Field(index=True, unique=True)
    recipient: str = Field(index=True)
    amount: float
    agency: str
    description: str
    period_start: Optional[str] = None

    program_name: Optional[str] = None
    tech_keywords: Optional[str] = None  # JSON-encoded list
    classification: Optional[str] = Field(default=None, index=True)
    momentum_signal: Optional[str] = None
    summary: Optional[str] = None

    fetched_at: datetime = Field(default_factory=datetime.utcnow)


class Solicitation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    notice_id: str = Field(index=True, unique=True)
    title: str
    agency: str
    posted_date: str
    response_deadline: Optional[str] = None
    description: str
    status: str = Field(default="open_solicitation", index=True)

    tech_keywords: Optional[str] = None
    classification: Optional[str] = Field(default=None, index=True)
    summary: Optional[str] = None

    fetched_at: datetime = Field(default_factory=datetime.utcnow)


class Patent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    patent_number: str = Field(index=True, unique=True)
    assignee: str = Field(index=True)
    title: str
    abstract: str
    grant_date: str

    tech_keywords: Optional[str] = None
    classification: Optional[str] = Field(default=None, index=True)

    fetched_at: datetime = Field(default_factory=datetime.utcnow)
