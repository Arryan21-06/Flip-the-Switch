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
