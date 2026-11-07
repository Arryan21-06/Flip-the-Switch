"""Transparent early-warning signals; tiers are counts, never probabilities."""
import re
from collections import Counter
from . import timeutil as t
from .models import evidence

DEPENDENCY = re.compile(r"\b(?:depends\s+on|blocked\s+by)\s+(#\d+(?:(?:\s*,\s*|\s+and\s+)#\d+)*)", re.I)


def detect(snapshot: dict, rules: dict) -> tuple[list[dict], list[dict]]:
    at = t.now(snapshot["meta"]["now"])
    settings = rules["early_warning"]
    open_prs = [p for p in snapshot["prs"] if p.get("state") == "open"]
    targets = {x["number"]: (kind, x) for kind, items in (("pr", open_prs), ("issue", snapshot["issues"]))
               for x in items if x.get("state") == "open" and x.get("number") and evidence(x.get("url"))}
    pending = Counter(r.get("login") for p in open_prs for r in p.get("review_requests") or [])
    candidates, watching = [], []
    for pr in open_prs:
        if pr.get("is_draft") or not pr.get("number") or not evidence(pr.get("url")):
            continue
        signals, reasons, actions = [], [], []
        age = t.hours(at, pr.get("created_at"))
        if age is not None and age >= settings["grace_hours"] and not pr.get("review_requests") and not any(t.parse(r.get("submitted_at")) for r in pr.get("reviews") or []):
            signals.append("no_reviewer")
            reasons.append({"text": f"No reviewer requested, open {age:g}h", "url": pr["url"]})
            eligible = sorted((x for x in rules["reviewers"] if x != pr.get("author")), key=lambda x: (pending[x], x))
            if eligible:
                actions.append({"kind": "request_review", "target": "pr", "number": pr["number"],
                                "person": eligible[0], "url": pr["url"]})
        others = [x for x in open_prs if pr.get("author") and x.get("author") == pr["author"] and x["number"] != pr["number"]]
        if len(others) >= settings["workload_open_prs"] and all(evidence(x.get("url")) for x in others):
            signals.append("workload")
            for item in sorted(others, key=lambda x: x["number"]):
                reasons.append({"text": f"Author has {len(others)} other open PRs; includes #{item['number']}", "url": item["url"]})
        refs = {int(n) for match in DEPENDENCY.finditer(pr.get("body") or "") for n in re.findall(r"#(\d+)", match.group(1))}
        dependencies = sorted(n for n in refs if n in targets and n != pr["number"])
        if dependencies:
            signals.append("dependency")
            for number in dependencies:
                kind, target = targets[number]
                reasons.append({"text": f"Depends on #{number}, still open", "url": target["url"]})
                who = target.get("author") if kind == "pr" else next(iter(target.get("assignees") or []), None)
                greeting = f"Hi @{who}" if who else "Hi maintainers"
                actions.append({"kind": "comment", "target": kind, "number": number, "person": who,
                                "url": target["url"],
                                "body": f"{greeting}, PR #{pr['number']} depends on this item. Could you share an ETA? {pr['url']} {target['url']}"})
        if not signals:
            continue
        tier = {1: "Watch", 2: "At risk", 3: "High"}[len(signals)]
        points = sum(settings["points"][s] for s in signals)
        proposal = {
            "id": f"warn-pr{pr['number']}-{t.local_date(at, rules)}", "index": None,
            "type": "early_warning", "severity": "warning", "tier": tier, "points": points,
            "signals": signals, "target": {"kind": "pr", "number": pr["number"], "url": pr["url"]},
            "person": pr.get("author"), "over_hours": None,
            "summary": f"PR #{pr['number']} {tier.upper()} flag ({len(signals)} signals, {points:g} points)",
            "reasons": reasons, "actions": actions if tier != "Watch" else [],
            "status": "proposed", "decided_by": None, "decided_at": None,
            "snooze_until": None, "executed_at": None, "result_urls": [],
        }
        (watching if tier == "Watch" else candidates).append(proposal)
    return candidates, sorted(watching, key=lambda p: p["target"]["number"])
