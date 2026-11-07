"""CLI routing. Global options work before or after the command."""
import argparse
import json
import os
import sys
from contextlib import nullcontext
from pathlib import Path
from . import analyze, brief, collect, config, decide, execute, ledger, timeutil as t
from .models import Blocked, GitHubError, read_json, write_json


def options(argv: list[str]):
    global_parser = argparse.ArgumentParser(add_help=False)
    global_parser.add_argument("--source", choices=["github", "fixture"])
    global_parser.add_argument("--repo", default=os.environ.get("DAYBREAK_REPO"))
    global_parser.add_argument("--fixture", type=Path, default=config.ROOT / "fixtures/snapshot_tuesday.json")
    global_parser.add_argument("--now")
    global_parser.add_argument("--state-dir", type=Path, default=Path("state"))
    global_parser.add_argument("--dry-run", action="store_true")
    global_parser.add_argument("--json", action="store_true")
    globals_, rest = global_parser.parse_known_args(argv)
    root = argparse.ArgumentParser(prog="python -m daybreak", parents=[global_parser])
    commands = root.add_subparsers(dest="command", required=True)
    commands.add_parser("analyze")
    decision = commands.add_parser("decide")
    decision.add_argument("action", choices=["approve", "skip", "snooze"])
    decision.add_argument("indices", nargs="+", type=int)
    decision.add_argument("--by", required=True)
    decision.add_argument("--for", dest="duration", choices=["1d", "2d", "1w"])
    execution = commands.add_parser("execute")
    execution.add_argument("--ignore-quiet-hours", action="store_true")
    for name in ("collect", "brief"):
        sub = commands.add_parser(name)
        sub.add_argument("--since", choices=["auto", "24h", "72h"], default="auto")
    local = root.parse_args(rest)
    for key, value in vars(globals_).items():
        setattr(local, key, value)
    return local


def get_snapshot(args, rules: dict, refresh: bool = False) -> dict:
    cached = read_json(args.state_dir / "snapshot.json")
    if refresh or args.source or cached is None:
        source = args.source or ("github" if args.repo else "fixture")
        if source == "github" and args.dry_run:
            raise Blocked("Dry run requires a cached snapshot or fixture; no network allowed")
        data = collect.collect(source, args.fixture, args.repo, args.now, rules, getattr(args, "since", "auto"))
        if not args.dry_run:
            collect.save(args.state_dir, data)
        return data
    if args.now:
        cached["meta"]["now"] = t.iso(t.now(args.now))
    return cached


def run(args):
    rules = config.load(args.state_dir)
    if args.command in ("decide", "execute"):
        data = read_json(args.state_dir / "snapshot.json")
        if not data:
            raise ValueError("Collect and analyze a snapshot first")
        live = data["meta"]["source"] == "github"
        if args.command == "execute" and live and args.now and not args.dry_run:
            raise Blocked("--now cannot override the clock for live writes")
        at = t.now(args.now or (None if live else data["meta"]["now"]))
        path = args.state_dir / "proposals" / f"{t.local_date(at, rules)}.json"
        batch = read_json(path, [])
        book = ledger.load(args.state_dir)
        if args.command == "decide":
            batch, book = decide.decide(batch, book, rules, args.action, args.indices, args.by, at, args.duration)
            if not args.dry_run:
                ledger.save(args.state_dir, book)
                write_json(path, batch)
            return {"proposals": batch}, f"{args.action}: {', '.join(map(str, args.indices))} by @{args.by}"
        result = execute.execute(batch, book, rules, at, args.state_dir, path,
                                 args.repo or data["meta"]["repo"], args.dry_run,
                                 args.ignore_quiet_hours)
        return result, None
    if args.command == "analyze":
        result = analyze.run(get_snapshot(args, rules), rules, args.state_dir, args.dry_run)
        return result, analyze.render(result)
    if args.command == "collect":
        return get_snapshot(args, rules, True), None
    if args.command == "brief":
        result = brief.build(get_snapshot(args, rules), rules, args.since)
        if not args.dry_run:
            write_json(args.state_dir / "brief.json", result)
        return result, brief.render(result, rules)
    raise ValueError("Unknown command")


def main(argv: list[str] | None = None) -> int:
    try:
        args = options(sys.argv[1:] if argv is None else argv)
        if args.now:
            t.now(args.now)
        with (nullcontext() if args.dry_run else ledger.locked(args.state_dir)):
            result, markdown = run(args)
        print(json.dumps(result, indent=2, sort_keys=True) if args.json or markdown is None else markdown)
        return 4 if isinstance(result, dict) and result.get("failed") else 0
    except Blocked as exc:
        print(str(exc), file=sys.stderr)
        return 3
    except GitHubError as exc:
        print(str(exc), file=sys.stderr)
        return 4
    except (ValueError, OSError) as exc:
        print(str(exc), file=sys.stderr)
        return 2
