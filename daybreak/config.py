"""Default rules and explicitly allowlisted validated changes."""
import copy
import re
from pathlib import Path
from .models import Blocked, read_json, write_json
from .timeutil import zone

ROOT = Path(__file__).resolve().parent.parent


def daybreak_home() -> Path:
    import os
    return Path(os.environ.get("DAYBREAK_HOME", Path.home() / ".daybreak")).expanduser()


def user_config() -> dict:
    config_file = daybreak_home() / "config.json"
    if config_file.exists():
        try:
            return read_json(config_file, {}) or {}
        except Exception:
            return {}
    return {}


DEFAULTS = {
    "timezone": "Asia/Kolkata",
    "quiet_hours": {"start": "20:00", "end": "09:00", "friday_cutoff": "17:00"},
    "stuck": {"review_sla_hours": 24, "red_ci_hours": 12,
              "approved_unmerged_hours": 24, "stale_issue_days": 3},
    "early_warning": {"grace_hours": 4, "workload_open_prs": 3,
                      "points": {"no_reviewer": 20, "workload": 20, "dependency": 25}},
    "limits": {"max_stuck_proposals": 4, "max_warning_proposals": 2,
               "max_nudges_per_person_per_day": 2},
    "reviewers": ["arjun", "meera"], "approvers": [],
    "team": [{"github": "priya", "chat": "priya", "name": "Priya"}],
    "standup_minutes": 15,
}


def leaves(value: dict, prefix: str = "") -> dict:
    result = {}
    for key, item in value.items():
        path = f"{prefix}.{key}" if prefix else key
        if isinstance(item, dict):
            result.update(leaves(item, path))
        else:
            result[path] = item
    return result


def validate(rules: dict) -> dict:
    defaults = leaves(DEFAULTS)
    values = leaves(rules)
    if set(defaults) != set(values):
        raise ValueError("Rules have missing or unknown keys")
    for key, value in values.items():
        original = defaults[key]
        if key == "timezone":
            if not isinstance(value, str):
                raise ValueError("timezone must be a string")
            zone(value)
        elif key.startswith("quiet_hours."):
            if not isinstance(value, str) or not re.fullmatch(r"(?:[01]\d|2[0-3]):[0-5]\d", value):
                raise ValueError(f"{key} must be HH:MM")
        elif key in ("reviewers", "approvers"):
            if not isinstance(value, list) or any(not isinstance(x, str) or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9-]*", x) for x in value):
                raise ValueError(f"{key} must be a list of GitHub logins")
        elif key == "team":
            if not isinstance(value, list) or any(not isinstance(x, dict) or not all(isinstance(x.get(k), str) and x[k] for k in ("github", "chat", "name")) for x in value):
                raise ValueError("team must contain github, chat and name")
        elif isinstance(original, int):
            if isinstance(value, bool) or not isinstance(value, (int, float)) or not 0 <= value <= 10000:
                raise ValueError(f"{key} must be a number from 0 to 10000")
            if key.startswith("limits.") and (not isinstance(value, int) or value < 1):
                raise ValueError(f"{key} must be an integer from 1 to 10000")
            if key == "early_warning.workload_open_prs" and (not isinstance(value, int) or value < 0):
                raise ValueError(f"{key} must be an integer from 0 to 10000")
    return rules


def load(state: Path) -> dict:
    return validate(read_json(state / "rules.json", copy.deepcopy(DEFAULTS)))


def authorize(rules: dict, user: str) -> None:
    if not user or (rules["approvers"] and user not in rules["approvers"]):
        raise Blocked("Approver not allowed")


def set_rule(rules: dict, key: str, value, user: str) -> tuple[dict, object]:
    authorize(rules, user)
    if key == "team" or key not in leaves(DEFAULTS):
        raise ValueError("Invalid or non-settable rule key")
    updated = copy.deepcopy(rules)
    target = updated
    parts = key.split(".")
    for part in parts[:-1]:
        target = target[part]
    old = target[parts[-1]]
    target[parts[-1]] = value
    return validate(updated), old
