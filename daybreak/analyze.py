"""Analyze a snapshot and persist the current day's proposal batch."""
from pathlib import Path
from . import stuck, proposals, timeutil as t
from .models import read_json, write_json


def build(snapshot: dict, rules: dict, previous=None, ledger=None, history=None) -> dict:
    candidates = stuck.detect(snapshot, rules)
    result = proposals.select(candidates, rules, t.now(snapshot["meta"]["now"]), previous, ledger, history)
    return {**result, "watching": [], "meta": snapshot["meta"]}


def render(result: dict) -> str:
    lines = []
    for severity, title in (("stuck", "Stuck items"), ("warning", "Early warning")):
        group = [x for x in result["proposals"] if x["severity"] == severity]
        lines.append(f"{title} ({len(group)})")
        for p in group:
            lines.append(f"{p['index']}. {p['summary']} {p['target']['url']}")
            for reason in p["reasons"]:
                lines.append(f"   - {reason['text']} {reason['url']}")
            for action in p["actions"]:
                if action["kind"] == "request_review":
                    text = f"request review from @{action['person']}"
                else:
                    text = f"comment on #{action['number']}: {action['body']}"
                lines.append(f"   Action: {text} {action.get('url', p['target']['url'])}")
        lines.append("")
    if not result["proposals"]:
        lines.append("No actionable proposals.")
    for p in result.get("watching", []):
        lines.append(f"Watching: {p['summary']} {p['target']['url']}")
    if result["proposals"]:
        indexes = [x["index"] for x in result["proposals"]]
        lines.append(f"Reply: approve {indexes[0]} | skip {indexes[0]} | snooze {indexes[0]} 2d")
    return "\n".join(lines)


def run(snapshot: dict, rules: dict, state: Path, dry_run: bool = False) -> dict:
    date = t.local_date(t.now(snapshot["meta"]["now"]), rules)
    path = state / "proposals" / f"{date}.json"
    previous = read_json(path, [])
    history = [x for file in sorted((state / "proposals").glob("*.json"))
               for x in read_json(file, [])]
    ledger = read_json(state / "ledger.json", {})
    result = build(snapshot, rules, previous, ledger, history)
    if not dry_run:
        # Preserve removed records as tombstones for stable numbering and snoozes.
        active = {x["id"]: x for x in result["proposals"]}
        archived = [dict(x, active=False) for x in previous if x["id"] not in active]
        write_json(path, [*result["proposals"], *archived])
        write_json(state / "analysis.json", result)
    return result
