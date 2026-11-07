"""Tests simulating the live 3-PR demonstration scenario and state isolation."""
import copy
import pytest
from daybreak import analyze, config, decide, early_warning, execute, ledger, timeutil as t
from daybreak.cli import main
from daybreak.models import Blocked, write_json

AT = t.now("2026-11-10T04:00:00Z")


@pytest.fixture
def live_scenario_snapshot():
    return {
        "meta": {"repo": "test-org/throwaway", "source": "github", "now": "2026-11-10T04:00:00Z"},
        "prs": [
            {
                "number": 1,
                "title": "PR A - Dependency Target",
                "url": "https://github.com/test-org/throwaway/pull/1",
                "author": "demo-author",
                "state": "open",
                "is_draft": False,
                "labels": [],
                "created_at": "2026-11-10T03:00:00Z",
                "updated_at": "2026-11-10T03:00:00Z",
                "merged_at": None,
                "body": "Base dependency PR",
                "review_requests": [],
                "reviews": [],
                "review_decision": None,
                "checks": [],
            },
            {
                "number": 2,
                "title": "PR B - Depends on #1",
                "url": "https://github.com/test-org/throwaway/pull/2",
                "author": "demo-author",
                "state": "open",
                "is_draft": False,
                "labels": [],
                "created_at": "2026-11-10T03:30:00Z",
                "updated_at": "2026-11-10T03:30:00Z",
                "merged_at": None,
                "body": "Feature branch. Depends on #1.",
                "review_requests": [],
                "reviews": [],
                "review_decision": None,
                "checks": [],
            },
            {
                "number": 3,
                "title": "PR C - Workload filler",
                "url": "https://github.com/test-org/throwaway/pull/3",
                "author": "demo-author",
                "state": "open",
                "is_draft": False,
                "labels": [],
                "created_at": "2026-11-10T03:45:00Z",
                "updated_at": "2026-11-10T03:45:00Z",
                "merged_at": None,
                "body": "Another PR to fill author workload.",
                "review_requests": [],
                "reviews": [],
                "review_decision": None,
                "checks": [],
            },
        ],
        "issues": [],
        "commits": [],
    }


def test_live_scenario_detection_and_reviewers(live_scenario_snapshot, rules):
    # Setup live scenario rules: grace_hours 0, workload_open_prs 2
    rules["early_warning"]["grace_hours"] = 0
    rules["early_warning"]["workload_open_prs"] = 2
    # Ensure there is a collaborator reviewer
    rules["reviewers"] = ["collaborator", "demo-author"]

    candidates, watching = early_warning.detect(live_scenario_snapshot, rules)

    # 1. PR B is High (3 signals: no_reviewer, workload, dependency = 65 pts)
    pr_b = next(p for p in candidates if p["target"]["number"] == 2)
    assert pr_b["tier"] == "High"
    assert pr_b["points"] == 65
    assert set(pr_b["signals"]) == {"no_reviewer", "workload", "dependency"}

    # 2. PR A and PR C also appear as At risk (2 signals: no_reviewer, workload = 40 pts)
    pr_a = next(p for p in candidates if p["target"]["number"] == 1)
    pr_c = next(p for p in candidates if p["target"]["number"] == 3)
    assert pr_a["tier"] == "At risk"
    assert pr_a["points"] == 40
    assert pr_c["tier"] == "At risk"
    assert pr_c["points"] == 40

    # 3. Actions for PR B with collaborator available
    action_kinds = [a["kind"] for a in pr_b["actions"]]
    assert "request_review" in action_kinds
    assert "comment" in action_kinds
    req_act = next(a for a in pr_b["actions"] if a["kind"] == "request_review")
    assert req_act["person"] == "collaborator"

    # 4. When rules.reviewers has NO eligible collaborator (only author or empty):
    rules_no_collab = copy.deepcopy(rules)
    rules_no_collab["reviewers"] = ["demo-author"]  # author cannot review self
    candidates_no_collab, _ = early_warning.detect(live_scenario_snapshot, rules_no_collab)
    pr_b_no_collab = next(p for p in candidates_no_collab if p["target"]["number"] == 2)

    # Should have no request_review action, but still has comment on #1, with zero crash
    kinds = [a["kind"] for a in pr_b_no_collab["actions"]]
    assert "request_review" not in kinds
    assert "comment" in kinds
    assert pr_b_no_collab["actions"][0]["number"] == 1


def test_live_scenario_capping(live_scenario_snapshot, rules):
    rules["early_warning"]["grace_hours"] = 0
    rules["early_warning"]["workload_open_prs"] = 2
    # With default max_warning_proposals = 2:
    res = analyze.build(live_scenario_snapshot, rules)
    # PR B (High) and PR A (At risk) are included; PR C suppressed by cap
    assert [p["target"]["number"] for p in res["proposals"]] == [2, 1]

    # With limits.max_warning_proposals set to 1 for a clean single-target demo:
    rules["limits"]["max_warning_proposals"] = 1
    res_clean = analyze.build(live_scenario_snapshot, rules)
    assert [p["target"]["number"] for p in res_clean["proposals"]] == [2]
    assert [s["target"]["number"] for s in res_clean["suppressed"] if s["reason"] == "suppressed_by_cap"] == [1, 3]


def test_live_execute_refuses_fixture_source(snapshot, rules, tmp_path, monkeypatch):
    monkeypatch.setenv("DAYBREAK_ALLOW_WRITE", "1")
    # Prepare fixture proposal batch
    state_dir = tmp_path / "state-demo"
    state_dir.mkdir()
    write_json(state_dir / "snapshot.json", snapshot)
    write_json(state_dir / "rules.json", rules)
    batch = analyze.build(snapshot, rules)["proposals"]
    book = ledger.load(state_dir)
    batch, book = decide.decide(batch, book, rules, "approve", [1], "lead", AT)
    write_json(state_dir / "proposals" / f"{t.local_date(AT, rules)}.json", batch)
    ledger.save(state_dir, book)

    # Calling CLI execute against live repo with fixture-sourced proposals must block
    exit_code = main(["execute", "--state-dir", str(state_dir), "--repo", "acme/live-repo"])
    assert exit_code == 3
