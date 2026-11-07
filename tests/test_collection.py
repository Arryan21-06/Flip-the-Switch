import json
from types import SimpleNamespace
import pytest
from daybreak.collect import collect
from daybreak.ghclient import GitHub
from daybreak.models import GitHubError


def test_live_collection_mocked_subprocess(monkeypatch, rules, tmp_path):
    calls = []
    def run(args, **kwargs):
        calls.append(args)
        if args[1:3] == ["pr", "list"]:
            data = [] if "merged" in args else [{
                "number": 1, "title": "Work", "url": "https://github.com/a/b/pull/1",
                "author": {"login": "sam"}, "state": "OPEN",
                "reviewRequests": [{"login": "arjun"}],
                "statusCheckRollup": [{"name": "tests", "conclusion": "FAILURE",
                                      "completedAt": "2026-11-09T00:00:00Z"}]}]
        elif args[1:3] == ["issue", "list"]:
            data = []
        elif "timeline" in args[-1]:
            data = [[{"event": "review_requested", "requested_reviewer": {"login": "arjun"},
                      "created_at": "2026-11-08T00:00:00Z"}]]
        else:
            data = [[{"sha": "abc", "html_url": "https://github.com/a/b/commit/abc",
                      "author": None, "commit": {"message": "Title\nBody", "author": None}}]]
        return SimpleNamespace(returncode=0, stdout=json.dumps(data), stderr="")
    monkeypatch.setattr("subprocess.run", run)
    result = collect("github", tmp_path, "a/b", "2026-11-10T04:00:00Z", rules)
    assert result["prs"][0]["review_requests"][0]["requested_at"] == "2026-11-08T00:00:00Z"
    assert result["commits"][0]["author"] is None
    assert result["commits"][0]["message"] == "Title"
    assert len(calls) == 5


def test_github_failure_is_sanitized(monkeypatch):
    monkeypatch.setattr("subprocess.run", lambda *a, **kw: SimpleNamespace(returncode=1, stdout="", stderr="SECRET"))
    with pytest.raises(GitHubError) as error:
        GitHub("a/b").json(["pr", "list"])
    assert "SECRET" not in str(error.value)


def test_real_gh_shapes_regression():
    from daybreak.collect import normalize_pr
    raw = {
        "number": 10,
        "title": "Real GH Shape",
        "url": "https://github.com/acme/repo/pull/10",
        "author": {"login": "dev1"},
        "state": "OPEN",
        "isDraft": False,
        "labels": [{"name": "backend"}],
        "createdAt": "2026-11-01T00:00:00Z",
        "updatedAt": "2026-11-02T00:00:00Z",
        "mergedAt": None,
        "body": "Depends on #5",
        "reviewRequests": [
            {"__typename": "User", "login": "reviewer1"},
            {"__typename": "Team", "slug": "core-team"},
            {"requestedReviewer": {"login": "reviewer2"}},
        ],
        "reviews": [{"author": {"login": "reviewer1"}, "state": "COMMENTED", "submittedAt": "2026-11-03T00:00:00Z"}],
        "reviewDecision": None,
        "statusCheckRollup": [
            # CheckRun shape
            {"__typename": "CheckRun", "name": "unit-tests", "conclusion": "FAILURE", "completedAt": "2026-11-05T12:00:00Z"},
            # StatusContext shape (uses context, state, createdAt)
            {"__typename": "StatusContext", "context": "ci/circleci", "state": "ERROR", "createdAt": "2026-11-05T13:00:00Z"},
        ],
    }
    events = [
        # REST timeline snake_case
        {"event": "review_requested", "requested_reviewer": {"login": "reviewer1"}, "created_at": "2026-11-02T10:00:00Z"},
        # GraphQL timeline camelCase
        {"event": "review_requested", "requestedReviewer": {"login": "reviewer2"}, "createdAt": "2026-11-02T11:00:00Z"},
        # Team review request
        {"event": "review_requested", "requested_team": {"slug": "core-team"}, "created_at": "2026-11-02T09:00:00Z"},
    ]
    pr = normalize_pr(raw, events)
    assert pr["number"] == 10
    assert pr["author"] == "dev1"
    req_map = {r["login"]: r["requested_at"] for r in pr["review_requests"]}
    assert req_map["reviewer1"] == "2026-11-02T10:00:00Z"
    assert req_map["reviewer2"] == "2026-11-02T11:00:00Z"
    assert req_map["team:core-team"] == "2026-11-02T09:00:00Z"

    # Status check rollup handles both CheckRun and StatusContext
    checks = {c["name"]: (c["conclusion"], c["completed_at"]) for c in pr["checks"]}
    assert checks["unit-tests"] == ("FAILURE", "2026-11-05T12:00:00Z")
    assert checks["ci/circleci"] == ("ERROR", "2026-11-05T13:00:00Z")


def test_rules_lowered_for_live_scenarios(rules):
    from daybreak.config import set_rule
    # Verify rules set accepts low/zero values
    updated, _ = set_rule(rules, "early_warning.grace_hours", 0, "lead")
    assert updated["early_warning"]["grace_hours"] == 0

    updated, _ = set_rule(rules, "early_warning.workload_open_prs", 2, "lead")
    assert updated["early_warning"]["workload_open_prs"] == 2

    updated, _ = set_rule(rules, "early_warning.workload_open_prs", 0, "lead")
    assert updated["early_warning"]["workload_open_prs"] == 0

    updated, _ = set_rule(rules, "stuck.review_sla_hours", 0, "lead")
    assert updated["stuck"]["review_sla_hours"] == 0

    updated, _ = set_rule(rules, "stuck.red_ci_hours", 0, "lead")
    assert updated["stuck"]["red_ci_hours"] == 0
