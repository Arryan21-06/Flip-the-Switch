# Daybreak — Flip the Switch Hackathon Submission

## Project Description

Daybreak is a standup-zero workflow automation system built for engineering teams. It replaces daily status theatre with an evidence-linked morning brief, surfaces rotting work across pull requests and issues, and flags stalling PRs early using transparent heuristic signals. Following the core architectural principle "code decides, agents explain", all detection, scoring, ranking, quiet hours gating, and idempotency logic runs in deterministic, zero-dependency Python. Three specialized AI agents (Scribe, Sentinel, Clerk) collaborate within a shared Switch chat room to present daily updates, discuss proposals, and accept human decisions. Crucially, zero outbound actions occur without explicit human approval, binding immutable SHA-256 action digests to verified approver identities for safe, exactly-once GitHub execution.

## Hackathon Track
- **Track 1**: Best Business Workflow

## Tech Stack
- **Multi-Agent Orchestration**: Switch Agents (`switchagents.ai`)
- **Chat Surface**: Mattermost (bundled with Switch)
- **Agent Models**: Claude Code (Scribe, Clerk), Codex / OpenCode (Sentinel)
- **Core Engine**: Python 3.11+ (Standard Library only, zero external runtime dependencies)
- **Companion Dashboard**: Daybreak Cockpit (Vite, React 18, TypeScript, Tailwind CSS, strictly read-only companion UI)
- **Upstream Data & Actions**: GitHub via `gh` CLI and deterministic offline JSON fixtures
- **Testing**: pytest (87 automated hermetic tests) + Vitest (10 web unit tests)

## How Switch is Used

- **Shared Room Collaboration**: Switch provides the unified multi-agent chat room (`switch/room-template.yaml`) where Scribe, Sentinel, and Clerk collaborate in threaded conversations alongside engineering leads and developers.
- **Role-Gated Command Handoffs**: Switch hosts specialized agent roles with strict instruction boundaries (`agents/*.md`). Scribe generates the daily brief, Sentinel posts evidence-linked proposals, and Clerk executes human-approved decisions.
- **Integration Level Achieved**: Level 2 (single-agent multi-role execution via the standard toolkit wrapper) and Level 1 (CLI toolkit) are verified and backed by 87 hermetic tests. Declarative template (`switch/room-template.yaml`) is packaged and ready for multi-agent Level 3 execution in the Switch Console.

## Submission Links

- **Repository**: [https://github.com/Arryan21-06/Flip-the-Switch](https://github.com/Arryan21-06/Flip-the-Switch)
- **Live Companion Dashboard (Vercel)**: [https://web-tan-sigma-02y10rnhyp.vercel.app](https://web-tan-sigma-02y10rnhyp.vercel.app)
- **Demo Video & Pitch Presentation**: [Canva Presentation](https://www.canva.com/design/DAHaQhGuVdg/ltR4r17IBqVGrkPweHrGpw/view) (Editor: [https://www.canva.com/design/DAHaQhGuVdg/ltR4r17IBqVGrkPweHrGpw/edit?ui=e30](https://www.canva.com/design/DAHaQhGuVdg/ltR4r17IBqVGrkPweHrGpw/edit?ui=e30))
- **Editorial Blog (Live)**: [https://daybreak-blog.vercel.app](https://daybreak-blog.vercel.app) (source: [`blog/`](../blog/))
