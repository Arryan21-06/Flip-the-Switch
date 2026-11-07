"""Post the configured trigger without exposing the webhook URL."""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    # Plain brief is the PRD default; use an explicit mention if bridge routing needs it.
    payload = {"text": os.environ.get("DAYBREAK_TRIGGER_TEXT", "brief")}
    if args.dry_run:
        print(json.dumps(payload))
        return 0
    url = os.environ.get("MATTERMOST_WEBHOOK_URL", "")
    if not url.startswith(("http://", "https://")):
        print("Set MATTERMOST_WEBHOOK_URL", file=sys.stderr)
        return 2
    request = urllib.request.Request(url, data=json.dumps(payload).encode(),
                                     headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            if response.status != 200:
                raise ValueError("Unexpected status")
    except (urllib.error.URLError, ValueError):
        print("Mattermost trigger failed; inspect the connection privately", file=sys.stderr)
        return 4
    print("Daybreak trigger posted")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
