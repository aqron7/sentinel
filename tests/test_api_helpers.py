"""Tests for pure helper functions in api/main.py."""

import pytest


def test_canonical_contractor_known():
    from sentinel.api.main import _canonical_contractor

    assert _canonical_contractor("NORTHROP GRUMMAN CORPORATION") == "Northrop Grumman"
    assert _canonical_contractor("RAYTHEON TECHNOLOGIES CORP") == "Raytheon"
    assert _canonical_contractor("RTX CORPORATION") == "Raytheon"
    assert _canonical_contractor("GENERAL ATOMICS AERONAUTICAL") == "General Atomics"
    assert _canonical_contractor("LOCKHEED MARTIN CORP") == "Lockheed Martin"
    assert _canonical_contractor("BOEING DEFENSE") == "Boeing"
    assert _canonical_contractor("L3HARRIS TECHNOLOGIES INC") == "L3Harris"
    assert _canonical_contractor("BAE SYSTEMS INC") == "BAE Systems"


def test_canonical_contractor_unknown():
    from sentinel.api.main import _canonical_contractor

    assert _canonical_contractor("ACME CORP") is None
    assert _canonical_contractor("") is None
    assert _canonical_contractor(None) is None


def test_parse_keywords_valid():
    from sentinel.api.main import _parse_keywords

    assert _parse_keywords('["hypersonics", "cyber"]') == ["hypersonics", "cyber"]


def test_parse_keywords_empty():
    from sentinel.api.main import _parse_keywords

    assert _parse_keywords(None) == []
    assert _parse_keywords("") == []
    assert _parse_keywords("not json") == []
