"""CLI routing. Global options work before or after the command."""
import argparse
import json
import os
import sys
from pathlib import Path
from . import brief, collect, config, timeutil as t
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
        result, markdown = run(args)
        print(json.dumps(result, indent=2, sort_keys=True) if args.json or markdown is None else markdown)
        return 0
    except Blocked as exc:
        print(str(exc), file=sys.stderr)
        return 3
    except GitHubError as exc:
        print(str(exc), file=sys.stderr)
        return 4
    except (ValueError, OSError) as exc:
        print(str(exc), file=sys.stderr)
        return 2
