"""Tests for API endpoint behaviour."""

import json
import pytest
from fastapi.testclient import TestClient
from sqlmodel import create_engine, SQLModel


@pytest.fixture()
def client(tmp_path, monkeypatch):
    import sqlite3
    from pathlib import Path

    db_path = tmp_path / "test.db"
    db_url = f"sqlite:///{db_path}"
    test_engine = create_engine(db_url)

    import sentinel.db.search as search_mod
    monkeypatch.setattr(search_mod, "ENGINE", test_engine)
    monkeypatch.setattr(search_mod, "DB_PATH", db_path)

    import sentinel.api.main as main_mod
    monkeypatch.setattr(main_mod, "ENGINE", test_engine)
    monkeypatch.setattr(main_mod, "DB_PATH", db_path)

    from sentinel.db import models  # noqa: F401
    SQLModel.metadata.create_all(test_engine)

    init_sql = (Path(__file__).parents[1] / "sentinel" / "db" / "init.sql").read_text()
    with sqlite3.connect(str(db_path)) as conn:
        conn.executescript(init_sql)

    from sentinel.api.main import app
    return TestClient(app)


def _seed_award(engine):
    from sentinel.db.search import save_award
    import sentinel.db.search as s
    s.ENGINE = engine
    save_award(
        {
            "Award ID": "AW-SEED",
            "Recipient Name": "NORTHROP GRUMMAN CORPORATION",
            "Award Amount": 5_000_000.0,
            "Awarding Agency": "DARPA",
            "Description": "Advanced autonomy platform",
            "Period of Performance Start Date": "2024-06-01",
        },
        {
            "program_name": "Autonomy Test",
            "tech_keywords": ["autonomy", "AI/ML"],
            "classification": "RDT&E",
            "momentum_signal": "new_start",
            "summary": "Advanced autonomy platform contract.",
        },
    )


class TestHealth:
    def test_returns_ok(self, client):
        res = client.get("/health")
        assert res.status_code == 200
        assert res.json() == {"ok": True}


class TestAwards:
    def test_empty_list(self, client):
        res = client.get("/awards")
        assert res.status_code == 200
        assert res.json() == []

    def test_limit_param_accepted(self, client):
        res = client.get("/awards?limit=10")
        assert res.status_code == 200


class TestAggregates:
    def test_returns_matrix_shape(self, client):
        res = client.get("/aggregates")
        assert res.status_code == 200
        body = res.json()
        assert "contractors" in body
        assert "tech_keywords" in body
        assert "matrix" in body
        assert len(body["matrix"]) == len(body["contractors"])
        assert all(len(row) == len(body["tech_keywords"]) for row in body["matrix"])

    def test_all_contractors_present(self, client):
        body = client.get("/aggregates").json()
        for name in ("Northrop Grumman", "Raytheon", "Boeing", "L3Harris", "BAE Systems"):
            assert name in body["contractors"]


class TestContractorDetail:
    def test_unknown_contractor_404(self, client):
        res = client.get("/contractor/Unknown%20Corp")
        assert res.status_code == 404

    def test_known_contractor_returns_shape(self, client):
        res = client.get("/contractor/Boeing")
        assert res.status_code == 200
        body = res.json()
        assert body["contractor"] == "Boeing"
        assert "summary" in body
        assert "awards" in body
        assert "patents" in body
        assert "solicitations" in body


class TestSearch:
    def test_missing_q_422(self, client):
        res = client.get("/search")
        assert res.status_code == 422

    def test_returns_three_keys(self, client):
        res = client.get("/search?q=hypersonic")
        assert res.status_code == 200
        body = res.json()
        assert set(body.keys()) == {"awards", "solicitations", "patents"}

    def test_source_filter_accepted(self, client):
        res = client.get("/search?q=radar&source=awards")
        assert res.status_code == 200
