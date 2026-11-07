"""Build factual per-person briefs with source evidence."""
from . import timeutil as t
from .models import evidence


def build(snapshot: dict, rules: dict, since: str = "auto") -> dict:
    at = t.now(snapshot["meta"]["now"])
    start = t.since(at, since, rules["timezone"])
    people = {x["github"]: {"login": x["github"], "chat": x["chat"], "name": x["name"]}
              for x in rules["team"]}

    def person(who):
        if not who:
            return None
        if who not in people:
            people[who] = {"login": who, "chat": who, "name": who}
        for key in ("merged", "opened", "reviewed", "commits", "open_prs", "assigned_issues"):
            people[who].setdefault(key, [])
        return people[who]

    def within(value):
        date = t.parse(value)
        return date is not None and start <= date <= at

    for who in list(people):
        person(who)
    for pr in sorted(snapshot["prs"], key=lambda x: x.get("number") or 0):
        if pr.get("is_draft") or not evidence(pr.get("url")):
            continue
        entry = {"number": pr.get("number"), "title": pr.get("title") or "", "url": pr["url"]}
        owner = person(pr.get("author"))
        if owner is not None:
            if within(pr.get("merged_at")):
                owner["merged"].append(entry)
            if within(pr.get("created_at")):
                owner["opened"].append(entry)
            if pr.get("state") == "open":
                owner["open_prs"].append(entry)
        for review in pr.get("reviews") or []:
            reviewer = person(review.get("author"))
            if reviewer is not None and within(review.get("submitted_at")) and entry not in reviewer["reviewed"]:
                reviewer["reviewed"].append(entry)
    for commit in snapshot["commits"]:
        owner = person(commit.get("author"))
        if owner is not None and within(commit.get("date")) and evidence(commit.get("url")):
            owner["commits"].append({k: commit.get(k) for k in ("sha", "message", "url")})
    for issue in snapshot["issues"]:
        if issue.get("state") != "open" or not evidence(issue.get("url")):
            continue
        for who in issue.get("assignees") or []:
            owner = person(who)
            if owner is not None:
                owner["assigned_issues"].append({k: issue.get(k) for k in ("number", "title", "url")})
    return {"meta": {**snapshot["meta"], "since": t.iso(start),
                     "window_hours": (at - start).total_seconds() / 3600},
            "people": [people[x] for x in sorted(people)]}


def render(brief: dict, rules: dict) -> str:
    at = t.now(brief["meta"]["now"]).astimezone(t.zone(rules["timezone"]))
    window = f"{brief['meta']['window_hours']:g}h"
    lines = [f"Daybreak brief · {at:%a %d %b} · last {window}"]
    for person in brief["people"]:
        lines.extend(["", f"@{person['chat']}"])
        completed = []
        for kind in ("merged", "reviewed", "commits"):
            for item in person[kind]:
                label = f"commit {item['sha']}" if kind == "commits" else f"{kind} #{item['number']} {item['title']}"
                completed.append(f"{label} {item['url']}")
        lines.append("Yesterday: " + "; ".join(completed) if completed else f"No activity found in the last {window}.")
        if person["opened"]:
            lines.append("Opened: " + "; ".join(f"#{x['number']} {x['url']}" for x in person["opened"]))
        current = [f"PR #{x['number']} {x['url']}" for x in person["open_prs"]]
        current += [f"Issue #{x['number']} {x['url']}" for x in person["assigned_issues"]]
        if current:
            lines.append("Today (open work): " + "; ".join(current))
    lines.extend(["", "Heads-up: proposals are in the thread below.",
                  "Reply in this thread to edit your own section."])
    return "\n".join(lines)
