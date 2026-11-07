"""Reproducible weekly metrics from retained snapshots and the execution ledger."""
from datetime import timedelta
from statistics import median
from . import stuck, timeutil as t


def week_start(at, rules: dict):
    day = at.astimezone(t.zone(rules["timezone"])).date()
    return day - timedelta(days=day.weekday())


def first_review_wait(pr: dict) -> tuple[object, float] | None:
    reviews = [t.parse(x.get("submitted_at")) for x in pr.get("reviews") or []]
    reviews = [x for x in reviews if x]
    starts = [t.parse(pr.get("created_at"))] + [t.parse(x.get("requested_at")) for x in pr.get("review_requests") or []]
    starts = [x for x in starts if x]
    if not reviews or not starts:
        return None
    return min(reviews), max(0, (min(reviews) - min(starts)).total_seconds() / 3600)


def build(snapshot: dict, rules: dict, book: dict, history: list[dict]) -> dict:
    at = t.now(snapshot["meta"]["now"])
    snapshots = sorted({x["meta"]["now"]: x for x in [*history, snapshot]
                        if t.now(x["meta"]["now"]) <= at and x["meta"].get("repo") == snapshot["meta"].get("repo")
                        and x["meta"].get("source") == snapshot["meta"].get("source")}.values(),
                       key=lambda x: t.now(x["meta"]["now"]))
    baseline = week_start(t.now(snapshots[0]["meta"]["now"]), rules)
    current = week_start(at, rules)
    zone = t.zone(rules["timezone"])

    def period(start):
        end = start + timedelta(days=7)
        def within(value):
            return value and start <= value.astimezone(zone).date() < end and value <= at
        # Keep the latest observed representation of each PR up to the period end.
        prs = {}
        for snap in snapshots:
            if t.now(snap["meta"]["now"]).astimezone(zone).date() < end:
                prs.update({x["number"]: x for x in snap["prs"] if x.get("number")})
        waits = []
        for pr in prs.values():
            entry = first_review_wait(pr)
            if entry and within(entry[0]):
                waits.append(entry[1])
        flags = {"approve": 0, "skip": 0, "snooze": 0}
        seen = set()
        for decision in book.get("decisions", []):
            key = (decision.get("id"), decision.get("action"))
            if decision.get("type") == "early_warning" and within(t.parse(decision.get("time"))) and key not in seen:
                if decision["action"] in flags:
                    flags[decision["action"]] += 1
                seen.add(key)
        resolved, unknown = 0, 0
        for entry in book.get("executed", {}).values():
            executed = t.parse(entry.get("time"))
            if entry.get("type") == "early_warning" or not within(executed):
                continue
            next_snapshot = next((x for x in snapshots if t.now(x["meta"]["now"]) > executed), None)
            if next_snapshot is None:
                unknown += 1
                continue
            target = entry.get("target", {})
            collection = next_snapshot["prs" if target.get("kind") == "pr" else "issues"]
            if not any(x.get("number") == target.get("number") for x in collection):
                unknown += 1
                continue
            candidates = stuck.detect(next_snapshot, entry.get("rules", rules))
            if not any(x["type"] == entry.get("type") and x["target"] == target for x in candidates):
                resolved += 1
        observed_start = max(start, t.now(snapshots[0]["meta"]["now"]).astimezone(zone).date())
        last = min(end - timedelta(days=1), at.astimezone(zone).date())
        days = sum((observed_start + timedelta(days=i)).weekday() < 5
                   for i in range(max(0, (last - observed_start).days + 1)))
        return {"week": start.isoformat(), "median_first_review_wait_hours": median(waits) if waits else None,
                "reviewed_prs": len(waits), "stuck_items_resolved": resolved,
                "resolution_unknown": unknown, "flags_approved": flags["approve"],
                "flags_skipped_likely_false_positives": flags["skip"], "flags_snoozed": flags["snooze"],
                "standup_minutes_saved_assumption": len(rules["team"]) * rules["standup_minutes"] * days,
                "working_days_observed": days}
    return {"seeded": snapshot["meta"].get("source") == "fixture", "current": period(current),
            "baseline": period(baseline), "assumption": "Configured team size × standup_minutes × observed working days",
            "evidence": sorted({x["url"] for s in snapshots for x in [*s["prs"], *s["issues"]]
                               if x.get("url")})}


def render(result: dict) -> str:
    lines = ["Daybreak weekly scoreboard" + (" · seeded fixtures" if result["seeded"] else "")]
    for label in ("current", "baseline"):
        item = result[label]
        wait = item["median_first_review_wait_hours"]
        lines.append(f"{label.title()} week {item['week']}: median first-review wait "
                     f"{'unavailable' if wait is None else str(round(wait, 2)) + 'h'}; "
                     f"stuck resolved {item['stuck_items_resolved']} (unknown {item['resolution_unknown']}); "
                     f"flags approved {item['flags_approved']}, skipped {item['flags_skipped_likely_false_positives']} "
                     f"(likely false positives), snoozed {item['flags_snoozed']}; "
                     f"standup minutes saved {item['standup_minutes_saved_assumption']:g} (assumption).")
    lines.append(result["assumption"])
    if result["evidence"]:
        lines.append("Evidence: " + " ".join(result["evidence"]))
    return "\n".join(lines)
