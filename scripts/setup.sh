#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python3 -c 'import sys; assert sys.version_info >= (3, 11), "Python 3.11+ required"'
if [[ ! -x .venv/bin/python ]]; then
  python3 -m venv .venv
fi
if ! .venv/bin/python -c 'import pytest' 2>/dev/null; then
  .venv/bin/python -m pip install 'pytest>=8'
fi
.venv/bin/python -c 'from pathlib import Path; from daybreak.config import load; from daybreak.models import write_json; p = Path("state"); p.mkdir(exist_ok=True); write_json(p / "rules.json", load(p))'
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI: authenticated"
else
  echo "GitHub CLI: optional live setup pending (gh auth login)"
fi
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  echo "Docker: available"
else
  echo "Docker: optional Switch local-server setup pending"
fi
if [[ -d "/Applications/Switch Console.app" ]] || command -v switch-console >/dev/null 2>&1; then
  echo "Switch Console: detected; verify server connection in the app"
else
  echo "Switch Console: not detected; see switch/NOTES.md"
fi
REPO_DIR="$(pwd -P)"
DAYBREAK_HOME="${DAYBREAK_HOME:-$HOME/.daybreak}"
mkdir -p "$DAYBREAK_HOME/bin"

CONFIG_FILE="$DAYBREAK_HOME/config.json"
if [[ -f "$CONFIG_FILE" ]]; then
  cp "$CONFIG_FILE" "${CONFIG_FILE}.bak"
  echo "Existing config backed up to ${CONFIG_FILE}.bak"
fi

cat > "$CONFIG_FILE" << EOF
{
  "state_dir": "$REPO_DIR/state",
  "fixture": "$REPO_DIR/fixtures/snapshot_tuesday.json",
  "source": "fixture",
  "repo": ""
}
EOF

WRAPPER="$DAYBREAK_HOME/bin/daybreak"
cat > "$WRAPPER" << EOF
#!/usr/bin/env bash
set -euo pipefail
export PYTHONPATH="$REPO_DIR:\${PYTHONPATH:-}"
exec "$REPO_DIR/.venv/bin/python" -m daybreak "\$@"
EOF
chmod +x "$WRAPPER"

echo "Configured: $CONFIG_FILE"
echo "Installed wrapper: $WRAPPER"
echo "Ready: make test && make demo (fixture demo needs no GitHub or Switch)"
