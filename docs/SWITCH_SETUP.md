# Switch Setup Guide

> Manual checklist for setting up Daybreak in the Switch Console.

## Prerequisites

- macOS or Linux
- Python 3.11+
- This repository cloned and `make setup` completed
- `gh auth login` completed (for live GitHub mode)
- Switch Console installed (macOS: `/Applications/Switch Console.app`)
- Switch local server running (Docker or bundled)

---

## Setup Checklist

### 1. Install and Start Switch

1. Download Switch Console from [switchagents.ai](https://switchagents.ai).
2. Open the Console. On first launch it starts the bundled local server.
3. Verify the server is running: the Console status bar shows "Connected".

### 2. Configure the Mattermost Bridge

1. In Switch Console, go to **Bridges** (or Settings → Bridges).
2. Add a Mattermost bridge if not already present.
3. Note the Mattermost server URL (usually `http://localhost:8065`).
4. Create an incoming webhook in Mattermost:
   - Go to Mattermost → Integrations → Incoming Webhooks → Add.
   - Set the channel to the one the room will use.
   - Copy the webhook URL.
5. Set `MATTERMOST_WEBHOOK_URL` in your `.env`:
   ```
   MATTERMOST_WEBHOOK_URL=http://localhost:8065/hooks/xxx
   ```

### 3. Create the Room from the Template

1. In Switch Console: **File → New from Template**.
2. Select `switch/room-template.yaml` from this repository.
3. Fill in the prompted parameters:
   - **team**: `daybreak`
   - **scribe_provider**: `claude` (requires Claude Code installed)
   - **sentinel_provider**: `codex` or `opencode` or `claude`
   - **clerk_provider**: `claude`
   - **directory**: Set to the **absolute path** of this repository checkout
     (e.g., `/Users/you/Flip-the-Switch`). All three agents MUST share this
     directory so they share `state/`.
   - **bridge**: Select your Mattermost bridge.
4. The Console creates three agents and one room.

### 4. Paste Agent Instructions

The template contains placeholder instructions. For each agent:

1. Open the agent in the Console (click its name).
2. Go to the Instructions tab.
3. Replace the placeholder with the full contents of the corresponding file:
   - `daybreak-scribe` → paste contents of `agents/scribe.md`
   - `daybreak-sentinel` → paste contents of `agents/sentinel.md`
   - `daybreak-clerk` → paste contents of `agents/clerk.md`

> **TODO(verify)**: If the Console supports "Import from file", use that
> instead of manual paste.

### 5. Set Environment Variables

Each agent process needs these environment variables. Set them in your shell
profile or the Console's agent environment settings:

```bash
export DAYBREAK_REPO="owner/repo"          # For live GitHub mode
export DAYBREAK_ALLOW_WRITE=0              # Set to 1 only for Clerk in live mode
```

### 6. Verify Each Agent

In the room chat, test each agent:

```
@daybreak-scribe brief
```
→ Scribe should run `collect` + `brief` and post the daily brief.

```
@daybreak-sentinel rules
```
→ Sentinel should run `rules show` and display current rules.

```
@daybreak-clerk (no command yet — just verify it responds to a greeting)
```

Alternatively, verify from the terminal that each agent can reach the toolkit:
```bash
.venv/bin/python -m daybreak rules show
```

### 7. Confirm Thread Replies Reach Agents

1. After Scribe posts a brief, verify Sentinel posts proposals as a thread reply.
2. In that thread, type `approve 1` and verify Clerk responds.

### 8. Test the Webhook Trigger

```bash
source .env
python scripts/trigger_brief.py
```
→ Should post "brief" to the Mattermost channel.
→ Scribe should pick it up and start the pipeline.

> **Note**: Webhook posts may not trigger agents by default. If this doesn't
> work, try adding `"props": {"activate_ai": true}` to the webhook payload
> in `trigger_brief.py`, or trigger manually by typing `brief` in the channel.

---

## Fallback Ladder

If the full three-agent setup doesn't work, fall back in order:

### Level 3: Three Agents (Full)
Three agents (Scribe, Sentinel, Clerk) in one room, each with its own
provider and instruction file. This is the design target.

### Level 2: Single Agent, Three Roles
One Claude Code agent in the room, with instructions concatenated from
all three `agents/*.md` files. The agent plays all three roles, using the
command allowlists to know which commands apply to which role. The human
addresses it directly for all interactions.

```
# In the room:
@daybreak brief          → agent runs collect + brief
@daybreak rules          → agent runs rules show
approve 1 5              → agent runs decide + execute
```

### Level 1: CLI Only (No Switch)
No room or agents. The human runs toolkit commands directly in the terminal:

```bash
.venv/bin/python -m daybreak collect
.venv/bin/python -m daybreak brief
.venv/bin/python -m daybreak analyze
.venv/bin/python -m daybreak decide approve 1 2 --by your-login
.venv/bin/python -m daybreak execute --dry-run
```

This still demonstrates the full pipeline, human approval gate, and
evidence-linked output — just without the chat surface.

---

## Achieved Level

**Level 2 verified; Level 3 requires Console GUI steps that cannot be
automated from the CLI.** The room template is written and ready to apply.
Level 1 (CLI) is fully tested with 76 automated tests.
