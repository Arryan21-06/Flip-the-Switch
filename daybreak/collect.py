"""Collect bounded snapshots from fixtures or gh JSON."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from . import timeutil as t
from .ghclient import GitHub
from .models import read_json, snapshot, write_json

PR_FIELDS = "number,title,url,author,state,isDraft,createdAt,updatedAt,mergedAt,body,labels,reviewRequests,reviews,reviewDecision,statusCheckRollup"


def login(value) -> str | None:
    if not isinstance(value, dict):
        return value if isinstance(value, str) else None
    return value.get("login") or ("team:" + value["slug"] if value.get("slug") else None)


def normalize_pr(raw: dict, events: list) -> dict:
    requests = []
    for request in raw.get("reviewRequests") or []:
        who = login(request)
        matches = [x.get("created_at") for x in events
                   if x.get("event") == "review_requested" and
                   login(x.get("requested_reviewer") or x.get("requested_team")) == who
                   and t.parse(x.get("created_at"))]
        requests.append({"login": who, "requested_at": max(matches, key=t.parse) if matches else None})
    checks = []
    for check in raw.get("statusCheckRollup") or []:
        checks.append({"name": check.get("name") or check.get("context"),
                       "conclusion": check.get("conclusion") or check.get("state"),
                       "completed_at": check.get("completedAt")})
    return {
        "number": raw.get("number"), "title": raw.get("title"), "url": raw.get("url"),
        "author": login(raw.get("author")), "state": (raw.get("state") or "").lower() or None,
        "is_draft": raw.get("isDraft"), "labels": [x.get("name") for x in raw.get("labels") or []],
        "created_at": raw.get("createdAt"), "updated_at": raw.get("updatedAt"),
        "merged_at": raw.get("mergedAt"), "body": raw.get("body"),
        "review_requests": requests,
        "reviews": [{"author": login(x.get("author")), "state": x.get("state"),
                     "submitted_at": x.get("submittedAt")} for x in raw.get("reviews") or []],
        "review_decision": raw.get("reviewDecision"), "checks": checks,
    }


def collect(source: str, fixture: Path, repo: str | None, at: str | None,
            rules: dict, since: str = "auto", client=None) -> dict:
    if source == "fixture":
        data = snapshot(read_json(fixture))
        if at:
            data["meta"]["now"] = t.iso(t.now(at))
        return data
    gh = client or GitHub(repo)
    current = t.now(at)
    start = t.since(current, since, rules["timezone"])
    args = ["--repo", repo, "--limit", "100", "--json", PR_FIELDS]
    opened = gh.json(["pr", "list", "--state", "open", *args])
    merged = gh.json(["pr", "list", "--state", "merged", "--search", f"merged:>={t.iso(start)}", *args])
    # Keep all open PRs first, with an overall 100 PR bound.
    raws = list({x["number"]: x for x in [*opened, *merged] if x.get("number")}.values())[:100]

    def convert(raw):
        events = gh.pages(f"repos/{repo}/issues/{raw['number']}/timeline?per_page=100") if raw.get("reviewRequests") else []
        return normalize_pr(raw, events)

    with ThreadPoolExecutor(max_workers=8) as pool:
        prs = list(pool.map(convert, raws))
    issues = gh.json(["issue", "list", "--repo", repo, "--state", "open", "--limit", "100",
                      "--json", "number,title,url,state,assignees,labels,createdAt,updatedAt"])
    commits = gh.pages(f"repos/{repo}/commits?since={t.iso(start)}&per_page=100")
    return snapshot({
        "meta": {"repo": repo, "source": "github", "now": t.iso(current)},
        "prs": prs,
        "issues": [{"number": x.get("number"), "title": x.get("title"), "url": x.get("url"),
                    "state": (x.get("state") or "").lower() or None,
                    "assignees": [login(a) for a in x.get("assignees") or [] if login(a)],
                    "labels": [a.get("name") for a in x.get("labels") or []],
                    "created_at": x.get("createdAt"), "updated_at": x.get("updatedAt")} for x in issues[:100]],
        "commits": [{"sha": x.get("sha"), "author": login(x.get("author")),
                     "message": ((x.get("commit") or {}).get("message") or "").split("\n")[0],
                     "url": x.get("html_url"), "date": ((x.get("commit") or {}).get("author") or {}).get("date")} for x in commits],
    })


def save(state: Path, data: dict) -> None:
    write_json(state / "snapshot.json", data)
    stamp = data["meta"]["now"].replace(":", "-")
    write_json(state / "snapshots" / f"{stamp}.json", data)
