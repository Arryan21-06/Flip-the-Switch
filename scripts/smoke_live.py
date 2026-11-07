"""Smoke test for live GitHub collection against a specified or configured DAYBREAK_REPO."""
import argparse
import json
import os
import sys
from pathlib import Path

# Ensure daybreak package is in path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from daybreak import brief, collect, config
from daybreak.models import read_json


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=os.environ.get("DAYBREAK_REPO"), help="Target OWNER/REPO")
    parser.add_argument("--state-dir", type=Path, default=ROOT / "state")
    args = parser.parse_args()

    repo = args.repo
    if not repo or "/" not in repo:
        print("Set DAYBREAK_REPO=OWNER/REPO or pass --repo OWNER/REPO", file=sys.stderr)
        return 2

    rules = config.load(args.state_dir)
    print(f"Connecting to live GitHub repo: {repo}...")
    try:
        data = collect.collect("github", None, repo, None, rules)
        collect.save(args.state_dir, data)
        brief_data = brief.build(data, rules)
    except Exception as exc:
        print(f"Collection failed: {exc}", file=sys.stderr)
        return 4

    prs = data.get("prs", [])
    issues = data.get("issues", [])
    commits = data.get("commits", [])
    review_requests_count = sum(len(pr.get("review_requests") or []) for pr in prs)
    checks_count = sum(len(pr.get("checks") or []) for pr in prs)

    print("\n--- Live GitHub Smoke Test Summary ---")
    print(f"Repository:       {repo}")
    print(f"PRs collected:    {len(prs)}")
    print(f"Issues collected: {len(issues)}")
    print(f"Commits (window): {len(commits)}")
    print(f"Review requests:  {review_requests_count}")
    print(f"Checks (rollup):  {checks_count}")
    print("--------------------------------------\n")
    print("Daybreak Brief Output:\n")
    print(brief.render(brief_data, rules))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
