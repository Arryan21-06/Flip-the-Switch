"""Human decisions bind an immutable action digest to an approver."""
import copy
import hashlib
import json
from datetime import timedelta
from . import timeutil as t
from .config import authorize
from .models import Blocked


def digest(proposal: dict) -> str:
    value = {k: proposal.get(k) for k in ("id", "target", "actions", "repo", "source")}
    return hashlib.sha256(json.dumps(value, sort_keys=True).encode()).hexdigest()


def decide(proposals: list[dict], ledger: dict, rules: dict, action: str,
           indices: list[int], user: str, at, duration: str | None = None) -> tuple[list, dict]:
    authorize(rules, user)
    if action not in ("approve", "skip", "snooze"):
        raise ValueError("Decision must be approve, skip or snooze")
    if action == "snooze" and (duration not in ("1d", "2d", "1w") or len(indices) != 1):
        raise ValueError("Snooze requires one index and --for 1d, 2d or 1w")
    active = {p["index"]: p for p in proposals if p.get("active", True)}
    if not indices or any(i not in active for i in indices):
        raise ValueError(f"Unknown proposal index; valid indices: {sorted(active)}")
    if any(active[i]["status"] == "executed" for i in indices):
        raise Blocked("Executed proposals cannot be changed")
    updated, book = copy.deepcopy(proposals), copy.deepcopy(ledger)
    for p in updated:
        if p["index"] not in indices:
            continue
        p.update(status={"approve": "approved", "skip": "skipped", "snooze": "snoozed"}[action],
                 decided_by=user, decided_at=t.iso(at), snooze_until=None)
        if action == "snooze":
            p["snooze_until"] = t.iso(at + timedelta(days={"1d": 1, "2d": 2, "1w": 7}[duration]))
        record = {"id": p["id"], "action": action, "approver": user, "time": t.iso(at),
                  "type": p["type"], "target": p["target"], "digest": digest(p)}
        if record not in book["decisions"]:
            book["decisions"].append(record)
    return updated, book
