import React from 'react';
import {
  Info,
  Layers,
  Users,
  GitBranch,
  ExternalLink,
  Activity,
} from 'lucide-react';
import { useDaybreakData, getApproveCommand } from '../data/source';
import { SpotlightCard } from '../components/reactbits/SpotlightCard';
import { CopyButton } from '../components/CopyButton';

export const EarlyWarning: React.FC = () => {
  const { data } = useDaybreakData();
  const warningProposals = (data.analysis.proposals || []).filter(
    (p) => p.severity === 'warning'
  );
  const watching = data.analysis.watching || [];
  const rules = data.rules.early_warning;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-accent-amber mb-1">
            <Activity className="h-3.5 w-3.5" />
            <span>STANDUP ZERO · EARLY WARNING ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            Early Warning Radar
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Proactive risk flags computed from 3 deterministic signals before work breaches team SLAs.
          </p>
        </div>
      </div>

      {/* Honest Heuristic Disclaimer Banner */}
      <div className="p-4 rounded-xl border border-accent-amber/30 bg-accent-amber/10 flex items-start gap-3 shadow-xs">
        <Info className="h-5 w-5 text-accent-amber shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-text-primary">
            Honest Heuristic Disclaimer (Code Decides, Agents Explain)
          </p>
          <p className="text-text-secondary leading-relaxed">
            These are heuristic flags computed from simple rule weights, <strong>never</strong> a statistical probability or prediction. Points accumulate across 3 observable signals to assign attention tiers (<em>Watch</em>, <em>At risk</em>, <em>High</em>).
          </p>
        </div>
      </div>

      {/* 3 Observable Signals Breakdown */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-text-primary">The Three Observable Signals</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Signal 1 */}
          <SpotlightCard className="p-5 border border-border/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="h-9 w-9 rounded-lg bg-accent-amber/15 border border-accent-amber/30 flex items-center justify-center text-accent-amber">
                  <Users className="h-5 w-5" />
                </div>
                <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded bg-surface-3 text-accent-amber border border-border">
                  +{rules.points.no_reviewer} PTS
                </span>
              </div>
              <h3 className="text-sm font-bold text-text-primary mb-1">1. No Reviewer Assigned</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                PR has zero requested reviewers after the {rules.grace_hours}h grace period. Flags author isolation early.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/60">
              <div className="h-1.5 w-full bg-surface-3 rounded-full overflow-hidden">
                <div style={{ width: `${rules.points.no_reviewer}%` }} className="h-full bg-accent-amber rounded-full" />
              </div>
            </div>
          </SpotlightCard>

          {/* Signal 2 */}
          <SpotlightCard className="p-5 border border-border/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="h-9 w-9 rounded-lg bg-accent-coral/15 border border-accent-coral/30 flex items-center justify-center text-accent-coral">
                  <Layers className="h-5 w-5" />
                </div>
                <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded bg-surface-3 text-accent-coral border border-border">
                  +{rules.points.workload} PTS
                </span>
              </div>
              <h3 className="text-sm font-bold text-text-primary mb-1">2. Author Workload</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Author already has ≥ {rules.workload_open_prs} open PRs in flight. Context switching increases cycle time.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/60">
              <div className="h-1.5 w-full bg-surface-3 rounded-full overflow-hidden">
                <div style={{ width: `${rules.points.workload}%` }} className="h-full bg-accent-coral rounded-full" />
              </div>
            </div>
          </SpotlightCard>

          {/* Signal 3 */}
          <SpotlightCard className="p-5 border border-border/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="h-9 w-9 rounded-lg bg-accent-violet/15 border border-accent-violet/30 flex items-center justify-center text-accent-violet">
                  <GitBranch className="h-5 w-5" />
                </div>
                <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded bg-surface-3 text-accent-violet border border-border">
                  +{rules.points.dependency} PTS
                </span>
              </div>
              <h3 className="text-sm font-bold text-text-primary mb-1">3. Open Dependency</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                PR body contains <code className="font-mono text-accent-amber">Depends on #X</code> where #X remains unmerged.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/60">
              <div className="h-1.5 w-full bg-surface-3 rounded-full overflow-hidden">
                <div style={{ width: `${rules.points.dependency}%` }} className="h-full bg-accent-violet rounded-full" />
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>

      {/* Tier Ladder */}
      <SpotlightCard className="p-5 border border-border/80 space-y-4">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
          Attention Tier Ladder (Point Accumulation)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-text-secondary uppercase">Watch Tier</span>
              <span className="font-mono text-[11px] text-text-muted font-bold">20–35 PTS</span>
            </div>
            <p className="text-text-muted text-[11px] leading-relaxed">
              Monitored in background feed. Does not create an intrusive room ping.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-accent-amber/10 border border-accent-amber/20 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-accent-amber uppercase">At Risk Tier</span>
              <span className="font-mono text-[11px] text-accent-amber font-bold">40–55 PTS</span>
            </div>
            <p className="text-text-secondary text-[11px] leading-relaxed">
              Multiple accumulating risk signals. Candidates for room review.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-accent-coral/10 border border-accent-coral/20 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-accent-coral uppercase">High Priority</span>
              <span className="font-mono text-[11px] text-accent-coral font-bold">≥ 60 PTS</span>
            </div>
            <p className="text-text-secondary text-[11px] leading-relaxed">
              Highest urgency stall warning. Proposed for proactive reviewer assignment & dependency check.
            </p>
          </div>
        </div>
      </SpotlightCard>

      {/* Proposed Early Warnings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h2 className="text-base font-bold text-text-primary">
            Active Warning Proposals ({warningProposals.length})
          </h2>
          <span className="text-xs text-text-muted font-mono">
            Capped by rules.limits.max_warning_proposals
          </span>
        </div>

        {warningProposals.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-border bg-surface-1/40 text-xs text-text-muted">
            Zero early warning proposals currently queued.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {warningProposals.map((p) => (
              <SpotlightCard key={p.id} className="p-5 border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-surface-3 text-text-primary border border-border">
                      #{p.index}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent-coral/20 text-accent-coral border border-accent-coral/30">
                      {p.tier} ({p.points} PTS)
                    </span>
                    <a
                      href={p.target.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-accent-amber hover:underline flex items-center gap-1 font-bold"
                    >
                      <span>PR #{p.target.number}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <span className="text-xs font-mono text-text-muted">Author: @{p.person}</span>
                  </div>

                  <p className="text-sm font-semibold text-text-primary">{p.summary}</p>

                  <div className="text-xs text-text-secondary space-y-1">
                    {p.reasons.map((r, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="text-accent-coral font-mono">•</span>
                        <span>{r.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <CopyButton
                    command={getApproveCommand([p.index])}
                    label={`approve ${p.index}`}
                    variant="primary"
                    size="sm"
                  />
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}
      </div>

      {/* Watch List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h2 className="text-base font-bold text-text-primary">
            Background Watch List ({watching.length})
          </h2>
          <span className="text-xs text-text-muted">
            Tracked items under threshold or rate-limit capped
          </span>
        </div>

        {watching.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-border bg-surface-1/40 text-xs text-text-muted">
            No items on the background watch list.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {watching.map((w: any, idx: number) => (
              <SpotlightCard key={idx} className="p-4 border border-border/80 space-y-2">
                <div className="flex items-center justify-between">
                  <a
                    href={w.target?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs font-bold text-accent-amber hover:underline flex items-center gap-1"
                  >
                    <span>PR #{w.target?.number}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-3 text-text-secondary font-bold border border-border">
                    {w.points} PTS
                  </span>
                </div>

                <div className="text-xs font-semibold text-text-primary truncate">
                  {w.summary}
                </div>

                <div className="text-[11px] text-text-muted space-y-1 pt-2 border-t border-border/40">
                  {w.reasons?.slice(0, 2).map((r: any, i: number) => (
                    <div key={i} className="truncate">• {r.text}</div>
                  ))}
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
