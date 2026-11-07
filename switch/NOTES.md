# Switch Integration Notes

## Schema Reference

Template written against the Switch `version: 1` template YAML schema,
as documented in the official `triage-pair.template.yaml` example from the
Switch repository.

## Verified

These elements match the documented schema and known behavior:

- **version: 1** — the current template schema version.
- **params block** — `type: string`, `type: provider`, `type: location`,
  `type: directory`, `type: bridge` with `default:` and `input: advanced`.
- **agents block** — `name`, `description`, `addressing`, `provider`,
  `location`, `directory`, `instructions` (inline string).
- **rooms block** — `name`, `description`, `bridge`, `agents` (list of
  agent name references), `instructions`.
- **addressing: anyone** — any room member can trigger the agent.
- **provider defaults** — `[claude]` for Scribe/Clerk, `[codex, opencode, claude]`
  for Sentinel; Switch picks the first installed.
- **bridge: [$first]** — uses the server's default configured bridge (Mattermost).
- **Mattermost thread replies** reach agents when the agent is in the room
  and is addressed or when the channel has auto-reply configured.

## Unverified (TODO items)

- **TODO(verify)**: Whether `instructions:` can reference a file path
  (e.g., `instructions_file: agents/scribe.md`) instead of inline text.
  Current approach: inline placeholder with a note to paste from the .md file.

- **TODO(verify)**: Whether a shared `directory:` value across all three agents
  correctly gives them the same working directory (and thus the same `state/`).
  The default `{$agents_dir}/{agent}` creates per-agent directories. For
  Daybreak, all three agents MUST share one repo checkout and one `state/` dir.
  **Workaround**: set the `directory` param to the repo root explicitly when
  creating the room (e.g., `/Users/you/Flip-the-Switch`).

- **TODO(verify)**: Whether incoming Mattermost webhook posts (`/hooks/xxx`)
  trigger agents in the room, or if an opt-in property (`"props": {"activate_ai": true}`)
  is needed. The trigger_brief.py script may need to add this property.

- **TODO(verify)**: Whether `addressing: owner-agents` would be more appropriate
  for Clerk (only Sentinel should hand off to it), but using `anyone` for now
  so humans can also directly approve/skip/snooze.

- **TODO(verify)**: The exact mechanism for one agent to address another
  (e.g., Scribe addressing Sentinel). Assumed: `@{team}-sentinel` mention
  in the thread text.

## Fallback Levels

1. **Level 3 (full)**: Three separate agents, each with its own provider and
   instruction file, all in one room.
2. **Level 2 (single agent)**: One agent (Claude Code) playing all three roles,
   with all three instruction files concatenated. The instructions already
   have role-specific command allowlists.
3. **Level 1 (manual CLI)**: No Switch room. A human runs the toolkit commands
   directly in a terminal: `python -m daybreak collect`, `brief`, `analyze`,
   `decide approve ...`, `execute`.
