"""Unit tests for the daybreak doctor diagnostics command."""
import os
import sys
from pathlib import Path
from types import SimpleNamespace
import pytest
from daybreak.cli import main
from daybreak import doctor, config


def test_doctor_python_version():
    ok, msg = doctor.check_python()
    assert ok is True
    assert ">= 3.11" in msg


def test_doctor_gh_mocked(monkeypatch):
    def fake_run(args, **kwargs):
        if args == ["gh", "auth", "status"]:
            return SimpleNamespace(returncode=0, stdout="Logged in", stderr="")
        if args[:4] == ["gh", "repo", "view", "test/repo"]:
            return SimpleNamespace(returncode=0, stdout='{"nameWithOwner": "test/repo"}', stderr="")
        return SimpleNamespace(returncode=1, stdout="", stderr="error")

    monkeypatch.setattr("subprocess.run", fake_run)
    monkeypatch.setattr("shutil.which", lambda cmd: "/usr/bin/gh")

    ok_gh, msg_gh = doctor.check_gh()
    assert ok_gh is True

    ok_repo, msg_repo = doctor.check_repo("test/repo")
    assert ok_repo is True

    # When repo fails
    ok_repo_bad, _ = doctor.check_repo("bad/repo")
    assert ok_repo_bad is False


def test_doctor_allow_write_states(monkeypatch):
    monkeypatch.setenv("DAYBREAK_ALLOW_WRITE", "1")
    ok, msg = doctor.check_allow_write()
    assert ok is True and "enabled" in msg

    monkeypatch.setenv("DAYBREAK_ALLOW_WRITE", "0")
    ok, msg = doctor.check_allow_write()
    assert ok is True and "disabled" in msg

    monkeypatch.setenv("DAYBREAK_ALLOW_WRITE", "maybe")
    ok, msg = doctor.check_allow_write()
    assert ok is False and "invalid" in msg

    monkeypatch.delenv("DAYBREAK_ALLOW_WRITE", raising=False)
    ok, msg = doctor.check_allow_write()
    assert ok is True and "safe default" in msg


def test_doctor_webhook_format(monkeypatch):
    monkeypatch.setenv("MATTERMOST_WEBHOOK_URL", "https://chat.example.com/hooks/123")
    status, _ = doctor.check_webhook()
    assert status == "PASS"

    monkeypatch.setenv("MATTERMOST_WEBHOOK_URL", "http://localhost:8065/hooks/123")
    status, _ = doctor.check_webhook()
    assert status == "PASS"

    monkeypatch.setenv("MATTERMOST_WEBHOOK_URL", "ftp://invalid")
    status, _ = doctor.check_webhook()
    assert status == "FAIL"

    monkeypatch.delenv("MATTERMOST_WEBHOOK_URL", raising=False)
    status, _ = doctor.check_webhook()
    assert status == "INFO"


def test_doctor_rules_and_state(tmp_path):
    ok_state, _ = doctor.check_state_dir(tmp_path)
    assert ok_state is True

    # Rules file not present
    ok_rules, _ = doctor.check_rules(tmp_path)
    assert ok_rules is False

    # Valid rules file written
    rules_file = tmp_path / "rules.json"
    rules_file.write_text('{"timezone": "Asia/Kolkata", "quiet_hours": {"start": "20:00", "end": "09:00", "friday_cutoff": "17:00"}, "stuck": {"review_sla_hours": 24, "red_ci_hours": 12, "approved_unmerged_hours": 24, "stale_issue_days": 3}, "early_warning": {"grace_hours": 4, "workload_open_prs": 3, "points": {"no_reviewer": 20, "workload": 20, "dependency": 25}}, "limits": {"max_stuck_proposals": 4, "max_warning_proposals": 2, "max_nudges_per_person_per_day": 2}, "reviewers": ["arjun"], "approvers": [], "team": [{"github": "priya", "chat": "priya", "name": "Priya"}], "standup_minutes": 15}')
    ok_rules, _ = doctor.check_rules(tmp_path)
    assert ok_rules is True


def test_doctor_exit_codes(tmp_path, monkeypatch):
    # Setup state
    rules_file = tmp_path / "rules.json"
    rules_file.write_text('{"timezone": "Asia/Kolkata", "quiet_hours": {"start": "20:00", "end": "09:00", "friday_cutoff": "17:00"}, "stuck": {"review_sla_hours": 24, "red_ci_hours": 12, "approved_unmerged_hours": 24, "stale_issue_days": 3}, "early_warning": {"grace_hours": 4, "workload_open_prs": 3, "points": {"no_reviewer": 20, "workload": 20, "dependency": 25}}, "limits": {"max_stuck_proposals": 4, "max_warning_proposals": 2, "max_nudges_per_person_per_day": 2}, "reviewers": ["arjun"], "approvers": [], "team": [{"github": "priya", "chat": "priya", "name": "Priya"}], "standup_minutes": 15}')

    def fake_run(args, **kwargs):
        if args == ["gh", "auth", "status"]:
            return SimpleNamespace(returncode=0, stdout="", stderr="")
        if args[:4] == ["gh", "repo", "view", "acme/repo"]:
            return SimpleNamespace(returncode=0, stdout='{"nameWithOwner": "acme/repo"}', stderr="")
        return SimpleNamespace(returncode=1, stdout="", stderr="")

    monkeypatch.setattr("subprocess.run", fake_run)
    monkeypatch.setattr("shutil.which", lambda cmd: "/usr/bin/gh")
    monkeypatch.setenv("DAYBREAK_ALLOW_WRITE", "0")
    monkeypatch.setenv("DAYBREAK_REPO", "acme/repo")
    monkeypatch.setenv("MATTERMOST_WEBHOOK_URL", "https://chat.acme.com/hooks/123")

    # All pass -> exit 0
    exit_code = main(["doctor", "--state-dir", str(tmp_path)])
    assert exit_code == 0

    # With missing optional webhook -> still exit 0 (INFO)
    monkeypatch.delenv("MATTERMOST_WEBHOOK_URL", raising=False)
    exit_code = main(["doctor", "--state-dir", str(tmp_path)])
    assert exit_code == 0

    # With missing required repo -> exit 3
    monkeypatch.delenv("DAYBREAK_REPO", raising=False)
    exit_code = main(["doctor", "--state-dir", str(tmp_path)])
    assert exit_code == 3
