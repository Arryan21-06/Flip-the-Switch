# Daybreak Cockpit — Technical Architecture & Implementation Notes

## 1. Overview

**Daybreak Cockpit** is a premium, strictly **read-only** companion dashboard for the Daybreak hackathon project. It provides team leads and engineers with real-time visibility into Standup Zero morning briefs, SLA stuck items, proactive early-warning risk tiers, active rulebooks, immutable cryptographic audit trails, and weekly velocity metrics.

### Core Non-Negotiables & Guarantees
1. **Strictly Read-Only**: The dashboard never approves, executes, skips, snoozes, or alters rules. Any decision point provides a "Copy chat command" button (e.g., `approve 1 5`, `skip 2`, `snooze 3 2d`, `rules set KEY VALUE`) for the user to paste into the Switch shared room.
2. **Zero Write Endpoints**: The local Python API server (`web/server/server.py`) exposes GET-only routes and explicitly rejects POST/PUT/DELETE requests with `405 Method Not Allowed`.
3. **Local Bindings Only**: Binds strictly to `127.0.0.1:8765` with no public exposure.
4. **Honesty Rules**:
   - Seeded demo data is prominently watermarked with `"Seeded demo data"`.
   - Early warning signals are rendered as attention tiers (`Watch`, `At risk`, `High`) with point tallies, **never** as probabilities or percentages.
   - 100% evidence coverage: every brief item and proposal links directly to a verifiable GitHub URL.

---

## 2. React Bits & MCP Availability

Per project instructions, we attempted to query the React Bits catalog:
- **MCP Server Status**: The `reactbits` MCP server (`npx reactbits-dev-mcp-server`) was not registered in the agent's MCP environment (only `tinyfish` was active).
- **Fallback Implementation**: As instructed, self-contained, dependency-free React Bits components were implemented in `web/src/components/reactbits/`:
  - `SpotlightCard.tsx`: Dynamic radial spotlight glow tracking mouse coordinates.
  - `CountUp.tsx`: High-performance numerical roll animation using `requestAnimationFrame` with easeOut curves.
  - `AnimatedList.tsx`: Staggered list item entrance using Framer Motion.
  - `ShinyText.tsx`: Subtle gradient shimmering text for badges and titles.
  - `DockNav.tsx`: Floating glassmorphic dock navigation bar at the bottom center with responsive icon pills.
  - `AuroraBackground.tsx`: Subtle ambient sunrise aurora blur respecting `prefers-reduced-motion`.
  - `Magnet.tsx`: Gentle magnetic pull effect on interactive buttons.

---

## 3. Data Layer Architecture (`src/data/source.ts`)

Daybreak Cockpit operates in two interchangeable modes behind a single unified interface:

1. **Demo Mode (Default)**:
   - Bundles static fixture data directly into the client bundle (`web/src/data/mockData.ts`).
   - Enables deploying or running the cockpit as a 100% static site without any backend dependencies.
2. **Live Mode**:
   - Auto-detected when the local Python read-only API server responds at `http://127.0.0.1:8765/api/health`.
   - Polls every 10 seconds with pause/resume controls and a visible "Updated Xs ago" indicator.
   - Reads directly from `state/` files or shells out to read-only `daybreak <cmd> --json` commands.

---

## 4. Route & View Inventory

| Route | View Component | Description |
| :--- | :--- | :--- |
| `/` | `MissionControl.tsx` | Hero stats, "Needs a human" decision queue, today at a glance pipeline flow. |
| `/brief` | `MorningBrief.tsx` | Scribe morning standup brief with 100% evidence links and Markdown export. |
| `/proposals` | `ProposalsBoard.tsx` | Two lanes (Stuck SLA vs Early Warning), expandable drafted comments, copy buttons. |
| `/early-warning` | `EarlyWarning.tsx` | 3 observable risk signals breakdown, tier ladder (Watch/At risk/High), watch list. |
| `/rules` | `RulesView.tsx` | Active rulebook, 24-hour visual quiet-hours timeline, copyable `rules set` commands. |
| `/audit` | `AuditTrail.tsx` | SHA-256 action digest inspector, idempotency marker explainer, JSON export. |
| `/scoreboard` | `Scoreboard.tsx` | Weekly engineering velocity KPIs, transparent standup minutes saved math. |
| `/simulator` | `SwitchSimulator.tsx` | Interactive simulation of the Switch #daybreak channel and multi-agent reactions. |
| `/architecture`| `HowItWorks.tsx` | Interactive multi-agent architecture map and daily pipeline phase walkthrough. |
| `/health` | `SystemHealth.tsx` | Live diagnostic checklist from `daybreak doctor` with remediation guides. |

---

## 5. Verification Status

- **Verified by Tests**:
  - `make test`: All 87 Python toolkit pytest tests pass without regression.
  - `make web-test`: 10 Vitest tests pass covering command generators, dataset invariants, evidence URLs, and SHA-256 digests.
- **Verified by Dry Run**:
  - `make web-build`: Production Vite bundle builds cleanly in under 1 second with zero external font CDNs (Geist & Geist Mono bundled via `@fontsource`).
  - `web/server/server.py`: Verified with curl and urllib; `/api/health` returns 200, POST requests return 405.
- **Unverified**:
  - Switch Console GUI (cannot be operated autonomously; manual verification checklist in `docs/SWITCH_SETUP.md`).

