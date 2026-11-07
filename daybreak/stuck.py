"""Four evidence-backed stuck-work rules."""
from . import timeutil as t
from .models import evidence

PREFIX = {"review_stuck": "nudge-review-pr", "ci_red": "nudge-ci-pr",
          "approved_unmerged": "nudge-merge-pr", "stale_issue": "nudge-stale-issue"}


def proposal(kind: str, item: dict, person: str, over: float, summary: str,
             rules: dict, at) -> dict:
    target = "issue" if kind == "stale_issue" else "pr"
    return {"id": f"{PREFIX[kind]}{item['number']}-{t.local_date(at, rules)}",
            "index": None, "type": kind, "severity": "stuck", "tier": None, "points": None,
            "target": {"kind": target, "number": item["number"], "url": item["url"]},
            "person": person, "over_hours": over, "summary": summary,
            "reasons": [{"text": summary, "url": item["url"]}],
            "actions": [{"kind": "comment", "target": target, "number": item["number"],
                         "person": person, "url": item["url"],
                         "body": f"Hi @{person}, {summary}. Could you share an update when convenient? {item['url']}"}],
            "status": "proposed", "decided_by": None, "decided_at": None,
            "snooze_until": None, "executed_at": None, "result_urls": []}


def detect(snapshot: dict, rules: dict) -> list[dict]:
    at = t.now(snapshot["meta"]["now"])
    limits = rules["stuck"]
    results = []
    for pr in snapshot["prs"]:
        if pr.get("state") != "open" or pr.get("is_draft") or not pr.get("number") or not evidence(pr.get("url")):
            continue
        number = pr["number"]
        requests = [(t.hours(at, x.get("requested_at")), x.get("login")) for x in pr.get("review_requests") or []
                    if x.get("login") and not x["login"].startswith("team:")]
        requests = [(age, login) for age, login in requests if age is not None and age >= limits["review_sla_hours"]]
        if requests:
            age, who = sorted(requests, key=lambda x: (-x[0], x[1]))[0]
            results.append(proposal("review_stuck", pr, who, age - limits["review_sla_hours"],
                                    f"PR #{number} waiting {age:g}h for @{who} (SLA {limits['review_sla_hours']:g}h)", rules, at))
        failures = [t.hours(at, x.get("completed_at")) for x in pr.get("checks") or []
                    if x.get("conclusion") in ("FAILURE", "ERROR", "TIMED_OUT")]
        ages = [x for x in failures if x is not None]
        if pr.get("author") and ages and max(ages) >= limits["red_ci_hours"]:
            age = max(ages)
            results.append(proposal("ci_red", pr, pr["author"], age - limits["red_ci_hours"],
                                    f"PR #{number} CI red for {age:g}h (limit {limits['red_ci_hours']:g}h)", rules, at))
        approvals = [t.hours(at, x.get("submitted_at")) for x in pr.get("reviews") or [] if x.get("state") == "APPROVED"]
        ages = [x for x in approvals if x is not None]
        if pr.get("author") and pr.get("review_decision") == "APPROVED" and ages and min(ages) >= limits["approved_unmerged_hours"]:
            age = min(ages)
            results.append(proposal("approved_unmerged", pr, pr["author"], age - limits["approved_unmerged_hours"],
                                    f"PR #{number} approved {age:g}h ago, not merged (limit {limits['approved_unmerged_hours']:g}h)", rules, at))
    for issue in snapshot["issues"]:
        age = t.hours(at, issue.get("updated_at"))
        if (issue.get("state") == "open" and issue.get("assignees") and issue.get("number")
                and evidence(issue.get("url")) and age is not None and age >= limits["stale_issue_days"] * 24):
            who = issue["assignees"][0]
            results.append(proposal("stale_issue", issue, who, age - limits["stale_issue_days"] * 24,
                                    f"Issue #{issue['number']} stale, {age:g}h since update (limit {limits['stale_issue_days'] * 24:g}h), assigned @{who}", rules, at))
    return results
