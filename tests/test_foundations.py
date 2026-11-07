import copy
import pytest
from daybreak import timeutil as t
from daybreak.config import set_rule, validate
from daybreak.brief import build, render
from daybreak.collect import collect, normalize_pr
from daybreak.models import Blocked
from pathlib import Path

def test_monday_window():
    assert t.iso(t.since(t.now("2026-11-09T04:00:00Z"), "auto", "Asia/Kolkata")) == "2026-11-06T04:00:00Z"

@pytest.mark.parametrize("stamp,expected", [
    ("2026-11-10T03:29:00Z", True), ("2026-11-10T03:30:00Z", False),
    ("2026-11-10T14:30:00Z", True), ("2026-11-06T11:30:00Z", True),
    ("2026-11-06T11:29:00Z", False)])
def test_quiet(rules, stamp, expected):
    assert t.quiet(t.now(stamp), rules) is expected

def test_zone_fallback(monkeypatch):
    def fail(_):
        raise t.ZoneInfoNotFoundError()
    monkeypatch.setattr(t, "ZoneInfo", fail)
    assert t.zone("Asia/Kolkata").utcoffset(None).total_seconds() == 19800
    with pytest.raises(ValueError):
        t.zone("Europe/Unknown")

@pytest.mark.parametrize("key,value", [("team", []), ("unknown", 3), ("quiet_hours.start", "25:00"), ("limits.max_stuck_proposals", 1.5), ("stuck.red_ci_hours", -1), ("standup_minutes", True)])
def test_invalid_rule(rules, key, value):
    with pytest.raises(ValueError):
        set_rule(rules, key, value, "lead")

def test_rule_valid(rules):
    updated, old = set_rule(rules, "stuck.red_ci_hours", 15, "lead")
    assert old == 12 and updated["stuck"]["red_ci_hours"] == 15
    assert rules["stuck"]["red_ci_hours"] == 12

def test_rule_authorization(rules):
    rules["approvers"] = ["lead"]
    with pytest.raises(Blocked):
        set_rule(rules, "standup_minutes", 20, "sam")

def test_fixture_collection(rules):
    result = collect("fixture", Path("fixtures/snapshot_tuesday.json"), None, None, rules)
    assert result["meta"]["now"] == "2026-11-10T04:00:00Z"

def test_brief(snapshot, rules):
    result = build(snapshot, rules, "24h")
    people = {p["login"]: p for p in result["people"]}
    assert [p["number"] for p in people["priya"]["merged"]] == [41]
    assert len(people["priya"]["commits"]) == 3
    assert len(people["arjun"]["commits"]) == 2
    assert len(people["sam"]["commits"]) == 1
    text = render(result, rules)
    assert "@meera\nNo activity found" in text
    assert "#44" not in text and "#55" not in text
    assert "#45" in text and "#53" in text

def test_brief_evidence(snapshot, rules):
    snapshot["prs"][0]["url"] = None
    result = build(snapshot, rules, "24h")
    assert not next(p for p in result["people"] if p["login"] == "priya")["merged"]
    for person in result["people"]:
        for key in ("merged", "opened", "reviewed", "commits", "open_prs", "assigned_issues"):
            assert all(x["url"].startswith("https://") for x in person[key])

def test_brief_window(snapshot, rules):
    snapshot["commits"][0]["date"] = "2026-11-01T00:00:00Z"
    assert len(next(p for p in build(snapshot, rules)["people"] if p["login"] == "priya")["commits"]) == 2

def test_empty_brief(rules):
    result = build({"meta": {"now": "2026-11-10T04:00:00Z"}, "prs": [], "issues": [], "commits": []}, rules)
    assert "No activity found" in render(result, rules)

def test_missing_gh_fields():
    result = normalize_pr({}, [])
    assert result["author"] is None and result["created_at"] is None and result["checks"] == []

def test_latest_request_timestamp():
    result = normalize_pr({"reviewRequests": [{"login": "sam"}, {"slug": "platform"}]}, [
        {"event": "review_requested", "requested_reviewer": {"login": "sam"}, "created_at": "2026-11-08T00:00:00Z"},
        {"event": "review_requested", "requested_reviewer": {"login": "sam"}, "created_at": "2026-11-09T00:00:00Z"}])
    assert result["review_requests"][0]["requested_at"] == "2026-11-09T00:00:00Z"
    assert result["review_requests"][1]["login"] == "team:platform"
