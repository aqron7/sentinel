"""Tests for DB save helpers and duplicate detection."""

import json
import pytest
from sqlmodel import create_engine, Session, SQLModel, select


@pytest.fixture()
def engine(tmp_path, monkeypatch):
    db_url = f"sqlite:///{tmp_path}/test.db"
    test_engine = create_engine(db_url)

    # Patch sentinel.db.search.ENGINE before models are imported
    import sentinel.db.search as search_mod
    monkeypatch.setattr(search_mod, "ENGINE", test_engine)
    monkeypatch.setattr(search_mod, "DB_PATH", tmp_path / "test.db")

    from sentinel.db import models  # noqa: F401
    SQLModel.metadata.create_all(test_engine)
    return test_engine


def _raw_award(award_id="AWARD-001"):
    return {
        "Award ID": award_id,
        "Recipient Name": "NORTHROP GRUMMAN CORPORATION",
        "Award Amount": 1_000_000.0,
        "Awarding Agency": "Department of Defense",
        "Description": "Test hypersonic glide vehicle contract",
        "Period of Performance Start Date": "2024-01-01",
    }


def _raw_patent(patent_id="US123456"):
    return {
        "patent_id": patent_id,
        "patent_title": "Hypersonic vehicle guidance system",
        "patent_abstract": "A system for guiding hypersonic vehicles.",
        "patent_date": "2024-03-15",
        "assignees": [{"assignee_organization": "Northrop Grumman"}],
    }


def _raw_solicitation(notice_id="SOL-001"):
    return {
        "noticeId": notice_id,
        "title": "Directed Energy Weapon System",
        "fullParentPathName": "DEPARTMENT OF DEFENSE",
        "postedDate": "2024-02-01",
        "responseDeadLine": "2024-03-01",
        "description": "RFP for a directed energy weapon system.",
    }


def _extracted():
    return {
        "program_name": "Test Program",
        "tech_keywords": ["hypersonics", "autonomy"],
        "classification": "missile",
        "momentum_signal": "new_start",
        "summary": "Test summary.",
    }


class TestSaveAward:
    def test_saves_new_award(self, engine):
        from sentinel.db.search import save_award
        from sentinel.db.models import Award

        inserted = save_award(_raw_award(), _extracted())
        assert inserted is True
        with Session(engine) as s:
            row = s.exec(select(Award)).first()
        assert row is not None
        assert row.award_id == "AWARD-001"
        assert row.amount == 1_000_000.0
        assert json.loads(row.tech_keywords) == ["hypersonics", "autonomy"]

    def test_deduplicates_on_award_id(self, engine):
        from sentinel.db.search import save_award

        first = save_award(_raw_award(), _extracted())
        second = save_award(_raw_award(), _extracted())
        assert first is True
        assert second is False

    def test_different_ids_both_saved(self, engine):
        from sentinel.db.search import save_award

        assert save_award(_raw_award("A-001"), _extracted()) is True
        assert save_award(_raw_award("A-002"), _extracted()) is True


class TestSavePatent:
    def test_saves_new_patent(self, engine):
        from sentinel.db.search import save_patent
        from sentinel.db.models import Patent

        inserted = save_patent(_raw_patent(), {"tech_keywords": ["hypersonics"], "classification": "missile"})
        assert inserted is True
        with Session(engine) as s:
            row = s.exec(select(Patent)).first()
        assert row.patent_number == "US123456"
        assert row.assignee == "Northrop Grumman"

    def test_deduplicates_on_patent_number(self, engine):
        from sentinel.db.search import save_patent

        ext = {"tech_keywords": ["radar"], "classification": "aircraft"}
        assert save_patent(_raw_patent(), ext) is True
        assert save_patent(_raw_patent(), ext) is False


class TestSaveSolicitation:
    def test_saves_new_solicitation(self, engine):
        from sentinel.db.search import save_solicitation
        from sentinel.db.models import Solicitation

        inserted = save_solicitation(_raw_solicitation(), _extracted())
        assert inserted is True
        with Session(engine) as s:
            row = s.exec(select(Solicitation)).first()
        assert row.notice_id == "SOL-001"
        assert row.status == "open_solicitation"

    def test_deduplicates_on_notice_id(self, engine):
        from sentinel.db.search import save_solicitation

        assert save_solicitation(_raw_solicitation(), _extracted()) is True
        assert save_solicitation(_raw_solicitation(), _extracted()) is False
