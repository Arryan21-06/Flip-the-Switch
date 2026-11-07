import copy
import pytest
from daybreak import analyze, stuck, proposals, timeutil as t


def test_exact_stuck(snapshot, rules):
    result = analyze.build(snapshot, rules, include_warnings=False)
    assert [(p["index"], p["target"]["number"], p["over_hours"]) for p in result["proposals"]] == [(1, 30, 24), (2, 42, 7), (3, 39, 2), (4, 45, 2)]


@pytest.mark.parametrize("number,kind", [(42, "review_stuck"), (45, "ci_red"), (39, "approved_unmerged"), (30, "stale_issue")])
def test_stuck_positive_negative(snapshot, rules, number, kind):
    assert any(p["type"] == kind and p["target"]["number"] == number for p in stuck.detect(snapshot, rules))
    for item in snapshot["prs"] + snapshot["issues"]:
        if item["number"] == number:
            item["state"] = "closed"
    assert not any(p["type"] == kind and p["target"]["number"] == number for p in stuck.detect(snapshot, rules))


def test_drafts_and_teams(snapshot, rules):
    for pr in snapshot["prs"]:
        pr["is_draft"] = True
    assert all(p["target"]["kind"] == "issue" for p in stuck.detect(snapshot, rules))
    snapshot["prs"][1]["is_draft"] = False
    snapshot["prs"][1]["review_requests"][0]["login"] = "team:platform"
    assert not any(p["type"] == "review_stuck" for p in stuck.detect(snapshot, rules))


def test_latest_approval(snapshot, rules):
    next(x for x in snapshot["prs"] if x["number"] == 39)["reviews"].append({"state": "APPROVED", "submitted_at": "2026-11-10T03:00:00Z"})
    assert not any(p["type"] == "approved_unmerged" for p in stuck.detect(snapshot, rules))


def test_cap(snapshot, rules):
    rules["limits"]["max_stuck_proposals"] = 2
    result = analyze.build(snapshot, rules)
    assert [p["target"]["number"] for p in result["proposals"] if p["severity"] == "stuck"] == [30, 42]
    assert [x["reason"] for x in result["suppressed"]] == ["suppressed_by_cap"] * 2


def test_ids_and_carryover(snapshot, rules):
    first = analyze.build(snapshot, rules)
    second = analyze.build(snapshot, rules, first["proposals"])
    assert first == second
    assert first["proposals"][1]["id"] == "nudge-review-pr42-2026-11-10"


def test_snooze_and_budget(snapshot, rules):
    previous = analyze.build(snapshot, rules)["proposals"]
    previous[0].update(status="snoozed", snooze_until="2026-11-12T04:00:00Z")
    result = analyze.build(snapshot, rules, previous, {"nudges": {"2026-11-10": {"arjun": 2}}})
    assert [p["target"]["number"] for p in result["proposals"] if p["severity"] == "stuck"] == [45]
    assert {x["reason"] for x in result["suppressed"]} == {"snoozed", "nudge_budget"}


def test_executed_suppression(snapshot, rules):
    first = analyze.build(snapshot, rules)["proposals"]
    result = analyze.build(snapshot, rules, first, {"executed": {first[0]["id"]: {}}})
    assert [p["index"] for p in result["proposals"]] == [2, 3, 4, 5]


def test_duplicate_target(snapshot, rules):
    pr = next(x for x in snapshot["prs"] if x["number"] == 42)
    pr["checks"] = [{"conclusion": "FAILURE", "completed_at": "2026-11-08T00:00:00Z"}]
    result = analyze.build(snapshot, rules)
    assert len([p for p in result["proposals"] if p["target"]["number"] == 42]) == 1
    assert any(x["reason"] == "duplicate_target" for x in result["suppressed"])
