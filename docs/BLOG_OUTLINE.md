# Building Daybreak with Switch: Autonomous Standups and Safe GitHub Nudges

> Blog Post Outline (~400 words)

---

### Hook: The Daily Engineering Friction
Every morning, software development teams waste valuable engineering time on status theatre: recounting what was worked on yesterday, even though Git commits, PRs, and issues already hold the exact ground truth. Simultaneously, high-priority work rots unnoticed in repositories: review requests sit unanswered, CI builds remain broken, and approved pull requests linger unmerged because engineers hesitate to act as persistent human nags.

### The Vision: Standup Zero with Early Warning
Daybreak was conceived during the **Flip the Switch Hackathon** to eliminate this daily friction. Rather than forcing developers to manually type status updates or build complex multi-repo dashboards, Daybreak turns GitHub activity into an evidence-linked morning brief and a short list of actionable, human-approved nudges right inside the team's existing chat.

### The Breakthrough Architecture: "Code Decides, Agents Explain"
Autonomous coding agents excel at conversation, explanation, and synthesis, but delegating unconstrained execution or scoring to LLMs risks hallucinations, missed SLAs, and runaway alert storms. 

Daybreak resolves this with a strict architectural boundary:
1. **Deterministic Python Core**: All PR scraping, quiet-hours evaluation, heuristic scoring, proposal deduplication, and rate-limiting live in a zero-dependency Python library.
2. **Cryptographic Safety**: Every approved action binds an immutable SHA-256 digest to the approver's identity, preventing altered action text.
3. **Idempotent Execution**: Hidden HTML markers (`<!-- daybreak:PROPOSAL_ID -->`) and write-ahead intent logs prevent duplicate notifications.

### How Switch Powered the Workflow
Switch provided the collaborative multi-agent backbone that brought Daybreak into the team's daily workspace:
- **Declarative Room Templates**: Using Switch's `version: 1` template schema, Daybreak provisions three coordinated agents—**Scribe** (Claude Code), **Sentinel** (Codex), and **Clerk** (Claude Code)—inside a single collaborative chat room.
- **Threaded Delegation**: Scribe presents the daily brief and hands off to Sentinel in the thread to post ranked proposals. Humans reply directly with approvals (`approve 1 2`) or snoozes (`snooze 3 2d`), which Clerk picks up to execute live actions.
- **Cross-Platform Bridge**: Switch’s built-in Mattermost bridge allowed seamless integration between terminal coding agents and human team chat without requiring custom webhook infrastructure.

### The Result
With Daybreak and Switch, daily standup status takes zero human minutes to draft, stuck work is surfaced politely with zero nag fatigue, and human leads remain securely in the loop for every outbound team action.
