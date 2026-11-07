"""Small JSON models, evidence validation and atomic persistence."""
import json
import os
import tempfile
from pathlib import Path
from urllib.parse import urlparse


class Blocked(Exception):
    """Operation is disallowed by policy."""


class GitHubError(Exception):
    """Sanitized upstream failure."""


def evidence(url: object) -> bool:
    if not isinstance(url, str):
        return False
    parsed = urlparse(url)
    return parsed.scheme in ("https", "http") and bool(parsed.netloc)


def read_json(path: Path, default=None):
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text())
    except (ValueError, OSError):
        raise ValueError(f"Cannot read valid JSON: {path}") from None


def write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix=".daybreak-", dir=path.parent)
    try:
        with os.fdopen(fd, "w") as stream:
            json.dump(data, stream, indent=2, sort_keys=True, ensure_ascii=False)
            stream.write("\n")
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def snapshot(data: dict) -> dict:
    if not isinstance(data, dict) or not isinstance(data.get("meta"), dict):
        raise ValueError("Snapshot needs meta")
    from .timeutil import parse
    if not parse(data["meta"].get("now")):
        raise ValueError("Snapshot needs a valid meta.now")
    for key in ("prs", "issues", "commits"):
        data[key] = data.get(key) or []
        if not isinstance(data[key], list) or any(not isinstance(x, dict) for x in data[key]):
            raise ValueError(f"Snapshot {key} must be a list of objects")
    for pr in data["prs"]:
        for key in ("labels", "review_requests", "reviews", "checks"):
            pr[key] = pr.get(key) or []
    for issue in data["issues"]:
        for key in ("labels", "assignees"):
            issue[key] = issue.get(key) or []
    return data
