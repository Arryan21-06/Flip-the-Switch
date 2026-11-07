"""Create PR A (dependency target), PR B (depends on #A, no reviewer), and PR C on a throwaway repo."""
import argparse
import base64
import json
import os
import sys
from pathlib import Path

# Add repo root to import path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from daybreak.ghclient import GitHub
from daybreak.models import GitHubError


def create_branch_and_pr(gh: GitHub, base_branch: str, base_sha: str, branch_name: str,
                         file_path: str, file_content: str, commit_msg: str,
                         pr_title: str, pr_body: str) -> dict:
    # 1. Create or verify branch
    try:
        gh.run(["api", "--method", "POST", f"repos/{gh.repo}/git/refs",
                "-f", f"ref=refs/heads/{branch_name}", "-f", f"sha={base_sha}"])
    except GitHubError:
        # Branch might already exist
        pass

    # 2. Put file content to create commit
    encoded = base64.b64encode(file_content.encode("utf-8")).decode("ascii")
    # Check if file exists to provide sha if updating
    put_args = ["api", "--method", "PUT", f"repos/{gh.repo}/contents/{file_path}",
                "-f", f"branch={branch_name}", "-f", f"message={commit_msg}",
                "-f", f"content={encoded}"]
    try:
        existing_file = gh.json(["api", f"repos/{gh.repo}/contents/{file_path}?ref={branch_name}"])
        if isinstance(existing_file, dict) and existing_file.get("sha"):
            put_args.extend(["-f", f"sha={existing_file['sha']}"])
    except GitHubError:
        pass

    gh.run(put_args)

    # 3. Create PR
    pr_out = gh.run(["pr", "create", "--repo", gh.repo, "--base", base_branch,
                     "--head", branch_name, "--title", pr_title, "--body-file", "-"],
                    body=pr_body)
    pr_url = pr_out.strip()
    number = int(pr_url.rstrip("/").split("/")[-1])
    return {"number": number, "url": pr_url, "branch": branch_name}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=os.environ.get("DAYBREAK_REPO"), help="Existing throwaway OWNER/REPO")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    repo = args.repo
    if not repo or "/" not in repo:
        print("Set DAYBREAK_REPO=OWNER/REPO or pass --repo OWNER/REPO", file=sys.stderr)
        return 2

    if args.dry_run:
        print(f"[DRY RUN] Would seed scenario on {repo}:")
        print("  1. PR A: daybreak-demo-pr-a (dependency target)")
        print("  2. PR B: daybreak-demo-pr-b (depends on PR A, no reviewer)")
        print("  3. PR C: daybreak-demo-pr-c (workload PR for same author)")
        print("No actions performed.")
        return 0

    if os.environ.get("DAYBREAK_ALLOW_WRITE") != "1":
        print("Set DAYBREAK_ALLOW_WRITE=1 for this explicit seeding operation", file=sys.stderr)
        return 3

    gh = GitHub(repo)
    try:
        repository = gh.json(["repo", "view", repo, "--json", "defaultBranchRef"])
        branch = (repository.get("defaultBranchRef") or {}).get("name")
        if not branch:
            raise ValueError("Repository default branch is not configured or repo is empty.")

        ref = gh.json(["api", f"repos/{repo}/git/ref/heads/{branch}"])
        base_sha = ref["object"]["sha"]

        # Check existing open PRs to avoid duplicate seeding
        existing_prs = gh.json(["pr", "list", "--repo", repo, "--state", "open", "--json", "number,headRefName,url"])
        existing_heads = {p.get("headRefName"): p for p in existing_prs}

        # PR A (Dependency Target)
        if "daybreak-demo-pr-a" in existing_heads:
            pr_a = {"number": existing_heads["daybreak-demo-pr-a"]["number"], "url": existing_heads["daybreak-demo-pr-a"]["url"]}
            print(f"Using existing PR A: #{pr_a['number']} ({pr_a['url']})")
        else:
            pr_a = create_branch_and_pr(
                gh, branch, base_sha, "daybreak-demo-pr-a",
                "demo-a.txt", "Daybreak demo PR A content.\n",
                "Add Demo A file", "Daybreak Demo PR A (Dependency Target)",
                "This is the dependency target PR for the Daybreak live demo."
            )
            print(f"Created PR A: #{pr_a['number']} ({pr_a['url']})")

        # PR B (Depends on PR A, no reviewer)
        if "daybreak-demo-pr-b" in existing_heads:
            pr_b = {"number": existing_heads["daybreak-demo-pr-b"]["number"], "url": existing_heads["daybreak-demo-pr-b"]["url"]}
            print(f"Using existing PR B: #{pr_b['number']} ({pr_b['url']})")
        else:
            pr_b = create_branch_and_pr(
                gh, branch, base_sha, "daybreak-demo-pr-b",
                "demo-b.txt", "Daybreak demo PR B content.\n",
                "Add Demo B file", "Daybreak Demo PR B (Early Warning Target)",
                f"Feature implementation for live demo. Depends on #{pr_a['number']}."
            )
            print(f"Created PR B: #{pr_b['number']} ({pr_b['url']})")

        # PR C (Workload filler)
        if "daybreak-demo-pr-c" in existing_heads:
            pr_c = {"number": existing_heads["daybreak-demo-pr-c"]["number"], "url": existing_heads["daybreak-demo-pr-c"]["url"]}
            print(f"Using existing PR C: #{pr_c['number']} ({pr_c['url']})")
        else:
            pr_c = create_branch_and_pr(
                gh, branch, base_sha, "daybreak-demo-pr-c",
                "demo-c.txt", "Daybreak demo PR C content.\n",
                "Add Demo C file", "Daybreak Demo PR C (Workload Filler)",
                "Additional open PR to test author workload early-warning signal."
            )
            print(f"Created PR C: #{pr_c['number']} ({pr_c['url']})")

        print("\nLive demo scenario successfully seeded!")
        print(json.dumps({"repo": repo, "pr_a": pr_a, "pr_b": pr_b, "pr_c": pr_c}, indent=2))
        return 0

    except (GitHubError, ValueError) as exc:
        print(f"Error seeding demo: {exc}", file=sys.stderr)
        return 4


if __name__ == "__main__":
    raise SystemExit(main())
