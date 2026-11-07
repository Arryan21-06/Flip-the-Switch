import React, { useState } from 'react';
import {
  Network,
  Users,
  Shield,
  FileCode,
  Terminal,
  Lock,
  GitBranch,
} from 'lucide-react';
import { SpotlightCard } from '../components/reactbits/SpotlightCard';

export const HowItWorks: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string>('clerk');

  const nodesInfo: Record<string, { title: string; subtitle: string; description: string; invariant: string }> = {
    switch: {
      title: 'Switch Shared Room',
      subtitle: 'Human-in-the-loop collaborative workspace',
      description:
        'A single Switch room where human engineers and three autonomous AI agents interact. Standup briefs appear in the thread, proposals are reviewed collaboratively, and approvals are given via typed chat commands.',
      invariant: 'No automated action ever fires without a human typed command in this room.',
    },
    scribe: {
      title: 'Agent: Scribe',
      subtitle: 'Standup zero brief generator',
      description:
        'Scribe runs daily at standup time. It reads yesterday and today activity from the local repository snapshot and drafts an evidence-backed markdown brief. Every line links to a verifiable GitHub URL.',
      invariant: '100% evidence coverage: Scribe never invents, hallucinates, or estimates progress.',
    },
    sentinel: {
      title: 'Agent: Sentinel',
      subtitle: 'Heuristic & early-warning risk analyzer',
      description:
        'Sentinel scans open PRs and issues against team SLA thresholds (reviews > 24h, red CI > 12h, approved unmerged > 24h, stale issues > 3d) and calculates proactive early-warning risk tiers (Watch, At risk, High).',
      invariant: 'Deterministic heuristic weights only. Never claims to predict or guess probabilities.',
    },
    clerk: {
      title: 'Agent: Clerk',
      subtitle: 'Gatekeeper, ledger keeper & executor',
      description:
        'Clerk parses human approval commands (e.g. approve 1 5). It verifies the SHA-256 action digest against the proposal contents, checks quiet hours and daily nudge limits, logs write-ahead markers, executes authorized GitHub actions, and records the append-only local ledger outcome.',
      invariant: 'Action digest binding: actions executed must strictly match the SHA-256 digest approved by the human.',
    },
    toolkit: {
      title: 'Python Daybreak Toolkit',
      subtitle: 'Local deterministic CLI & state engine',
      description:
        'Zero-network-dependency Python package (~/.daybreak/bin/daybreak) shared across agents. Houses atomic file locking, timeutil timezone logic, rules enforcement, and markdown generators.',
      invariant: 'Process-isolated atomic file locking ensures multi-agent concurrency safety.',
    },
    ledger: {
      title: 'Atomic State Ledger',
      subtitle: 'state/ledger.json & proposals',
      description:
        'Local JSON state directory storing active proposals, human decisions, daily nudge budgets, and executed write outcomes with timestamped comment URLs.',
      invariant: 'Idempotency and remote recovery prevent duplicate comments across crashes or retries.',
    },
    github: {
      title: 'GitHub API & Webhooks',
      subtitle: 'Target code repository',
      description:
        'Daybreak interacts with GitHub strictly via gh CLI queries (read-only snapshot collection) and approved actions (posting polite nudges and requesting reviews).',
      invariant: 'DAYBREAK_ALLOW_WRITE=0 completely locks out all write operations by default.',
    },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-accent-amber mb-1">
            <Network className="h-3.5 w-3.5" />
            <span>STANDUP ZERO · ARCHITECTURE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            System Anatomy & How It Works
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Multi-agent coordination architecture with an ironclad human approval safety gate.
          </p>
        </div>
      </div>

      {/* Interactive System Anatomy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Architecture Diagram Nodes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl border border-border bg-surface-1 space-y-6">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Component Map (Click to inspect)
            </h2>

            {/* Room Container */}
            <div
              onClick={() => setActiveNode('switch')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                activeNode === 'switch'
                  ? 'border-accent-amber bg-surface-2/80 shadow-glow-amber'
                  : 'border-dashed border-border bg-surface-2/30 hover:border-border-strong'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent-amber" />
                  <span className="font-bold text-sm text-text-primary">
                    Switch Shared Room
                  </span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-3 text-text-muted">
                  Human + 3 Agents
                </span>
              </div>

              {/* 3 Agents */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveNode('scribe');
                  }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    activeNode === 'scribe'
                      ? 'border-accent-amber bg-surface-3'
                      : 'border-border bg-surface-1 hover:border-border-strong'
                  }`}
                >
                  <div className="font-bold text-xs text-text-primary">Scribe</div>
                  <div className="text-[11px] text-text-muted mt-0.5">Morning Brief</div>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveNode('sentinel');
                  }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    activeNode === 'sentinel'
                      ? 'border-accent-amber bg-surface-3'
                      : 'border-border bg-surface-1 hover:border-border-strong'
                  }`}
                >
                  <div className="font-bold text-xs text-text-primary">Sentinel</div>
                  <div className="text-[11px] text-text-muted mt-0.5">Risk & Heuristics</div>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveNode('clerk');
                  }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    activeNode === 'clerk'
                      ? 'border-accent-amber bg-surface-3'
                      : 'border-border bg-surface-1 hover:border-border-strong'
                  }`}
                >
                  <div className="font-bold text-xs text-text-primary">Clerk</div>
                  <div className="text-[11px] text-text-muted mt-0.5">Gatekeeper & Write</div>
                </button>
              </div>
            </div>

            {/* Human Decision Gate Boundary */}
            <div className="py-2 px-4 rounded-lg bg-accent-coral/10 border border-accent-coral/30 flex items-center justify-between text-xs text-accent-coral font-medium">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>MANDATORY HUMAN APPROVAL GATEWAY (Chat Commands Only)</span>
              </div>
              <span className="font-mono text-[10px]">Cockpit is Read-Only</span>
            </div>

            {/* Local Toolkit & State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setActiveNode('toolkit')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  activeNode === 'toolkit'
                    ? 'border-accent-amber bg-surface-2/80 shadow-glow-amber'
                    : 'border-border bg-surface-1 hover:border-border-strong'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-text-primary mb-1">
                  <Terminal className="h-4 w-4 text-accent-amber" />
                  <span>Python Toolkit Engine</span>
                </div>
                <div className="text-[11px] text-text-muted">
                  ~/.daybreak/bin/daybreak · Precedence ladder
                </div>
              </div>

              <div
                onClick={() => setActiveNode('ledger')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  activeNode === 'ledger'
                    ? 'border-accent-amber bg-surface-2/80 shadow-glow-amber'
                    : 'border-border bg-surface-1 hover:border-border-strong'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-text-primary mb-1">
                  <FileCode className="h-4 w-4 text-status-success" />
                  <span>State Directory & Ledger</span>
                </div>
                <div className="text-[11px] text-text-muted">
                  state/ledger.json · Atomic write-ahead lock
                </div>
              </div>
            </div>

            {/* Target Repo */}
            <div
              onClick={() => setActiveNode('github')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                activeNode === 'github'
                  ? 'border-accent-amber bg-surface-2/80 shadow-glow-amber'
                  : 'border-border bg-surface-1 hover:border-border-strong'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-text-primary">
                  <GitBranch className="h-4 w-4 text-text-secondary" />
                  <span>GitHub Repository</span>
                </div>
                <span className="text-[11px] font-mono text-text-muted">
                  gh CLI queries & comments
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Component Detail Card */}
        <SpotlightCard className="p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="pb-3 border-b border-border">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-accent-amber">
                Component Inspector
              </span>
              <h3 className="text-lg font-bold text-text-primary mt-1">
                {nodesInfo[activeNode].title}
              </h3>
              <p className="text-xs font-mono text-text-muted mt-0.5">
                {nodesInfo[activeNode].subtitle}
              </p>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-text-secondary">
              <p>{nodesInfo[activeNode].description}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-2/80 border border-border space-y-1.5 mt-4">
            <div className="text-[11px] font-bold text-text-primary flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-status-success" />
              <span>Core Safety Invariant</span>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed">
              {nodesInfo[activeNode].invariant}
            </p>
          </div>
        </SpotlightCard>
      </div>

      {/* Step-by-Step Pipeline Walkthrough */}
      <SpotlightCard className="p-6 space-y-6">
        <h2 className="text-base font-bold text-text-primary">
          Step-by-Step Daily Walkthrough
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-surface-2/50 border border-border space-y-2">
            <span className="font-mono text-xs font-bold text-accent-amber">Phase 1 · 09:30 IST (04:00 UTC)</span>
            <h3 className="font-bold text-text-primary">Collect Snapshot</h3>
            <p className="text-text-muted leading-relaxed">
              Daybreak collects a read-only repository snapshot via <code className="font-mono">gh</code>. Extracts PRs, issues, checks, and review activity.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-2/50 border border-border space-y-2">
            <span className="font-mono text-xs font-bold text-accent-amber">Phase 2 · Standup</span>
            <h3 className="font-bold text-text-primary">Draft Brief & Propose</h3>
            <p className="text-text-muted leading-relaxed">
              Scribe publishes the morning brief. Sentinel evaluates SLA timeouts and early-warning scores, queuing proposal cards.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-2/50 border border-border space-y-2">
            <span className="font-mono text-xs font-bold text-accent-coral">Phase 3 · Human Gate</span>
            <h3 className="font-bold text-text-primary">Human Decisions</h3>
            <p className="text-text-muted leading-relaxed">
              Engineers review proposals in the room and issue typed chat commands like <code className="font-mono">approve 1 2</code> or <code className="font-mono">skip 3</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-2/50 border border-border space-y-2">
            <span className="font-mono text-xs font-bold text-status-success">Phase 4 · Safe Execution</span>
            <h3 className="font-bold text-text-primary">Clerk Audit & Write</h3>
            <p className="text-text-muted leading-relaxed">
              Clerk verifies SHA-256 action digests, enforces daily nudge budgets, posts comments with idempotence tags, and commits to the local append-only ledger.
            </p>
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
};
