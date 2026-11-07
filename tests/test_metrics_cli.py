import copy
from daybreak import metrics, timeutil as t
from daybreak.cli import main
from daybreak.models import read_json

def test_median(snapshot, rules):
    result = metrics.build(snapshot, rules, {}, [])
    assert result["current"]["median_first_review_wait_hours"] == 24
    assert result["seeded"]
    assert result["current"]["standup_minutes_saved_assumption"] == 15

def test_resolution(snapshot, rules):
    old = copy.deepcopy(snapshot)
    old["meta"]["now"] = "2026-11-10T03:00:00Z"
    book = {"executed": {"p": {"time": "2026-11-10T03:30:00Z", "type": "ci_red",
            "target": {"kind": "pr", "number": 45, "url": "https://github.com/acme/shop/pull/45"}}}}
    next(p for p in snapshot["prs"] if p["number"] == 45)["checks"] = []
    assert metrics.build(snapshot, rules, book, [old])["current"]["stuck_items_resolved"] == 1

def test_missing_resolution_unknown(snapshot, rules):
    book = {"executed": {"p": {"time": "2026-11-10T03:30:00Z", "type": "ci_red",
            "target": {"kind": "pr", "number": 999, "url": "https://github.com/acme/shop/pull/999"}}}}
    result = metrics.build(snapshot, rules, book, [])
    assert result["current"]["stuck_items_resolved"] == 0
    assert result["current"]["resolution_unknown"] == 1

def test_flag_counts_deduplicated(snapshot, rules):
    decision = {"id": "warn-pr52", "type": "early_warning", "action": "skip", "time": snapshot["meta"]["now"]}
    result = metrics.build(snapshot, rules, {"decisions": [decision, decision]}, [])
    assert result["current"]["flags_skipped_likely_false_positives"] == 1

def test_rules_cli(tmp_path, capsys):
    assert main(["rules", "set", "stuck.red_ci_hours", "16", "--by", "lead", "--state-dir", str(tmp_path)]) == 0
    assert read_json(tmp_path / "rules.json")["stuck"]["red_ci_hours"] == 16
    assert read_json(tmp_path / "ledger.json")["decisions"][-1]["action"] == "rule_change"
    assert "12 → 16" in capsys.readouterr().out
    assert main(["rules", "set", "team", "[]", "--by", "lead", "--state-dir", str(tmp_path)]) == 2

def test_demo_no_files_no_network(tmp_path, capsys):
    assert main(["demo", "--state-dir", str(tmp_path), "--json"]) == 0
    assert not list(tmp_path.iterdir())
    import json
    output = json.loads(capsys.readouterr().out)
    assert len(output["analysis"]["proposals"]) == 5
    assert output["execution"]["dry_run"]

def test_dry_run_no_files(tmp_path, capsys):
    assert main(["--dry-run", "analyze", "--source", "fixture", "--state-dir", str(tmp_path)]) == 0
    assert not list(tmp_path.iterdir())

def test_cli_approval_exit_and_quiet(tmp_path, capsys):
    flags = ["--state-dir", str(tmp_path)]
    assert main(["analyze", "--source", "fixture", *flags]) == 0
    assert main(["execute", "--dry-run", *flags]) == 3
    assert main(["decide", "approve", "1", "--by", "lead", *flags]) == 0
    assert main(["execute", "--dry-run", "--now", "2026-11-10T16:00:00Z", *flags]) == 3

def test_rule_change_affects_analysis(tmp_path, capsys):
    flags = ["--state-dir", str(tmp_path)]
    assert main(["rules", "set", "stuck.review_sla_hours", "40", "--by", "lead", *flags]) == 0
    assert main(["analyze", "--source", "fixture", *flags]) == 0
    result = read_json(tmp_path / "analysis.json")
    assert not any(p["type"] == "review_stuck" for p in result["proposals"])
