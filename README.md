# Daybreak — Standup Zero with Early Warning

> Three AI agents and a deterministic Python toolkit replace the daily standup,
> surface stuck pull requests, and flag at-risk PRs early — with every outbound
> action approved by a human.

**Flip the Switch Hackathon · Track 1: Best Business Workflow**

---

## The Problem

Three small frictions repeat every working day:

| Friction | What happens |
| --- | --- |
| **Status theatre** | Updates are typed or spoken even though commits, PRs and issues already hold the facts |
| **Rotting work** | Review requests wait, CI stays red and approved PRs sit unmerged because nobody wants to nag |
| **Tracker drift** | The tracker disagrees with reality because updating it is a second job |

Daybreak turns GitHub activity into a **morning brief**, a short list of
**evidence-backed nudges**, and **early flags** for PRs that look likely to stall —
all inside the team's chat.

---

## Architecture

```
 Scheduler (cron or GitHub Action)        GitHub (live)    Fixtures (JSON)
        | webhook post "brief"                 ^                 ^
        v                                      | gh CLI          |
 +--------------------------------------------------------------------+
 | Mattermost #daybreak  <-- Collaboration Bridge -->  Switch Room    |
 +----------------------------------+---------------------------------+
                                    | Agent Bridge (Console)
              +---------------------+---------------------+
              v                     v                     v
         Scribe                 Sentinel                Clerk
         collect, brief         collect, analyze,       decide, execute
                                rules, metrics
              \                     |                     /
               +-----------  daybreak toolkit (Python)  --+
                              state/ snapshot, proposals, rules, ledger
```

**Design principle: "Code decides, agents explain."**

- Detection, scoring, ranking and idempotency live in tested Python (standard
  library only, zero runtime dependencies).
- Agents read JSON, write prose and talk to humans. No agent can write to
  GitHub without a human approval recorded in the ledger.

### Data Flow

1. A trigger message `brief` arrives (from the scheduler or a human).
2. **Scribe** runs `daybreak collect` then `daybreak brief` and posts the brief.
3. **Sentinel** runs `daybreak analyze` and posts the numbered proposal list.
4. A human replies with a decision (`approve 1 5`, `skip 2`, `snooze 3 2d`).
5. **Clerk** runs `daybreak decide` then `daybreak execute` and posts result links.
6. For a rule change, Sentinel runs `daybreak rules set` and confirms.
7. Weekly, Sentinel runs `daybreak metrics --week` and posts the scoreboard.

### Agents

| Agent | Provider | Allowed Commands | Role |
| --- | --- | --- | --- |
| **Scribe** | Claude Code | `collect`, `brief` | Post the daily brief; edit a person's own section on request |
| **Sentinel** | Codex / OpenCode | `collect`, `analyze`, `rules show/set`, `metrics` | Post proposals; handle rule changes; post the scoreboard |
| **Clerk** | Claude Code | `decide`, `execute` | Parse human decisions, record them, execute, post result links |

---

## Quick Start

### Prerequisites

- Python 3.11+ (standard library only — no pip packages at runtime)
- `gh` CLI ([install](https://cli.github.com/)) — optional, only for live GitHub mode

### One-Command Setup

```bash
git clone https://github.com/<your-org>/Flip-the-Switch.git
cd Flip-the-Switch
make setup        # Creates venv, installs pytest, initializes state/
```

### Run Tests

```bash
make test         # 74 tests, ~0.1s, fully offline
```

### Run the Fixture Demo

```bash
make demo         # Full pipeline on seeded scenarios — no GitHub, no writes
```

The demo runs the complete pipeline: collect → brief → analyze → approve all →
execute (dry run) → scoreboard, all on deterministic fixture data.

### Run Against a Live Repository

```bash
export DAYBREAK_REPO="owner/repo"
export DAYBREAK_ALLOW_WRITE=1          # Required for outbound writes

python -m daybreak collect --source github
python -m daybreak brief
python -m daybreak analyze
python -m daybreak decide approve 1 2 --by your-github-login
python -m daybreak execute
```

---

## CLI Reference

Run as `python -m daybreak <command>`. Global flags work before or after the command.

| Flag | Purpose |
| --- | --- |
| `--source github\|fixture` | Data source (auto-detected from `--repo`) |
| `--repo OWNER/REPO` | Target repository |
| `--fixture PATH` | Fixture JSON path (default: `fixtures/snapshot_tuesday.json`) |
| `--now ISO` | Time-travel for deterministic testing |
| `--state-dir PATH` | State directory (default: `state/`) |
| `--dry-run` | No network calls, no state writes |
| `--json` | JSON output instead of markdown |

| Command | Purpose |
| --- | --- |
| `collect [--since auto\|24h\|72h]` | Build the snapshot |
| `brief [--since auto\|24h\|72h]` | Group activity per person |
| `analyze` | Run stuck rules + early warning, rank and cap |
| `decide approve N... --by USER` | Mark proposals approved |
| `decide skip N... --by USER` | Mark proposals skipped |
| `decide snooze N --for 1d\|2d\|1w --by USER` | Snooze a target |
| `execute [--ignore-quiet-hours]` | Run approved proposals through `gh` |
| `rules show` | Display current rules |
| `rules set KEY VALUE --by USER` | Change a rule |
| `metrics --week` | Weekly scoreboard |
| `demo` | Full fixture pipeline demo |

**Exit codes:** 0 success · 2 invalid input · 3 blocked (quiet hours, unauthorized, writes disabled) · 4 GitHub/auth error.

---

## Stuck-Item Rules

| Rule | Trigger | Default Threshold |
| --- | --- | --- |
| R1 `review_stuck` | Review request waiting too long | 24 hours |
| R2 `ci_red` | CI check failing for too long | 12 hours |
| R3 `approved_unmerged` | Approved PR sitting unmerged | 24 hours |
| R4 `stale_issue` | Assigned issue with no updates | 3 days |

Draft PRs are excluded from R1–R3.

## Early Warning Flags

Heuristic signals — not predictions. Output says "flag", never "predict".

| Signal | Condition | Points |
| --- | --- | --- |
| `no_reviewer` | Open > 4h with no reviewer requested | +20 |
| `workload` | Author has ≥ 3 other open PRs | +20 |
| `dependency` | Body references an open PR/issue ("depends on #N") | +25 |

**Tiers:** 1 signal = Watch (no actions) · 2 = At risk · 3 = High.

---

## Safety & Idempotency

- **Human approval required** — zero outbound writes without explicit `approve`.
- **Action digest** — SHA-256 of `(id, target, actions, repo, source)` binds
  the approved content immutably.
- **Idempotency markers** — `<!-- daybreak:PROPOSAL_ID -->` in every comment;
  checked before writing to prevent duplicates.
- **Write-ahead intent** — uncertain writes block automatic retries.
- **Process lock** — `fcntl.flock` prevents concurrent state corruption.
- **Quiet hours** — execution blocked outside working hours (configurable).
- **Nudge budget** — max 2 nudges per person per day (configurable).
- **Evidence rule** — no link, no claim. Every item requires a valid URL.

---

## Repository Structure

```
Flip-the-Switch/
├── daybreak/                    # Python toolkit (1,128 LOC, stdlib only)
│   ├── cli.py                   # CLI routing and global options
│   ├── config.py                # Default rules, validation, authorization
│   ├── timeutil.py              # UTC parsing, quiet hours, working-day windows
│   ├── ghclient.py              # Subprocess wrapper for gh CLI
│   ├── collect.py               # Snapshot collection (fixture or live)
│   ├── brief.py                 # Per-person activity briefs
│   ├── stuck.py                 # Four stuck-work detection rules
│   ├── early_warning.py         # Heuristic early-warning signals
│   ├── proposals.py             # Ranking, caps, stable indexing
│   ├── analyze.py               # Orchestrates detection → proposals
│   ├── decide.py                # Human decisions with action digests
│   ├── execute.py               # Approved action execution with recovery
│   ├── ledger.py                # Atomic persistence and process lock
│   ├── metrics.py               # Weekly scoreboard calculations
│   └── models.py                # JSON models, evidence validation
├── agents/                      # Agent instruction files
│   ├── scribe.md                # Scribe (Claude Code)
│   ├── sentinel.md              # Sentinel (Codex/OpenCode)
│   └── clerk.md                 # Clerk (Claude Code)
├── fixtures/                    # Deterministic test data
│   ├── snapshot_tuesday.json    # 14 PRs, 2 issues, 6 commits
│   └── rules.default.json      # Default configuration
├── tests/                       # 74 tests, fully offline
├── scripts/                     # Setup, trigger, and seeding scripts
├── switch/                      # Switch room template (WIP)
├── state/                       # Runtime state (git-ignored)
├── docs/                        # Architecture, decisions, demo guide
├── .github/workflows/           # Optional daily trigger action
├── Makefile                     # setup, test, demo targets
└── pyproject.toml               # Python 3.11+, zero runtime deps
```

---

## Fixture Scenarios

The fixture snapshot (`fixtures/snapshot_tuesday.json`) models a team of 5 at
`acme/shop` on **Tue 2026-11-10 at 09:30 IST** (04:00 UTC):

| Item | Author | Expected Result |
| --- | --- | --- |
| PR #42 | priya | Stuck: review waiting 31h for @arjun (SLA 24h) |
| PR #45 | meera | Stuck: CI red for 14h (limit 12h) |
| PR #39 | arjun | Stuck: approved 26h ago, unmerged (limit 24h) |
| Issue #30 | — (assigned sam) | Stuck: stale 96h (limit 72h) |
| PR #52 | sam | Early warning: HIGH (3 signals, 65 points) |
| PR #47, #49, #50 | sam | Watching: workload only |
| PR #44, #55 | priya, lead | Excluded (drafts) |
| PR #53 | meera | Not flagged (grace period) |

---

## Configuration

Rules are stored in `state/rules.json` and can be changed via chat
(`set KEY VALUE`) or CLI (`daybreak rules set KEY VALUE --by USER`).

Key settings: `stuck.review_sla_hours`, `stuck.red_ci_hours`,
`quiet_hours.start`, `quiet_hours.friday_cutoff`, `limits.max_stuck_proposals`,
`early_warning.grace_hours`, `reviewers`, `approvers`, `timezone`,
`standup_minutes`.

The `team` key is not settable via chat (admin-only).

---

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `DAYBREAK_REPO` | Default repository (`OWNER/REPO`) |
| `DAYBREAK_ALLOW_WRITE` | Set to `1` to enable GitHub writes |
| `MATTERMOST_WEBHOOK_URL` | Webhook for the daily trigger script |

---

## License

Hackathon project. See repository for details.
