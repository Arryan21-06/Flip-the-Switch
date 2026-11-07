"""Deterministic ranking, target suppression and stable daily identities."""
import copy
from . import timeutil as t


def target_key(proposal: dict) -> tuple:
    return proposal["target"]["kind"], proposal["target"]["number"]


def rank(proposal: dict) -> tuple:
    if proposal["severity"] == "stuck":
        return (0, -proposal["over_hours"], proposal["target"]["number"], proposal["type"])
    return (1, -{"Watch": 1, "At risk": 2, "High": 3}[proposal["tier"]],
            -proposal["points"], proposal["target"]["number"])


def recipients(proposal: dict) -> list[str]:
    return sorted({x.get("person") for x in proposal["actions"] if x.get("person")} or
                  ({proposal["person"]} if proposal.get("person") else set()))


def select(candidates: list[dict], rules: dict, at, previous: list[dict] | None = None,
           ledger: dict | None = None, history: list[dict] | None = None) -> dict:
    previous, ledger, history = previous or [], ledger or {}, history or []
    previous_by_id = {x["id"]: x for x in previous}
    snoozed = {target_key(x) for x in [*history, *previous]
               if x.get("snooze_until") and t.parse(x["snooze_until"]) and t.parse(x["snooze_until"]) > at}
    day = t.local_date(at, rules)
    counts = ledger.get("nudges", {}).get(day, {})
    selected, suppressed, seen_targets = [], [], set()
    groups = {"stuck": 0, "warning": 0}
    caps = {"stuck": rules["limits"]["max_stuck_proposals"], "warning": rules["limits"]["max_warning_proposals"]}
    for candidate in sorted(candidates, key=rank):
        p = copy.deepcopy(candidate)
        old = previous_by_id.get(p["id"])
        reason = None
        if target_key(p) in snoozed:
            reason = "snoozed"
        elif p["id"] in ledger.get("executed", {}):
            reason = "executed_today"
        elif old and old["status"] == "skipped":
            reason = "skipped_today"
        elif any(counts.get(who, 0) >= rules["limits"]["max_nudges_per_person_per_day"] for who in recipients(p)):
            reason = "nudge_budget"
        elif target_key(p) in seen_targets:
            reason = "duplicate_target"
        elif groups[p["severity"]] >= caps[p["severity"]]:
            reason = "suppressed_by_cap"
        if reason:
            suppressed.append({"id": p["id"], "reason": reason, "target": p["target"]})
            continue
        seen_targets.add(target_key(p))
        groups[p["severity"]] += 1
        if old and old["status"] in ("approved", "failed"):
            # Approval binds the exact action contents, never regenerated text.
            p = copy.deepcopy(old)
        elif old:
            p["index"] = old["index"]
        selected.append(p)
    # Existing indices never get rebound to another target on re-analysis.
    next_index = max([x.get("index") or 0 for x in previous] or [0]) + 1
    for p in selected:
        if p["index"] is None:
            p["index"] = next_index
            next_index += 1
    return {"proposals": selected, "suppressed": suppressed}
