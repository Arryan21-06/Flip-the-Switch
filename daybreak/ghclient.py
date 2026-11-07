"""The only subprocess boundary to GitHub; errors never echo secrets."""
import json
import re
import subprocess
from .models import GitHubError


class GitHub:
    def __init__(self, repo: str):
        if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repo or ""):
            raise ValueError("Repository must be OWNER/REPO")
        self.repo = repo

    def run(self, args: list[str], body: str | None = None) -> str:
        try:
            result = subprocess.run(["gh", *args], input=body, capture_output=True,
                                    text=True, timeout=30, check=False)
        except (OSError, subprocess.TimeoutExpired):
            raise GitHubError("GitHub CLI unavailable or timed out") from None
        if result.returncode:
            raise GitHubError("GitHub request failed; check authentication, permissions and rate limits")
        return result.stdout.strip()

    def json(self, args: list[str]):
        try:
            return json.loads(self.run(args))
        except (ValueError, TypeError):
            raise GitHubError("GitHub returned invalid JSON") from None

    def pages(self, endpoint: str) -> list:
        result = self.json(["api", "--paginate", "--slurp", endpoint])
        if not isinstance(result, list):
            raise GitHubError("GitHub returned an unexpected list")
        return [item for page in result for item in (page if isinstance(page, list) else [page])]
