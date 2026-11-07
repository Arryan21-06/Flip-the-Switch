#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

STATE_DEMO="state-demo"
mkdir -p "$STATE_DEMO/snapshots" "$STATE_DEMO/proposals"

cp fixtures/rules.default.json "$STATE_DEMO/rules.json"
cp fixtures/snapshot_tuesday.json "$STATE_DEMO/snapshot.json"
cat > "$STATE_DEMO/ledger.json" << 'EOF'
{
  "actions": {},
  "budget_skips": [],
  "decisions": [],
  "executed": {},
  "nudges": {}
}
EOF

echo "Prepared state directory: $STATE_DEMO"
echo ""
echo "=========================================================="
echo " DAYBREAK DEMO ROOM READY (state-demo/)"
echo "=========================================================="
echo ""
echo "Exact chat sequence to type in the Switch room (#daybreak):"
echo ""
echo "  1. Human:    brief"
echo "  2. Scribe:   [Posts Standup Zero brief with 5 members]"
echo "  3. Sentinel: [Posts 4 Stuck items + 1 Early warning in thread]"
echo "  4. Human:    approve 2 5"
echo "  5. Clerk:    [Confirms approval & dry-run execute for #42 and #52]"
echo "  6. Human:    snooze 3 2d"
echo "  7. Clerk:    [Confirms snooze for #39 for 2 days]"
echo "  8. Human:    set quiet_hours.friday_cutoff 16:00"
echo "  9. Sentinel: [Confirms rule update 17:00 -> 16:00 by human]"
echo " 10. Human:    scoreboard"
echo " 11. Sentinel: [Displays weekly scoreboard]"
echo ""
echo "To test via CLI directly with state-demo:"
echo "  ~/.daybreak/bin/daybreak --state-dir state-demo brief"
echo "  ~/.daybreak/bin/daybreak --state-dir state-demo analyze"
echo "=========================================================="
