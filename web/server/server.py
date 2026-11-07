#!/usr/bin/env python3
"""Daybreak Cockpit Read-Only API Server.

Standard library HTTP server strictly binding to 127.0.0.1:8765.
ZERO write endpoints. Strictly read-only inspection of Daybreak state.
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
from pathlib import Path
import subprocess
import sys
from urllib.parse import urlparse

HOST = "127.0.0.1"
PORT = 8765

REPO_ROOT = Path(__file__).resolve().parent.parent.parent


def get_state_dir() -> Path:
    env_state = os.environ.get("DAYBREAK_STATE_DIR")
    if env_state:
        return Path(env_state)
    return REPO_ROOT / "state"


def read_json_file(path: Path, default=None):
    if not path.is_file():
        return default
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def run_cli_json(args: list[str]):
    try:
        proc = subprocess.run(
            [sys.executable, "-m", "daybreak"] + args,
            cwd=str(REPO_ROOT),
            capture_output=True,
            text=True,
            timeout=10,
        )
        return json.loads(proc.stdout)
    except Exception as exc:
        return {"error": str(exc)}


class CockpitHandler(BaseHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    def do_POST(self):
        # Strict read-only invariant
        self.send_response(405)
        self.send_cors_headers()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(
            json.dumps({"error": "Method Not Allowed. Cockpit is strictly read-only."}).encode()
        )

    def do_PUT(self):
        self.do_POST()

    def do_DELETE(self):
        self.do_POST()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        state_dir = get_state_dir()

        if path == "/api/health":
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            payload = {
                "status": "ok",
                "service": "daybreak-cockpit-api",
                "bind": HOST,
                "port": PORT,
                "read_only": True,
                "state_dir": str(state_dir),
            }
            self.wfile.write(json.dumps(payload).encode())
            return

        if path == "/api/rules":
            rules = read_json_file(state_dir / "rules.json")
            if rules is None:
                rules = run_cli_json(["rules", "show", "--json"])
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(rules).encode())
            return

        if path == "/api/doctor":
            doc = run_cli_json(["doctor", "--json"])
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(doc).encode())
            return

        if path == "/api/snapshot":
            snapshot = read_json_file(state_dir / "snapshot.json", {})
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(snapshot).encode())
            return

        if path == "/api/brief":
            brief = read_json_file(state_dir / "brief.json")
            if brief is None:
                demo = run_cli_json(["demo", "--json"])
                brief = demo.get("brief", {})
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(brief).encode())
            return

        if path == "/api/proposals":
            proposals_dir = state_dir / "proposals"
            proposals = None
            if proposals_dir.is_dir():
                files = sorted(proposals_dir.glob("*.json"))
                if files:
                    proposals = read_json_file(files[-1])

            analysis = read_json_file(state_dir / "analysis.json")
            if analysis is None and proposals is None:
                demo = run_cli_json(["demo", "--json"])
                analysis = demo.get("analysis", {"proposals": [], "meta": {"repo": "unknown", "now": "", "source": "github"}})
            elif analysis is None and proposals is not None:
                analysis = {
                    "meta": {"repo": "active", "now": "", "source": "github"},
                    "proposals": proposals,
                    "suppressed": [],
                    "watching": [],
                }
            elif analysis is not None and proposals is not None:
                analysis["proposals"] = proposals

            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(analysis).encode())
            return

        if path == "/api/ledger":
            ledger = read_json_file(
                state_dir / "ledger.json",
                {"executed": {}, "nudges": {}, "decisions": [], "actions": {}, "budget_skips": []},
            )
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(ledger).encode())
            return

        if path == "/api/metrics":
            metrics = read_json_file(state_dir / "metrics.json")
            if metrics is None:
                demo = run_cli_json(["demo", "--json"])
                metrics = demo.get("metrics", {})
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(metrics).encode())
            return

        # 404
        self.send_response(404)
        self.send_cors_headers()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"error": f"Not found: {path}"}).encode())


def main():
    server = HTTPServer((HOST, PORT), CockpitHandler)
    print(f"Daybreak Cockpit Read-Only API running at http://{HOST}:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        server.server_close()


if __name__ == "__main__":
    main()
