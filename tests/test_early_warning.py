import pytest
from daybreak import early_warning, analyze


def warning(snapshot, rules):
    return early_warning.detect(snapshot, rules)


def test_fixture_high_and_watch(snapshot, rules):
    proposals, watching = warning(snapshot, rules)
    assert [(p["target"]["number"], p["tier"], p["points"]) for p in proposals] == [(52, "High", 65)]
    assert [p["target"]["number"] for p in watching] == [47, 49, 50]
    assert all(not p["actions"] for p in watching)
    assert proposals[0]["actions"][0]["person"] == "meera"
    assert proposals[0]["actions"][1]["number"] == 48
    result = analyze.build(snapshot, rules)
    assert [p["target"]["number"] for p in result["proposals"]] == [30, 42, 39, 45, 52]


@pytest.mark.parametrize("body", ["Depends on #48", "bLoCkEd BY #48", "DEPENDS ON #48, #30", "depends on #48 and #30"])
def test_dependency_phrases(snapshot, rules, body):
    next(p for p in snapshot["prs"] if p["number"] == 52)["body"] = body
    proposals, _ = warning(snapshot, rules)
    assert "dependency" in proposals[0]["signals"]
    assert len([s for s in proposals[0]["signals"] if s == "dependency"]) == 1


@pytest.mark.parametrize("body", ["Depends on other/repo#48", "Blocked by https://github.com/other/repo/pull/48", "Depends on #999"])
def test_external_missing_dependencies(snapshot, rules, body):
    next(p for p in snapshot["prs"] if p["number"] == 52)["body"] = body
    p = warning(snapshot, rules)[0][0]
    assert p["tier"] == "At risk" and p["points"] == 40
    assert "dependency" not in p["signals"]


def test_closed_dependency(snapshot, rules):
    next(p for p in snapshot["prs"] if p["number"] == 48)["state"] = "closed"
    assert "dependency" not in warning(snapshot, rules)[0][0]["signals"]


def test_grace_and_draft(snapshot, rules):
    p = next(p for p in snapshot["prs"] if p["number"] == 52)
    p["created_at"] = "2026-11-10T03:00:00Z"
    assert "no_reviewer" not in warning(snapshot, rules)[0][0]["signals"]
    p["is_draft"] = True
    assert not warning(snapshot, rules)[0]


def test_workload_counts_drafts(snapshot, rules):
    next(p for p in snapshot["prs"] if p["number"] == 47)["is_draft"] = True
    assert "workload" in warning(snapshot, rules)[0][0]["signals"]


def test_reviewer_tie_and_self_exclusion(snapshot, rules):
    rules["reviewers"] = ["zoe", "amy", "sam"]
    assert warning(snapshot, rules)[0][0]["actions"][0]["person"] == "amy"


def test_no_eligible_reviewer(snapshot, rules):
    rules["reviewers"] = ["sam"]
    actions = warning(snapshot, rules)[0][0]["actions"]
    assert all(a["kind"] == "comment" for a in actions)


def test_warning_cap(snapshot, rules):
    import copy
    second = copy.deepcopy(next(p for p in snapshot["prs"] if p["number"] == 52))
    second["number"] = 60
    second["url"] = "https://github.com/acme/shop/pull/60"
    snapshot["prs"].append(second)
    rules["limits"]["max_warning_proposals"] = 1
    result = analyze.build(snapshot, rules)
    assert [p["target"]["number"] for p in result["proposals"] if p["severity"] == "warning"] == [52]
    assert any(p["id"].startswith("warn-pr60") and p["reason"] == "suppressed_by_cap" for p in result["suppressed"])
