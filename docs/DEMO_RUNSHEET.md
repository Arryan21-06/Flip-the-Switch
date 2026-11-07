# Daybreak Demo Recording Runsheet (3 Minutes)

> One-page copy-paste recording script for the demo video.
> Total Target Duration: ~3:00.

---

## Segment 1: In-Room Fixture Demo (Duration: ~1:45)

**Setup before recording**:
Run in terminal: `make demo-room` (prepares `state-demo/` with Tuesday fixtures).

### Step 1.1: Trigger Brief (0:00 - 0:25)
- **Type in `#daybreak`**:
  ```text
  brief
  ```
- **Expected Scribe output**:
  Standup Zero brief with 5 members (`@arjun`, `@lead`, `@meera`, `@priya`, `@sam`).
  Priya shows merged #41 and open work. Meera shows "No activity found".
- *Recovery*: If Scribe does not respond within 5s, type: `@daybreak-scribe brief`.

### Step 1.2: Edit a Section (0:25 - 0:40)
- **Type in thread**:
  ```text
  Please remove PR #44 from my today section
  ```
- **Expected Scribe output**:
  Section updated; confirms drafts like #44 are excluded by evidence rules.

### Step 1.3: Proposals & Decisions (0:40 - 1:15)
- **Expected Sentinel output in thread**:
  - Stuck items (4): Issue #30 stale, PR #42 waiting on Arjun, PR #39 unmerged, PR #45 CI red.
  - Early warning (1): PR #52 HIGH (3 signals, 65 points).
  - Watching (3): PRs #47, #49, #50.
- **Type in thread**:
  ```text
  approve 2 5
  ```
- **Expected Clerk output**:
  Confirms approval for #42 and #52 (`dry_run`).
- **Type in thread**:
  ```text
  snooze 3 2d
  ```
- **Expected Clerk output**:
  Confirms PR #39 snoozed for 2 days.
- *Recovery*: If Clerk says "Unknown index", check the numbers in Sentinel's list and type `approve N`.

### Step 1.4: Rule Change & Scoreboard (1:15 - 1:45)
- **Type in thread**:
  ```text
  set quiet_hours.friday_cutoff 16:00
  ```
- **Expected Sentinel output**:
  `Rule quiet_hours.friday_cutoff: "17:00" → "16:00" by @lead`
- **Type in thread**:
  ```text
  scoreboard
  ```
- **Expected Sentinel output**:
  Weekly scoreboard comparing baseline to current week, showing median wait and assumed saved minutes.

---

## Segment 2: Live GitHub Write Path (Duration: ~1:15)

**Terminal Setup**:
```bash
export DAYBREAK_REPO="your-org/throwaway-repo"
export DAYBREAK_ALLOW_WRITE=1
export DAYBREAK_STATE_DIR="$(pwd)/state-live"
```

### Step 2.1: Seed Live Scenario (1:45 - 2:05)
```bash
python scripts/seed_live_demo.py --repo $DAYBREAK_REPO
```
Creates:
- PR A (Dependency target)
- PR B (Depends on #A, no reviewer)
- PR C (Workload filler)

### Step 2.2: Adjust Rules & Analyze (2:05 - 2:25)
```bash
python -m daybreak rules set early_warning.grace_hours 0 --by lead
python -m daybreak rules set early_warning.workload_open_prs 2 --by lead
python -m daybreak rules set limits.max_warning_proposals 1 --by lead
python -m daybreak collect --source github
python -m daybreak analyze
```
- **Expected Output**:
  `PR #B HIGH flag (3 signals, 65 points) [Depends on #A, no reviewer, author workload]`

### Step 2.3: Approve & Demonstrate Quiet Hours Safety (2:25 - 2:45)
```bash
python -m daybreak decide approve 1 --by lead
python -m daybreak execute
```
- **Expected Output (Quiet Hours Safety Demo)**:
  `Exit 3: Quiet hours: proposals remain approved`
  *(Explain: "Daybreak protects team downtime; execution is automatically gated during quiet hours.")*

### Step 2.4: Execute with Override & Show Proof (2:45 - 3:00)
```bash
python -m daybreak execute --ignore-quiet-hours
```
- **Expected Output**:
  Result URL printed pointing to the live GitHub comment.
- **On Screen**:
  Switch to the browser and refresh PR A on GitHub.
  Show the posted comment: `[Daybreak, approved by @lead] ... <!-- daybreak:warn-pr... -->`.
