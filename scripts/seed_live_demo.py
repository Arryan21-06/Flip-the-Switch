"""Create one dependency issue and PR in an explicitly selected throwaway repo."""
import argparse
import base64
import json
import os
import subprocess
import sys


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", required=True, help="Existing throwaway OWNER/REPO")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from daybreak.ghclient import GitHub
    from daybreak.models import GitHubError
    gh = GitHub(args.repo)
    if args.dry_run:
        print(f"Would create branch daybreak-live-demo, a dependency issue and a PR in {args.repo}")
        return 0
    if os.environ.get("DAYBREAK_ALLOW_WRITE") != "1":
        print("Set DAYBREAK_ALLOW_WRITE=1 for this explicit seeding operation", file=sys.stderr)
        return 3
    try:
        existing = gh.json(["pr", "list", "--repo", args.repo, "--state", "all",
                            "--head", "daybreak-live-demo", "--json", "url"])
        if existing:
            print("Existing seeded PR: " + existing[0]["url"])
            return 0
        repository = gh.json(["repo", "view", args.repo, "--json", "defaultBranchRef"])
        branch = (repository.get("defaultBranchRef") or {}).get("name")
        if not branch:
            raise ValueError("Initialize the throwaway repo with a README first")
        ref = gh.json(["api", f"repos/{args.repo}/git/ref/heads/{branch}"])
        gh.run(["api", "--method", "POST", f"repos/{args.repo}/git/refs",
                "-f", "ref=refs/heads/daybreak-live-demo", "-f", "sha=" + ref["object"]["sha"]])
        issue_url = gh.run(["issue", "create", "--repo", args.repo, "--title", "Daybreak demo dependency",
                            "--body-file", "-"], body="Seeded demonstration item. No production work is blocked.")
        number = int(issue_url.rstrip("/").split("/")[-1])
        content = base64.b64encode(b"Daybreak live write-path demo. Safe to close after the recording.\n").decode()
        gh.run(["api", "--method", "PUT", f"repos/{args.repo}/contents/daybreak-demo.txt",
                "-f", "branch=daybreak-live-demo", "-f", "message=Add Daybreak demo artifact",
                "-f", "content=" + content])
        pr_url = gh.run(["pr", "create", "--repo", args.repo, "--base", branch,
                        "--head", "daybreak-live-demo", "--title", "Daybreak live demo",
                        "--body-file", "-"], body=f"Seeded live write-path demo. Depends on #{number}.")
        print(json.dumps({"repo": args.repo, "pr": pr_url, "dependency": issue_url}, indent=2))
        return 0
    except (GitHubError, ValueError) as exc:
        print(str(exc), file=sys.stderr)
        print("Seeding may be partial; inspect the throwaway repo before retrying.", file=sys.stderr)
        return 4


if __name__ == "__main__":
    raise SystemExit(main())
