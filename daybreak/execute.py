"""Execute approved actions with ledger, remote recovery and budget gates."""
import os
from pathlib import Path
from . import ledger as storage, timeutil as t
from .config import authorize
from .decide import digest
from .ghclient import GitHub
from .models import Blocked, GitHubError, write_json


def recovery(gh, proposal: dict, action: dict) -> str | None:
    number = action["number"]
    if action["kind"] == "comment":
        comments = gh.pages(f"repos/{gh.repo}/issues/{number}/comments?per_page=100")
        marker = f"<!-- daybreak:{proposal['id']} -->"
        return next((x.get("html_url") or action["url"] for x in comments
                     if marker in (x.get("body") or "")), None)
    current = gh.json(["pr", "view", str(number), "--repo", gh.repo, "--json", "reviewRequests"])
    if any(x.get("login") == action["person"] for x in current.get("reviewRequests") or []):
        return action["url"]
    events = gh.pages(f"repos/{gh.repo}/issues/{number}/timeline?per_page=100")
    approved = t.parse(proposal["decided_at"])
    if any(x.get("event") == "review_requested"
           and (x.get("requested_reviewer") or {}).get("login") == action["person"]
           and t.parse(x.get("created_at")) and t.parse(x["created_at"]) >= approved for x in events):
        return action["url"]
    return None


def perform(gh, proposal: dict, action: dict) -> str:
    if action["kind"] == "comment":
        body = f"[Daybreak, approved by @{proposal['decided_by']}]\n\n{action['body']}\n\n<!-- daybreak:{proposal['id']} -->"
        return gh.run([action["target"], "comment", str(action["number"]), "--repo", gh.repo,
                       "--body-file", "-"], body=body) or action["url"]
    if action["kind"] == "request_review":
        gh.run(["pr", "edit", str(action["number"]), "--repo", gh.repo,
                "--add-reviewer", action["person"]])
        return action["url"]
    raise ValueError("Unknown action kind")


def execute(proposals: list[dict], book: dict, rules: dict, at, state: Path,
            path: Path, repo: str, dry_run: bool = False,
            ignore_quiet: bool = False, client=None) -> dict:
    active = [p for p in proposals if p.get("active", True)]
    pending = [p for p in active if p["status"] == "approved" and p["id"] not in book["executed"]]
    if not pending:
        if any(p["status"] in ("proposed", "failed") for p in active):
            raise Blocked("No approved proposals to execute")
        return {"results": [], "message": "No approved actions remain"}
    if not ignore_quiet and t.quiet(at, rules):
        raise Blocked("Quiet hours: proposals remain approved")
    if not dry_run and os.environ.get("DAYBREAK_ALLOW_WRITE") != "1":
        raise Blocked("Set DAYBREAK_ALLOW_WRITE=1 to enable approved writes")
    for p in pending:
        authorize(rules, p.get("decided_by"))
        decisions = [x for x in book["decisions"] if x.get("id") == p["id"]]
        if not decisions or decisions[-1].get("action") != "approve" or decisions[-1].get("digest") != digest(p):
            raise Blocked("Approval does not match the action contents")
        if not dry_run and (p.get("source") != "github" or p.get("repo") != repo):
            raise Blocked("Live writes require proposals collected from the same live repository")
        for action in p["actions"]:
            if action.get("kind") not in ("comment", "request_review") or action.get("target") not in ("pr", "issue"):
                raise ValueError("Invalid action")
    if dry_run:
        return {"dry_run": True, "results": [{"id": p["id"], "actions": p["actions"],
                                             "status": "dry_run"} for p in pending]}
    gh = client or GitHub(repo)
    day = t.local_date(at, rules)
    counts = book["nudges"].setdefault(day, {})
    results = []
    failed = False
    for p in pending:
        outcomes = []
        actions = book["actions"].setdefault(p["id"], {})
        # One budget unit per recipient per proposal, including multi-action proposals.
        charged = {x.get("person") for x in actions.values() if x.get("budget_day") == day}
        for index, action in enumerate(p["actions"]):
            key, who = str(index), action.get("person") or p.get("person")
            if key in actions and actions[key].get("status") == "executed":
                outcomes.append(actions[key])
                continue
            if who and who not in charged and counts.get(who, 0) >= rules["limits"]["max_nudges_per_person_per_day"]:
                outcome = {"status": "budget_skipped", "person": who, "url": action["url"]}
                outcomes.append(outcome)
                record = {"id": p["id"], "action": index, "person": who, "time": t.iso(at)}
                if record not in book["budget_skips"]:
                    book["budget_skips"].append(record)
                storage.save(state, book)
                continue
            try:
                url = recovery(gh, p, action)
                if not url:
                    if actions.get(key, {}).get("status") == "pending":
                        raise GitHubError("Previous write has an uncertain outcome; inspect GitHub before retrying")
                    # Persist intent before write: ambiguous failures cannot cause automatic retries.
                    actions[key] = {"status": "pending", "person": who, "time": t.iso(at)}
                    storage.save(state, book)
                    url = perform(gh, p, action)
                outcome = {"status": "executed", "url": url, "person": who,
                           "time": t.iso(at), "budget_day": day}
                actions[key] = outcome
                if who and who not in charged:
                    counts[who] = counts.get(who, 0) + 1
                    charged.add(who)
                storage.save(state, book)
                outcomes.append(outcome)
            except GitHubError as exc:
                failed = True
                outcomes.append({"status": "failed", "error": str(exc), "url": action["url"]})
        p["action_results"] = outcomes
        p["result_urls"] = [x["url"] for x in outcomes if x["status"] == "executed"]
        if all(x["status"] == "executed" for x in outcomes):
            p.update(status="executed", executed_at=t.iso(at))
            book["executed"][p["id"]] = {"time": t.iso(at), "approver": p["decided_by"],
                                        "result_urls": p["result_urls"], "type": p["type"],
                                        "target": p["target"], "rules": rules}
        elif any(x["status"] == "failed" for x in outcomes):
            p["status"] = "failed"
        storage.save(state, book)
        write_json(path, proposals)
        results.append({"id": p["id"], "status": p["status"], "actions": outcomes})
    return {"results": results, "failed": failed}
