import copy
import pytest
from daybreak import analyze, decide, execute, ledger, timeutil as t
from daybreak.models import Blocked, GitHubError

AT = t.now("2026-11-10T04:00:00Z")


class FakeGitHub:
    repo = "acme/shop"
    def __init__(self):
        self.writes = []
        self.comments = []
        self.requested = []
        self.fail_number = None
    def pages(self, endpoint):
        return self.comments if "/comments" in endpoint else []
    def json(self, args):
        return {"reviewRequests": [{"login": x} for x in self.requested]}
    def run(self, args, body=None):
        self.writes.append((args, body))
        if str(self.fail_number) == args[2]:
            raise GitHubError("Simulated failure")
        if "comment" in args:
            self.comments.append({"body": body, "html_url": "https://github.com/acme/shop/issues/30#issuecomment-1"})
            return self.comments[-1]["html_url"]
        self.requested.append(args[-1])
        return ""


def prepared(snapshot, rules, tmp_path, indices=(1,)):
    snapshot["meta"]["source"] = "github"
    batch = analyze.build(snapshot, rules)["proposals"]
    return decide.decide(batch, ledger.load(tmp_path), rules, "approve", list(indices), "lead", AT)


def call(batch, book, rules, tmp_path, gh, **kwargs):
    return execute.execute(batch, book, rules, AT, tmp_path, tmp_path / "proposals.json",
                           "acme/shop", client=gh, **kwargs)


def test_unknown_index_atomic(snapshot, rules, tmp_path):
    batch = analyze.build(snapshot, rules)["proposals"]
    before = copy.deepcopy(batch)
    with pytest.raises(ValueError):
        decide.decide(batch, ledger.load(tmp_path), rules, "approve", [1, 99], "lead", AT)
    assert batch == before


def test_approver_check(snapshot, rules, tmp_path):
    rules["approvers"] = ["owner"]
    with pytest.raises(Blocked):
        prepared(snapshot, rules, tmp_path)


def test_snooze_expiry(snapshot, rules, tmp_path):
    batch = analyze.build(snapshot, rules)["proposals"]
    batch, book = decide.decide(batch, ledger.load(tmp_path), rules, "snooze", [1], "lead", AT, "2d")
    assert batch[0]["snooze_until"] == "2026-11-12T04:00:00Z"
    snapshot["meta"]["now"] = "2026-11-12T04:00:00Z"
    assert any(p["target"]["number"] == 30 for p in analyze.build(snapshot, rules, history=batch)["proposals"])


def test_skip_log(snapshot, rules, tmp_path):
    batch = analyze.build(snapshot, rules)["proposals"]
    batch, book = decide.decide(batch, ledger.load(tmp_path), rules, "skip", [1], "lead", AT)
    assert batch[0]["status"] == "skipped"
    assert book["decisions"][0]["approver"] == "lead"


def test_dry_run_no_state_or_network(snapshot, rules, tmp_path):
    batch, book = prepared(snapshot, rules, tmp_path)
    before = copy.deepcopy((batch, book))
    result = call(batch, book, rules, tmp_path, object(), dry_run=True)
    assert result["dry_run"] and not list(tmp_path.iterdir())
    assert (batch, book) == before


def test_refuse_unapproved(snapshot, rules, tmp_path):
    batch = analyze.build(snapshot, rules)["proposals"]
    with pytest.raises(Blocked):
        call(batch, ledger.load(tmp_path), rules, tmp_path, FakeGitHub())


def test_write_flag(snapshot, rules, tmp_path, monkeypatch):
    monkeypatch.delenv("DAYBREAK_ALLOW_WRITE", raising=False)
    batch, book = prepared(snapshot, rules, tmp_path)
    with pytest.raises(Blocked):
        call(batch, book, rules, tmp_path, FakeGitHub())


def test_quiet_preserves_approval(snapshot, rules, tmp_path):
    batch, book = prepared(snapshot, rules, tmp_path)
    with pytest.raises(Blocked, match="Quiet"):
        execute.execute(batch, book, rules, t.now("2026-11-10T16:00:00Z"),
                        tmp_path, tmp_path / "p.json", "acme/shop", dry_run=True)
    assert batch[0]["status"] == "approved"


def test_execute_idempotent(snapshot, rules, tmp_path, monkeypatch):
    monkeypatch.setenv("DAYBREAK_ALLOW_WRITE", "1")
    batch, book = prepared(snapshot, rules, tmp_path, (1, 2, 3, 4))
    gh = FakeGitHub()
    result = call(batch, book, rules, tmp_path, gh)
    assert not result["failed"] and len(gh.writes) == 4
    assert all(body.startswith("[Daybreak, approved by @lead]") and body.endswith("-->") for _, body in gh.writes)
    call(batch, book, rules, tmp_path, gh)
    assert len(gh.writes) == 4
    assert book["nudges"]["2026-11-10"]["arjun"] == 2


def test_marker_recovery_without_execution_ledger(snapshot, rules, tmp_path, monkeypatch):
    monkeypatch.setenv("DAYBREAK_ALLOW_WRITE", "1")
    batch, book = prepared(snapshot, rules, tmp_path)
    gh = FakeGitHub()
    gh.comments = [{"body": f"<!-- daybreak:{batch[0]['id']} -->", "html_url": "https://github.com/x/y#1"}]
    call(batch, book, rules, tmp_path, gh)
    assert not gh.writes and batch[0]["status"] == "executed"


def test_partial_failure_continues(snapshot, rules, tmp_path, monkeypatch):
    monkeypatch.setenv("DAYBREAK_ALLOW_WRITE", "1")
    batch, book = prepared(snapshot, rules, tmp_path, (1, 2))
    gh = FakeGitHub()
    gh.fail_number = 30
    result = call(batch, book, rules, tmp_path, gh)
    assert result["failed"] and batch[0]["status"] == "failed"
    assert batch[1]["status"] == "executed" and len(gh.writes) == 2
    batch, book = decide.decide(batch, book, rules, "approve", [1], "lead", AT)
    call(batch, book, rules, tmp_path, gh)
    assert len(gh.writes) == 2  # Uncertain write is never blindly repeated.


def test_tampered_approval_blocked(snapshot, rules, tmp_path):
    batch, book = prepared(snapshot, rules, tmp_path)
    batch[0]["actions"][0]["body"] = "Changed after approval"
    with pytest.raises(Blocked, match="contents"):
        call(batch, book, rules, tmp_path, object(), dry_run=True)


def test_fixture_live_write_refused(snapshot, rules, tmp_path, monkeypatch):
    monkeypatch.setenv("DAYBREAK_ALLOW_WRITE", "1")
    batch = analyze.build(snapshot, rules)["proposals"]
    batch, book = decide.decide(batch, ledger.load(tmp_path), rules, "approve", [1], "lead", AT)
    with pytest.raises(Blocked, match="live repository"):
        call(batch, book, rules, tmp_path, object())


def test_budget_rechecked(snapshot, rules, tmp_path, monkeypatch):
    monkeypatch.setenv("DAYBREAK_ALLOW_WRITE", "1")
    batch, book = prepared(snapshot, rules, tmp_path)
    book["nudges"] = {"2026-11-10": {"sam": 2}}
    gh = FakeGitHub()
    call(batch, book, rules, tmp_path, gh)
    assert not gh.writes and book["budget_skips"]
