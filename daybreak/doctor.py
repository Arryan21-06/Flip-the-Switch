"""Read-only environment and configuration diagnostics."""
import os
import shutil
import subprocess
import sys
from pathlib import Path
from . import config, timeutil as t
from .models import read_json


def check_python() -> tuple[bool, str]:
    version = sys.version_info
    ver_str = f"{version.major}.{version.minor}.{version.micro}"
    if version >= (3, 11):
        return True, f"Python version: {ver_str} >= 3.11"
    return False, f"Python version: {ver_str} < 3.11 (Python 3.11+ required)"


def check_gh() -> tuple[bool, str]:
    if not shutil.which("gh"):
        return False, "gh installed and authenticated: gh not found on PATH"
    try:
        proc = subprocess.run(["gh", "auth", "status"], capture_output=True, text=True, timeout=10)
        if proc.returncode == 0:
            return True, "gh installed and authenticated"
        return False, "gh installed and authenticated: gh auth status failed (run 'gh auth login')"
    except Exception as exc:
        return False, f"gh installed and authenticated: {exc}"


def check_repo(repo: str | None) -> tuple[bool, str]:
    if not repo:
        return False, "DAYBREAK_REPO readable: repo not set (set DAYBREAK_REPO=OWNER/REPO)"
    if "/" not in repo:
        return False, f"DAYBREAK_REPO readable: '{repo}' is not in OWNER/REPO format"
    if not shutil.which("gh"):
        return False, f"DAYBREAK_REPO readable: gh CLI not available to check '{repo}'"
    try:
        proc = subprocess.run(["gh", "repo", "view", repo, "--json", "nameWithOwner"],
                              capture_output=True, text=True, timeout=15)
        if proc.returncode == 0:
            return True, f"DAYBREAK_REPO readable: '{repo}' is accessible"
        return False, f"DAYBREAK_REPO readable: '{repo}' not found or inaccessible"
    except Exception as exc:
        return False, f"DAYBREAK_REPO readable: {exc}"


def check_state_dir(state_dir: Path) -> tuple[bool, str]:
    try:
        state_dir.mkdir(parents=True, exist_ok=True)
        probe = state_dir / ".doctor_probe"
        probe.write_text("probe")
        probe.unlink()
        return True, f"State directory writable: {state_dir}"
    except Exception as exc:
        return False, f"State directory writable: {state_dir} ({exc})"


def check_rules(state_dir: Path) -> tuple[bool, str]:
    rules_file = state_dir / "rules.json"
    if not rules_file.exists():
        return False, f"rules.json valid: {rules_file} does not exist"
    try:
        data = read_json(rules_file)
        config.validate(data)
        return True, f"rules.json valid: {rules_file}"
    except Exception as exc:
        return False, f"rules.json valid: {exc}"


def check_allow_write() -> tuple[bool, str]:
    val = os.environ.get("DAYBREAK_ALLOW_WRITE")
    if val == "1":
        return True, "ALLOW_WRITE flag state: 1 (enabled: live writes permitted)"
    if val == "0":
        return True, "ALLOW_WRITE flag state: 0 (disabled: safe mode)"
    if val is not None:
        return False, f"ALLOW_WRITE flag state: invalid value {val!r} (must be 0 or 1)"
    return False, "ALLOW_WRITE flag state: unset (export DAYBREAK_ALLOW_WRITE=0 or 1)"


def check_quiet_hours(rules: dict, at_str: str | None = None) -> tuple[bool, str]:
    try:
        at = t.now(at_str)
        local = at.astimezone(t.zone(rules.get("timezone", "Asia/Kolkata")))
        time_str = local.strftime("%H:%M %Z")
        is_quiet = t.quiet(at, rules)
        status = "active (execution will block without --ignore-quiet-hours)" if is_quiet else "inactive"
        return True, f"Quiet-hours state right now: {status} at {time_str}"
    except Exception as exc:
        return False, f"Quiet-hours state right now: error evaluating ({exc})"


def check_webhook() -> tuple[bool, str]:
    url = os.environ.get("MATTERMOST_WEBHOOK_URL", "")
    if url.startswith(("http://", "https://")):
        return True, "MATTERMOST_WEBHOOK_URL format: valid URL"
    if not url:
        return False, "MATTERMOST_WEBHOOK_URL format: not set"
    return False, f"MATTERMOST_WEBHOOK_URL format: must start with http:// or https:// (got {url!r})"


def inspect(args, rules: dict) -> tuple[list[tuple[str, str]], bool]:
    checks = [
        check_python(),
        check_gh(),
        check_repo(args.repo),
        check_state_dir(args.state_dir),
        check_rules(args.state_dir),
        check_allow_write(),
        check_quiet_hours(rules, args.now),
        check_webhook(),
    ]
    all_passed = all(ok for ok, _ in checks)
    formatted = [(("PASS" if ok else "FAIL"), msg) for ok, msg in checks]
    return formatted, all_passed
