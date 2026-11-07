# Daybreak Demo Guide

This document provides the exact end-to-end script for demonstrating Daybreak, both using the self-contained fixture scenarios and a live GitHub repository.

---

## Part 1: Fast Fixture Demo (3 Minutes)

Run the completely offline fixture pipeline with one command:
```bash
make demo
```
This runs the full lifecycle on deterministic data (`fixtures/snapshot_tuesday.json`) without network calls or external writes.

### Step-by-Step Interactive Chat Script

When running inside the Switch chat room (or simulating agent turns):

#### 1. Daily Standup Brief (Scribe)
- **Human / Scheduler**: types `brief` in `#daybreak`.
- **Scribe responds**:
  ```text
  Understood: brief
  Daybreak brief · Tue 10 Nov · last 24h

  @arjun
  Yesterday: commit abc004 https://github.com/acme/shop/commit/abc004; commit abc005 https://github.com/acme/shop/commit/abc005
  Today (open work): PR #39 https://github.com/acme/shop/pull/39; Issue #31 https://github.com/acme/shop/issues/31

  @lead
  No activity found in the last 24h.
  Opened: #46 https://github.com/acme/shop/pull/46; #54 https://github.com/acme/shop/pull/54
  Today (open work): PR #46 https://github.com/acme/shop/pull/46; PR #54 https://github.com/acme/shop/pull/54

  @meera
  No activity found in the last 24h.
  Opened: #45 https://github.com/acme/shop/pull/45; #53 https://github.com/acme/shop/pull/53
  Today (open work): PR #45 https://github.com/acme/shop/pull/45; PR #53 https://github.com/acme/shop/pull/53

  @priya
  Yesterday: merged #41 Add token refresh https://github.com/acme/shop/pull/41; commit abc001 https://github.com/acme/shop/commit/abc001; commit abc002 https://github.com/acme/shop/commit/abc002; commit abc003 https://github.com/acme/shop/commit/abc003
  Opened: #48 https://github.com/acme/shop/pull/48
  Today (open work): PR #42 https://github.com/acme/shop/pull/42; PR #48 https://github.com/acme/shop/pull/48

  @sam
  Yesterday: commit abc006 https://github.com/acme/shop/commit/abc006
  Opened: #52 https://github.com/acme/shop/pull/52
  Today (open work): PR #47 https://github.com/acme/shop/pull/47; PR #49 https://github.com/acme/shop/pull/49; PR #50 https://github.com/acme/shop/pull/50; PR #52 https://github.com/acme/shop/pull/52; Issue #30 https://github.com/acme/shop/issues/30

  Heads-up: proposals are in the thread below.
  Reply in this thread to edit your own section.
  ```

#### 2. Proposals Thread (Sentinel)
- **Sentinel posts in the thread**:
  ```text
  Stuck items (4)
  1. Issue #30 stale, 96h since update (limit 72h), assigned @sam https://github.com/acme/shop/issues/30
     - Issue #30 stale, 96h since update (limit 72h), assigned @sam https://github.com/acme/shop/issues/30
     Action: comment on #30: Hi @sam, Issue #30 stale, 96h since update (limit 72h), assigned @sam. Could you share an update when convenient? https://github.com/acme/shop/issues/30 https://github.com/acme/shop/issues/30
  2. PR #42 waiting 31h for @arjun (SLA 24h) https://github.com/acme/shop/pull/42
     - PR #42 waiting 31h for @arjun (SLA 24h) https://github.com/acme/shop/pull/42
     Action: comment on #42: Hi @arjun, PR #42 waiting 31h for @arjun (SLA 24h). Could you share an update when convenient? https://github.com/acme/shop/pull/42 https://github.com/acme/shop/pull/42
  3. PR #39 approved 26h ago, not merged (limit 24h) https://github.com/acme/shop/pull/39
     - PR #39 approved 26h ago, not merged (limit 24h) https://github.com/acme/shop/pull/39
     Action: comment on #39: Hi @arjun, PR #39 approved 26h ago, not merged (limit 24h). Could you share an update when convenient? https://github.com/acme/shop/pull/39 https://github.com/acme/shop/pull/39
  4. PR #45 CI red for 14h (limit 12h) https://github.com/acme/shop/pull/45
     - PR #45 CI red for 14h (limit 12h) https://github.com/acme/shop/pull/45
     Action: comment on #45: Hi @meera, PR #45 CI red for 14h (limit 12h). Could you share an update when convenient? https://github.com/acme/shop/pull/45 https://github.com/acme/shop/pull/45

  Early warning (1)
  5. PR #52 HIGH flag (3 signals, 65 points) https://github.com/acme/shop/pull/52
     - No reviewer requested, open 5h https://github.com/acme/shop/pull/52
     - Author has 3 other open PRs; includes #47 https://github.com/acme/shop/pull/47
     - Author has 3 other open PRs; includes #49 https://github.com/acme/shop/pull/49
     - Author has 3 other open PRs; includes #50 https://github.com/acme/shop/pull/50
     - Depends on #48, still open https://github.com/acme/shop/pull/48
     Action: request review from @meera https://github.com/acme/shop/pull/52
     Action: comment on #48: Hi @priya, PR #52 depends on this item. Could you share an ETA? https://github.com/acme/shop/pull/52 https://github.com/acme/shop/pull/48 https://github.com/acme/shop/pull/48

  Watching: PR #47 WATCH flag (1 signals, 20 points) https://github.com/acme/shop/pull/47
  Watching: PR #49 WATCH flag (1 signals, 20 points) https://github.com/acme/shop/pull/49
  Watching: PR #50 WATCH flag (1 signals, 20 points) https://github.com/acme/shop/pull/50
  Reply: approve 1 | skip 1 | snooze 1 2d
  ```

#### 3. Human Decisions (Clerk)
- **Human**: `approve 2 5`
- **Clerk responds**:
  ```text
  Understood: approve 2 5
  approve: 2, 5 by @lead
  Dry run — no GitHub action performed.
  Results:
  - nudge-review-pr42-2026-11-10: dry_run
  - warn-pr52-2026-11-10: dry_run
  ```
- **Human**: `snooze 3 2d`
- **Clerk responds**:
  ```text
  Understood: snooze 3 2d
  snooze: 3 by @lead until 2026-11-12T04:00:00Z
  ```

#### 4. Rule Changes in Chat (Sentinel)
- **Human**: `set quiet_hours.friday_cutoff 16:00`
- **Sentinel responds**:
  ```text
  Understood: set quiet_hours.friday_cutoff 16:00
  Rule quiet_hours.friday_cutoff: "17:00" → "16:00" by @lead
  ```

#### 5. Weekly Scoreboard (Sentinel)
- **Human**: `scoreboard`
- **Sentinel responds**:
  ```text
  Daybreak weekly scoreboard · seeded fixtures
  Current week 2026-11-09: median first-review wait 24.0h; stuck resolved 0 (unknown 0); flags approved 1, skipped 0 (likely false positives), snoozed 0; standup minutes saved 75 (assumption).
  Baseline week 2026-11-09: median first-review wait 24.0h; stuck resolved 0 (unknown 0); flags approved 1, skipped 0 (likely false positives), snoozed 0; standup minutes saved 75 (assumption).
  Configured team size × standup_minutes × observed working days
  ```

---

## Part 2: Live GitHub Scenario Walkthrough

Real PRs cannot be back-dated. To demonstrate the real write path against GitHub without waiting 24 hours:

### 1. Seed the Live Scenario
Provide a throwaway repository:
```bash
export DAYBREAK_REPO="your-username/throwaway-repo"
python scripts/seed_live_demo.py --repo $DAYBREAK_REPO
```
This automatically creates:
- **PR A**: Base dependency target.
- **PR B**: Depends on `#A`, zero reviewers requested.
- **PR C**: Workload filler PR by the same account.

### 2. Lower Detection Thresholds
Temporarily adjust the thresholds for the demo session:
```bash
python -m daybreak rules set early_warning.grace_hours 0 --by lead
python -m daybreak rules set early_warning.workload_open_prs 2 --by lead
# Cap to 1 warning proposal so only PR B (High) is proposed:
python -m daybreak rules set limits.max_warning_proposals 1 --by lead
```

> [!NOTE]
> **Why cap to 1 warning proposal?**
> Because PR A, PR B, and PR C are all authored by the same account and have zero reviewers requested, both PR A and PR C qualify as `At risk` (2 signals: `no_reviewer` + `workload`, 40 points). Setting `limits.max_warning_proposals 1` cleanly limits the proposal batch to the single highest-priority item (PR B, High, 65 points), while PR A and PR C are reported under `suppressed_by_cap`.

### 3. Collect and Analyze
```bash
python -m daybreak collect --source github
python -m daybreak brief
python -m daybreak analyze
```
**ACTUAL Expected Output**:
```text
Early warning (1)
1. PR #B HIGH flag (3 signals, 65 points) https://github.com/.../pull/B
   - No reviewer requested, open ...h https://github.com/.../pull/B
   - Author has 2 other open PRs; includes #A https://github.com/.../pull/A
   - Author has 2 other open PRs; includes #C https://github.com/.../pull/C
   - Depends on #A, still open https://github.com/.../pull/A
   Action: request review from @collaborator https://github.com/.../pull/B
   Action: comment on #A: Hi @author, PR #B depends on this item. Could you share an ETA? https://github.com/.../pull/B https://github.com/.../pull/A

Reply: approve 1 | skip 1 | snooze 1 2d
```
*(Note on reviewers: if `rules.reviewers` has an eligible collaborator other than the author, a `request_review` action is created; if `rules.reviewers` has no eligible collaborator, only the comment on #A is generated with no crash).*

### 4. Approve and Execute
```bash
python -m daybreak decide approve 1 --by lead
```

Try executing:
```bash
python -m daybreak execute
```
> [!NOTE]
> **Quiet Hours Safety Demonstration**:
> If running outside business hours (e.g. at night or late Friday), Daybreak will safely block execution with:
> `Exit 3: Quiet hours: proposals remain approved`
> This demonstrates the safety gate preventing off-hours alerts.

To override quiet hours explicitly:
```bash
python -m daybreak execute --ignore-quiet-hours
```
> [!IMPORTANT]
> To execute live writes to GitHub, the environment variable `DAYBREAK_ALLOW_WRITE=1` must be set. The toolkit will output the live comment URL and reviewer request link upon completion.
