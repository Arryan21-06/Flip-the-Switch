# Daybreak PRD: Standup Zero with Early Warning

Nov 7, 2026 · @Aditya Kumar

Daybreak is a Switch chat room where three AI agents and a deterministic Python toolkit replace the daily standup, surface stuck pull requests, and flag at-risk PRs early, with every outbound action approved by a human.

## 1. Product summary

| Item | Value |
| --- | --- |
| Product | Daybreak, hackathon MVP v1.0 |
| Event and track | Flip the Switch Hackathon, Track 1: Best Business Workflow |
| Deadline | Nov 7, 2026, 11:59 PM IST |
| Users | Dev teams of 2 to 10 people, and solo developers with side projects |
| Chat surface | Mattermost bundled with Switch (portable to Slack, Teams, Discord, Telegram) |
| Agents | Scribe (Claude Code), Sentinel (Codex or OpenCode), Clerk (Claude Code) |
| Data source | GitHub through the `gh` CLI, or JSON fixtures for tests and demos |
| Toolkit | Python 3.11+, standard library only, pytest for tests |

## 2. Problem

Three small frictions repeat every working day.

- **Status theatre.** Updates are typed or spoken even though commits, PRs and issues already hold the facts.
- **Rotting work.** Review requests wait, CI stays red and approved PRs sit unmerged, because nobody wants to be the one who nags.
- **Tracker drift.** The tracker disagrees with reality because updating it is a second job.

Daybreak turns that activity into a morning brief, a short list of evidence-backed nudges, and early flags for PRs that look likely to stall, all inside the team's chat.

## 3. Goals, non-goals and success criteria

**Goals.** G1: replace hand-written standups with an evidence-linked brief. G2: surface stuck work with a reason, evidence and a drafted nudge. G3: flag at-risk PRs early using transparent rules. G4: keep a human in control, with no outbound action before approval. G5: be reproducible, with a working demo from a fresh clone in under 10 minutes.

**Non-goals.** Agents changing code, merging, or assigning work. Multi-repo dashboards. A custom UI (the chat is the UI). A trained ML model. Any claim that delays were prevented.

| ID | Criterion | Target |
| --- | --- | --- |
| S1 | Trigger to posted brief | 60 s or less on fixtures, 90 s or less live with up to 30 open PRs |
| S2 | Brief and proposal lines that carry a URL | 100% |
| S3 | Detection on the fixture repo | Every expected item flagged, zero extra |
| S4 | Writes before approval, duplicate writes | 0 and 0 |
| S5 | Fresh clone to working fixture demo | 10 minutes or less, documented |
| S6 | Automated tests | 30 or more, all passing |
| S7 | Recorded end-to-end demo | 3 minutes or less |

## 4. Users and stories

Personas: **Priya**, a developer who writes updates. **Arjun**, a reviewer. **Lead**, who approves actions and sets team rules.

| ID | As | I want | So that | Req |
| --- | --- | --- | --- | --- |
| U1 | Priya | My update drafted from my GitHub activity, with links | I stop retyping status | FR-2, FR-3 |
| U2 | Priya | To adjust my section in the thread | It stays accurate | FR-4 |
| U3 | Lead | Stuck items with a reason and a drafted nudge | I stop chasing people manually | FR-5, FR-6 |
| U4 | Lead | To approve, skip or snooze each item | I stay in control | FR-7 |
| U5 | Lead | Early flags on PRs likely to stall | I can act before they do | FR-10 |
| U6 | Lead | To change thresholds by chatting | Rules match team norms | FR-9 |
| U7 | Arjun | A polite, specific nudge with a link | I know what to review | FR-8 |
| U8 | Lead | A weekly scoreboard | I can see whether things improve | FR-13 |
| U9 | Everyone | No nudges at night or late Friday | I trust the tool | FR-11 |

## 5. Key design decisions

| ID | Decision | Reason |
| --- | --- | --- |
| D1 | Code decides, agents explain. Detection, scoring, ranking and idempotency live in tested Python. Agents read JSON, write prose and talk to humans. | Reproducible, testable, hard to hallucinate |
| D2 | Two data sources: `fixture` (deterministic, with a `--now` override) and `github` (live) | Real GitHub cannot be back-dated, so scenarios like "waiting 31 hours" exist only as fixtures. Live mode proves the write path |
| D3 | Writes only after approval. `execute` refuses anything not approved, and every comment carries a hidden marker | Safety and exactly-once behavior |
| D4 | Standard library only: Python 3.11+, `gh` through subprocess, pytest for tests | One-command setup, nothing to break |
| D5 | Rules live in the Room and persist in `state/rules.json`. Humans edit them in chat, Sentinel validates and calls `daybreak rules set` | Switch stays load-bearing, the toolkit stays deterministic |
| D6 | No link, no claim. Every brief or proposal line comes from a JSON item that has a URL | Trust |
| D7 | Early warning shows tiers (Watch, At risk, High) with reasons, never a probability | Nothing is calibrated, so we do not imply a probability |

## 6. Functional requirements

| ID | Requirement | Pri | Acceptance criteria |
| --- | --- | --- | --- |
| FR-1 | `collect` reads open PRs, PRs merged in the window, open issues, commits in the window, review-request timestamps and CI checks into one snapshot, from GitHub or a fixture | P0 | Output matches the snapshot model. 30 PRs collect in 20 s or less live. Fixture mode needs no network |
| FR-2 | `brief` groups activity per team member: merged, opened, reviewed, commits, currently open PRs, assigned issues | P0 | Every item has a URL. A member with none gets "No activity found" |
| FR-3 | Scribe posts one message with a section per person | P0 | Matches section 12. No fact outside the brief JSON |
| FR-4 | A member can ask Scribe in the thread to edit their own section | P0 | Only that section changes. Nothing is added without a URL |
| FR-5 | Four stuck-item rules (section 9.1) | P0 | All fixture items found, none extra |
| FR-6 | One proposal per target with reasons, a drafted message and actions, ranked and capped | P0 | Ids are deterministic. Caps and tie-breaks follow section 9.3 |
| FR-7 | `approve`, `skip` and `snooze` recorded with who and when | P0 | Status changes. Unknown index rejected. Approver list enforced |
| FR-8 | Approved proposals run through `gh`, exactly once | P0 | Zero writes before approval. A second run is a no-op |
| FR-9 | Humans change allowed rules in chat, stored in `rules.json`, decision logged in the Room | P0 | Next `analyze` obeys. Invalid key rejected |
| FR-10 | Early warning (section 9.2): tiers, two preventive actions | P1 | Fixture PR #52 is High. #53, #54, #55 are not flagged |
| FR-11 | Quiet hours, Friday cutoff, per-person nudge budget | P1 | `execute` exits 3 in quiet hours. Budget skips are logged |
| FR-12 | A script posts the trigger at 09:30 IST | P1 | Posts through the Mattermost webhook. Optional Actions cron `0 4 * * *` |
| FR-13 | Weekly scoreboard (section 13) | P1 | Numbers reproduce from snapshot and ledger |
| FR-14 | `--dry-run` prints actions without writing. `daybreak demo` runs the whole pipeline on fixtures | P0 | No network and no writes in dry run |
| FR-15 | Reviewer digest: "PRs waiting on you" | P2 | Stretch only |

## 7. Architecture

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

**Data flow.**

1. A trigger message "brief" arrives, from the scheduler or a human.
2. Scribe runs `daybreak collect` then `daybreak brief` and posts the brief.
3. Sentinel runs `daybreak analyze` and posts the numbered proposal list as a thread under the brief.
4. A human replies with a decision, for example `approve 1 5`.
5. Clerk runs `daybreak decide` then `daybreak execute` and posts the result links.
6. For a rule change, Sentinel runs `daybreak rules set` and confirms in the thread.
7. Weekly, Sentinel runs `daybreak metrics --week` and posts the scoreboard.

The Switch Room holds the rules, decisions and conversation. The toolkit holds the computation and the exactly-once ledger.

## 8. Data models

All timestamps are UTC ISO-8601 ending in Z. Parse `gh` output defensively: a missing field becomes null, never a crash.

**Snapshot** (`state/snapshot.json`):

```
{
  "meta": {"repo": "acme/shop", "source": "fixture", "now": "2026-11-10T04:00:00Z"},
  "prs": [{
    "number": 42, "title": "Add token refresh", "url": "https://github.com/acme/shop/pull/42",
    "author": "priya", "state": "open", "is_draft": false, "labels": [],
    "created_at": "...", "updated_at": "...", "merged_at": null, "body": "...",
    "review_requests": [{"login": "arjun", "requested_at": "..."}],
    "reviews": [{"author": "meera", "state": "APPROVED", "submitted_at": "..."}],
    "review_decision": null,
    "checks": [{"name": "tests", "conclusion": "FAILURE", "completed_at": "..."}]
  }],
  "issues": [{"number": 30, "title": "...", "url": "...", "state": "open",
              "assignees": ["sam"], "labels": [], "created_at": "...", "updated_at": "..."}],
  "commits": [{"sha": "abc123", "author": "priya", "message": "first line", "url": "...", "date": "..."}]
}
```

**Proposal** (`state/proposals/<local date>.json` holds a list):

```
{
  "id": "nudge-review-pr42-2026-11-10", "index": 2,
  "type": "review_stuck", "severity": "stuck", "tier": null, "points": null,
  "target": {"kind": "pr", "number": 42, "url": "..."},
  "person": "arjun", "over_hours": 7.0,
  "summary": "PR #42 waiting 31h for @arjun (SLA 24h)",
  "reasons": [{"text": "Review requested 31h ago", "url": "..."}],
  "actions": [{"kind": "comment", "target": "pr", "number": 42, "body": "Hi @arjun, ..."}],
  "status": "proposed", "decided_by": null, "decided_at": null,
  "snooze_until": null, "executed_at": null, "result_urls": []
}
```

Types: `review_stuck`, `ci_red`, `approved_unmerged`, `stale_issue`, `early_warning`. Action kinds: `comment` (on a PR or issue) and `request_review`. Statuses: `proposed`, `approved`, `skipped`, `snoozed`, `executed`, `failed`. Id patterns, with the local date in `rules.timezone`: `nudge-review-pr42-DATE`, `nudge-ci-pr45-DATE`, `nudge-merge-pr39-DATE`, `nudge-stale-issue30-DATE`, `warn-pr52-DATE`.

**Default rules** (`state/rules.json`, created from `rules.default.json`):

```
{
  "timezone": "Asia/Kolkata",
  "quiet_hours": {"start": "20:00", "end": "09:00", "friday_cutoff": "17:00"},
  "stuck": {"review_sla_hours": 24, "red_ci_hours": 12,
            "approved_unmerged_hours": 24, "stale_issue_days": 3},
  "early_warning": {"grace_hours": 4, "workload_open_prs": 3,
                    "points": {"no_reviewer": 20, "workload": 20, "dependency": 25}},
  "limits": {"max_stuck_proposals": 4, "max_warning_proposals": 2,
             "max_nudges_per_person_per_day": 2},
  "reviewers": ["arjun", "meera"],
  "approvers": [],
  "team": [{"github": "priya", "chat": "priya", "name": "Priya"}],
  "standup_minutes": 15
}
```

An empty `approvers` list means any room member may approve. Settable keys (allowlist): every key above except `team`, with type and range validation.

**Ledger** (`state/ledger.json`): `executed` maps proposal id to time, approver and result URLs. `nudges` maps local date to person to count. `decisions` is a list of id, action, approver and time.

## 9. Algorithms

### 9.1 Stuck-item rules

Time comes from `snapshot.meta.now`. Drafts are excluded from R1, R2 and R3.

| Rule | Trigger | Person to nudge | over\_hours |
| --- | --- | --- | --- |
| R1 `review_stuck` | Open PR with a review request waiting at least `review_sla_hours`. Use the reviewer with the longest wait | That reviewer | wait minus SLA |
| R2 `ci_red` | Open PR with a check whose conclusion is FAILURE, ERROR or TIMED\_OUT, red for at least `red_ci_hours`. Red since = earliest failing `completed_at` | PR author | red hours minus limit |
| R3 `approved_unmerged` | Open PR with `review_decision` APPROVED and the latest approval at least `approved_unmerged_hours` old | PR author | age minus limit |
| R4 `stale_issue` | Open issue with at least one assignee and `updated_at` at least `stale_issue_days` old | First assignee | age hours minus days times 24 |

Each rule emits reasons with URLs and one `comment` action whose body is a polite, specific message.

### 9.2 Early-warning flags (F11)

These are heuristics, not a trained model. The output says "flag", never "predict". Evaluate every open, non-draft PR that is not snoozed.

| Signal | Condition | Points |
| --- | --- | --- |
| no\_reviewer | Age at least `grace_hours`, no review requests and no submitted reviews | +20 |
| workload | The author has at least `workload_open_prs` other open PRs (drafts count, the PR itself does not) | +20 |
| dependency | The body has a case-insensitive "depends on" or "blocked by" followed by #N, and #N is an open PR or issue in the same repo | +25 |

- **Tier** = number of signals: 1 is Watch, 2 is At risk, 3 is High. Points only rank items inside a tier. There is no 0 to 100 score and no Critical level.
- **Proposals** are created only for At risk and High. Watch items are listed under `watching` with no actions.
- **Actions.** If no\_reviewer fired, a `request_review` for the eligible reviewer with the fewest pending review requests across open PRs (eligible = `reviewers` minus the author, ties broken alphabetically). If dependency fired, a `comment` on #N asking its owner for an ETA.
- **Multiple dependency references** count as one signal, and every open target is listed as evidence. References to other repos or to closed items are ignored.

### 9.3 Ranking and caps

Stuck proposals sort by `over_hours` descending, then target number ascending, and keep the top `max_stuck_proposals`. Warning proposals sort by tier rank descending, points descending, then number ascending, and keep the top `max_warning_proposals`. Dropped items are recorded as `suppressed_by_cap`. Indices run 1 to N, stuck first, then warnings.

### 9.4 Suppression order

Build candidates, then drop snoozed targets (until `snooze_until`), then drop ids already executed today, then drop people at their nudge budget (budget skips are logged), then rank and cap. A proposal still in `proposed` status from an earlier run today is carried over, never duplicated. Quiet hours are enforced at `execute`, not at `analyze`.

## 10. Toolkit CLI

Run as `python -m daybreak <command>`. Global flags: `--source github` or `fixture`, `--repo OWNER/REPO`, `--fixture PATH`, `--now ISO` (time-travel), `--state-dir PATH`, `--dry-run`, `--json`.

| Command | Purpose | Output |
| --- | --- | --- |
| `collect` | Build the snapshot | `state/snapshot.json` |
| `brief --since auto or 24h or 72h` | Group activity per person. `auto` looks back to the previous working day at 09:30 local time | `state/brief.json` and markdown |
| `analyze` | Run R1 to R4 and F11, apply 9.4, rank and cap | `state/proposals/DATE.json` and markdown list |
| `decide approve N... --by USER` | Mark proposals approved | Confirmation |
| `decide skip N... --by USER` | Mark skipped (counted as likely false positives for F11) | Confirmation |
| `decide snooze N --for 1d or 2d or 1w --by USER` | Snooze a target | Confirmation |
| `execute` | Run approved proposals through `gh`, exactly once. Flags: `--dry-run`, `--ignore-quiet-hours` | Result links |
| `rules show` and `rules set KEY VALUE --by USER` | Read and change rules | Current rules or confirmation |
| `metrics --week` | Scoreboard | Markdown |
| `demo` | Collect, brief, analyze, approve all, execute with dry run, on fixtures | Transcript |

Exit codes: 0 success, 2 invalid input, 3 blocked (quiet hours, not approved, approver not allowed), 4 GitHub or auth error.

**Live collection** uses `gh pr list --json number,title,url,author,isDraft,createdAt,updatedAt,body,labels,reviewRequests,reviews,reviewDecision,statusCheckRollup`, `gh pr list --state merged --search "merged:>=DATE"`, `gh issue list --json number,title,url,assignees,labels,createdAt,updatedAt`, `gh api repos/OWNER/REPO/commits?since=ISO`, and `gh api repos/OWNER/REPO/issues/N/timeline` for `review_requested` events (their `created_at` is `requested_at`). Team reviewers are kept as `team:slug` and never nudged.

**Execution** uses `gh pr comment`, `gh issue comment` and `gh pr edit --add-reviewer`. Every comment body starts with `[Daybreak, approved by @USER]` and ends with `<!-- daybreak:PROPOSAL_ID -->`. Before writing, check the ledger and then the existing comments for the marker, so a lost ledger cannot cause a duplicate. Writes also require `DAYBREAK_ALLOW_WRITE=1`.

## 11. Agent specifications

| Agent | Provider | Allowed commands | Responsibilities |
| --- | --- | --- | --- |
| Scribe | Claude Code | `collect`, `brief` | Post the brief. Edit a person's own section on request |
| Sentinel | Codex or OpenCode | `collect`, `analyze`, `rules show`, `rules set`, `metrics` | Post proposals. Handle rule changes. Post the scoreboard |
| Clerk | Claude Code | `decide`, `execute` | Parse decisions, record them, execute, post result links |

Shared rules, written into each agent's instruction file:

- Run only the allowed `daybreak` commands. Never run `gh` or `git` directly, and never write outside `state/`.
- Every number, name and link comes from toolkit output. If a fact has no URL, do not state it.
- Paste proposal lists exactly as the toolkit prints them. Only briefs may be lightly rephrased, and never with new facts.
- Echo the understood command before running it, for example "Understood: approve 1 5".
- Accept decisions only from users allowed by `approvers`. On exit code 3 or 4, post one short, plain explanation and stop.
- Edits to a brief section are accepted only from the person named in that section.

## 12. Chat grammar and message formats

Grammar, case-insensitive, in the proposal thread: `approve N [N...]`, `skip N`, `snooze N 1d|2d|1w`, `rules`, `set KEY VALUE`, `brief`, `scoreboard`. Natural language is allowed when it maps unambiguously. "Approve all" is refused unless a rule enables it. A statement like "no nudges on Fridays" maps to `set quiet_hours.friday_cutoff 00:00`.

**Brief:**

```
Daybreak brief · Tue 10 Nov · last 24h

@priya
Yesterday: merged "Add token refresh" (#41) <url>; 3 commits <url>
Today (open work): #42 awaiting review <url>, #44 draft <url>, #48 <url>

@meera
No activity found in the last 24h.

Heads-up: proposals are in the thread below.
Reply in this thread to edit your own section.
```

**Proposal list:**

```
Stuck items (4)
1. Issue #30 stale, 96h since update (limit 72h), assigned @sam <url>
2. PR #42 waiting 31h for @arjun (SLA 24h) <url>
3. PR #39 approved 26h ago, not merged (limit 24h) <url>
4. PR #45 CI red for 14h (limit 12h) <url>

Early warning (1)
5. PR #52 HIGH (3 signals, 65 points) <url>
   - No reviewer requested, open 5h <url>
   - Author has 3 other open PRs: #47, #49, #50 <urls>
   - Says "depends on #48", still open <url>
   Actions: request review from @meera (fewest pending); comment on #48 asking for an ETA

Reply: approve 1 5 | skip 2 | snooze 3 2d
```

Other messages are one-liners: decision confirmation, execution result with links, rule-change confirmation (old and new value), and the weekly scoreboard.

## 13. Metrics and scoreboard

| Metric | Definition |
| --- | --- |
| Median first-review wait | For PRs with at least one review: first review time minus the earlier of first review request and creation, in hours |
| Stuck items resolved | Executed stuck proposals whose target no longer meets its rule in the next snapshot |
| Flags approved, skipped, snoozed | Counts for F11. Skips are reported as likely false positives |
| Standup minutes saved | Team size times `standup_minutes` times working days. Labeled an assumption and configurable |

The scoreboard compares the current week with the first week on record. Fixture-based numbers are labeled "seeded". The scoreboard makes no claim that delays were prevented.

## 14. Non-functional requirements and security

- **Determinism.** The same snapshot, rules, state and `--now` always produce the same output.
- **Performance.** `analyze` runs in under 1 s on 100 PRs. Collection is bounded to 100 PRs and 100 issues.
- **Least privilege.** A fine-grained token limited to one repo. Read access for contents, metadata, pull requests and issues, plus write access only for pull request and issue comments and review requests. Only Clerk's `execute` writes.
- **Secrets.** Tokens come from the environment or `gh auth`. `.env` is git-ignored and `.env.example` is committed. Logs never print tokens.
- **Privacy.** Only repo metadata and public comments are read. No source code is sent anywhere by the toolkit.
- **Portability.** Python 3.11+. Use `zoneinfo`, with a fixed +05:30 fallback for Asia/Kolkata if time-zone data is missing.

## 15. Edge cases

| Situation | Behavior |
| --- | --- |
| GitHub rate limit or auth failure | Exit 4, no partial proposals, agent posts one short error |
| No PRs or issues | Brief says no activity, `analyze` returns zero proposals with a message |
| Reviewer is also the author | Excluded from eligible reviewers |
| Dependency target closed, merged or in another repo | No dependency signal |
| Snoozed item | Reappears after `snooze_until` |
| Unknown proposal index | Exit 2 with the valid range |
| Approver not allowed | Exit 3, nothing changes |
| Execute during quiet hours | Exit 3, proposals stay approved |
| One action fails | That action is marked failed, others continue, the result lists both |
| Team member missing from `rules.team` | Included by GitHub login |

## 16. Fixture scenarios and test plan

Fixture `now` is **Tue 2026-11-10 04:00Z (09:30 IST)**. Offsets are relative to it. Commits in the last 24h: priya 3, arjun 2, sam 1.

| Item | Setup | Expected |
| --- | --- | --- |
| PR #41 | priya, merged 20h ago | Brief: merged |
| PR #42 | priya, open 40h, review requested from arjun 31h ago | Proposal 2, `review_stuck`, over 7h |
| PR #44 | priya, draft | Excluded everywhere |
| PR #48 | priya, open, reviewer meera requested 6h ago | Not flagged, dependency target of #52 |
| PR #45 | meera, open 20h, reviewer arjun requested 10h ago, check `tests` failed 14h ago | Proposal 4, `ci_red`, over 2h |
| PR #39 | arjun, open 50h, approved by meera 26h ago, decision APPROVED | Proposal 3, `approved_unmerged`, over 2h |
| PR #46 | lead, open 2h, reviewer meera requested 2h ago, green | Not flagged |
| PR #47, #49, #50 | sam, open 30h, 28h, 26h, reviewers arjun, meera, arjun requested 3h ago, green | Watch (workload only), no proposals |
| PR #52 | sam, open 5h, no reviewers, body "Payments integration. Depends on #48.", green | Proposal 5, High, 65 points, `request_review` meera and a comment on #48 |
| PR #53 | meera, open 1h, no reviewers | Not flagged (grace period) |
| PR #54 | lead, open 6h, reviewer arjun requested 6h ago, green | Not flagged |
| PR #55 | lead, draft, open 8h, no reviewers | Excluded |
| Issue #30 | assigned to sam, updated 96h ago | Proposal 1, `stale_issue`, over 24h |
| Issue #31 | assigned to arjun, updated 10h ago | Not flagged |

Brief expectations: priya shows merged #41 and her open work, arjun and sam show their commits and open items, lead shows #46, #54 and draft #55, and meera shows "No activity found".

**Automated tests (at least 30):** time and rules (quiet hours, Friday cutoff, `since auto` on a Monday, time-zone fallback, rule validation, settable-key allowlist); each stuck rule positive and negative; early warning (each signal, grace period, draft exclusion, dependency phrasing variants, closed or cross-repo targets, tiers and points, reviewer tie-break); proposals (ranking, tie-break, caps, deterministic ids, snooze, nudge budget, carry-over); execution (dry run, refusing unapproved, idempotence, marker check, partial failure, quiet hours); brief (every item has a URL, no-activity message, window, grouping); metrics (median, minutes saved).

## 17. Repository structure and setup

```
daybreak/
  README.md  pyproject.toml  Makefile  .env.example  .gitignore
  daybreak/  cli.py config.py ghclient.py collect.py brief.py analyze.py
             stuck.py early_warning.py proposals.py decide.py execute.py
             ledger.py metrics.py timeutil.py models.py
  agents/    scribe.md  sentinel.md  clerk.md
  switch/    room-template.yaml  NOTES.md
  fixtures/  snapshot_tuesday.json  rules.default.json
  scripts/   setup.sh  trigger_brief.sh  seed_live_demo.sh
  tests/     test_*.py
  docs/      PRD.md  ARCHITECTURE.md  DEMO.md
  .github/workflows/daily-trigger.yml   (optional)
```

Setup: `make setup` (checks Python, `gh auth status`, Docker, Switch Console, creates `state/`), `make test`, `make demo`. Environment: `DAYBREAK_REPO`, `MATTERMOST_WEBHOOK_URL`, `DAYBREAK_ALLOW_WRITE=1` (enables writes). `seed_live_demo.sh` opens one real PR with a dependency note on a throwaway repo for the live write-path demo. `switch/room-template.yaml` is written against the real Switch schema from the docs, with unknowns marked `TODO(verify)`.

## 18. Milestones

| Milestone | Hours | Exit criteria |
| --- | --- | --- |
| M0 Setup and verify Switch unknowns | 0:00 to 0:45 | Hello room works, an agent replies in the thread |
| M1 Toolkit core: models, fixtures, collect, brief | 0:45 to 2:00 | `brief` on fixtures matches expectations, tests pass |
| M2 Scribe in the room | 2:00 to 3:30 | Brief posts in Mattermost, thread edit works |
| M3 Stuck rules, proposals, Sentinel | 3:30 to 5:30 | Level 1 shippable. Record a backup demo now |
| M4 Decisions, execute, Clerk | 5:30 to 7:00 | Level 2: approve then a real GitHub comment, exactly once |
| M5 Rules in the Room, quiet hours, budgets | 7:00 to 7:45 | A chat rule change changes the next run |
| M6 Early warning | 7:45 to 9:00 | Fixture PR #52 is High, all negatives hold |
| M7 Scheduler and scoreboard | 9:00 to 10:00 | Trigger script posts, scoreboard renders |
| M8 README, setup, demo, submit | 10:00 to 11:30 | Fresh-clone test passes, video recorded |

If time runs short, cut in this order: scoreboard, scheduler (trigger by hand), early warning, execute write-back (show approved drafts). Never cut the evidence rule or the approval gate.

## 19. Demo and submission

Demo (about 3 minutes): problem; trigger the brief; edit a section; stuck-item proposals, approve two, snooze one; early warning on PR #52 and a real review request appearing on GitHub; change a rule in chat and show the next run obeying it; scoreboard; why Switch. State on screen that analysis scenarios use seeded fixtures and the write path is live.

Submission checklist: public repo, README with one-command setup and architecture diagram, demo video, `.env.example`, fixtures and seed script, room template and agent instruction files, a note naming which parts use Switch. Optional: blog post, #HowISwitch post, Wispr scorecard, star the Switch repo.

## 20. Risks, assumptions and open questions

| ID | Assumption or risk | Fallback |
| --- | --- | --- |
| A1 | I could not read the Switch template schema or examples folder | Use the docs MCP, mark unknowns `TODO(verify)`, keep config minimal |
| A2 | Webhook posts and thread replies reach agents | A human types "brief"; decisions by typed reply only |
| A3 | Two agent providers run side by side on your machine and subscriptions | Run all three roles on one provider and say so |
| A4 | Agents obey the command allowlist (it is instruction-level, not a sandbox) | Toolkit enforces approval, ledger and write flag itself |
| A5 | Chat usernames match GitHub logins | `rules.team` mapping |
| A6 | `gh` JSON shapes (checks, review requests) vary | Defensive parsing and a captured sample in tests |
| R1 | Early-warning false positives or over-claiming | Tiers with evidence, grace period, skips counted, README says untested heuristics |
| R2 | Out of time | Cut order in section 18 and an early backup video |
| R3 | Fixtures look fake | Say so on screen, and prove the live write path with one real PR |
