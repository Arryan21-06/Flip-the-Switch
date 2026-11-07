import React from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useDaybreakData, getApproveCommand, getSkipCommand, getSnoozeCommand } from '../data/source';
import { SpotlightCard } from '../components/reactbits/SpotlightCard';
import { CountUp } from '../components/reactbits/CountUp';
import { CopyButton } from '../components/CopyButton';

export const MissionControl: React.FC = () => {
  const { data } = useDaybreakData();
  const proposals = data.analysis.proposals || [];
  const watching = data.analysis.watching || [];
  const pending = proposals.filter((p) => p.status === 'proposed');
  const stuckItems = proposals.filter((p) => p.severity === 'stuck');
  const warningItems = proposals.filter((p) => p.severity === 'warning');
  const executedCount = Object.keys(data.ledger.executed || {}).length;

  const allPendingIndices = pending.map((p) => p.index);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-accent-amber mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>STANDUP ZERO · MISSION CONTROL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Today at a glance
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Repo: <span className="font-mono text-text-primary">{data.analysis.meta.repo}</span> ·
            Standup snapshot for{' '}
            <span className="font-mono text-text-primary">
              {new Date(data.analysis.meta.now).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </p>
        </div>

        {/* Action bar */}
        {pending.length > 0 && (
          <div className="flex items-center gap-2">
            <CopyButton
              command={getApproveCommand(allPendingIndices)}
              label={`Copy: approve all (${allPendingIndices.length})`}
              variant="primary"
            />
          </div>
        )}
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Needs a human */}
        <SpotlightCard className="p-5">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Awaiting Decision</span>
            <Inbox className="h-4 w-4 text-accent-coral" />
          </div>
          <div className="text-3xl font-bold text-text-primary mb-1">
            <CountUp to={pending.length} />
          </div>
          <div className="text-xs text-text-muted">
            Proposals waiting for room approval
          </div>
        </SpotlightCard>

        {/* Card 2: Early Warning Flags */}
        <SpotlightCard className="p-5">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Early Warning</span>
            <AlertTriangle className="h-4 w-4 text-accent-amber" />
          </div>
          <div className="text-3xl font-bold text-text-primary mb-1">
            <CountUp to={warningItems.length + watching.length} />
          </div>
          <div className="text-xs text-text-muted">
            {warningItems.length} proposed · {watching.length} watching
          </div>
        </SpotlightCard>

        {/* Card 3: Stuck Items */}
        <SpotlightCard className="p-5">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Stuck Items</span>
            <Clock className="h-4 w-4 text-status-warning" />
          </div>
          <div className="text-3xl font-bold text-text-primary mb-1">
            <CountUp to={stuckItems.length} />
          </div>
          <div className="text-xs text-text-muted">
            Reviews, CI & unmerged over SLA
          </div>
        </SpotlightCard>

        {/* Card 4: Executed Today */}
        <SpotlightCard className="p-5">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Executed Actions</span>
            <CheckCircle className="h-4 w-4 text-status-success" />
          </div>
          <div className="text-3xl font-bold text-text-primary mb-1">
            <CountUp to={executedCount} />
          </div>
          <div className="text-xs text-text-muted">
            Audited in persistent ledger
          </div>
        </SpotlightCard>
      </div>

      {/* Main Section: "Needs a Human" Panel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight">Needs a human decision</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-accent-coral/15 text-accent-coral font-medium border border-accent-coral/20">
              {pending.length} pending
            </span>
          </div>
          <Link
            to="/proposals"
            className="text-xs text-accent-amber hover:underline flex items-center gap-1 font-medium"
          >
            <span>View proposals board</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {pending.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-surface-1/40">
            <CheckCircle className="h-10 w-10 text-status-success mx-auto mb-3 opacity-80" />
            <h3 className="text-base font-semibold text-text-primary mb-1">
              Nothing waiting. Quiet is good.
            </h3>
            <p className="text-xs text-text-muted max-w-md mx-auto">
              All detected stuck items and early warnings have been decided or no items exceeded SLA thresholds today.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {pending.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-border bg-surface-1 hover:border-border-strong transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Summary & reasons */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-surface-3 text-text-primary border border-border">
                      #{p.index}
                    </span>
                    <span
                      className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
                        p.severity === 'stuck'
                          ? 'bg-accent-coral/15 text-accent-coral border border-accent-coral/30'
                          : 'bg-accent-amber/15 text-accent-amber border border-accent-amber/30'
                      }`}
                    >
                      {p.severity === 'stuck' ? 'Stuck' : `Risk: ${p.tier || 'Flagged'}`}
                    </span>
                    <a
                      href={p.target.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-accent-amber hover:underline inline-flex items-center gap-1"
                    >
                      <span>
                        {p.target.kind.toUpperCase()} #{p.target.number}
                      </span>
                      <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                    </a>
                    <span className="text-xs text-text-muted font-mono">@{p.person}</span>
                  </div>

                  <p className="text-sm font-medium text-text-primary">{p.summary}</p>

                  <div className="text-xs text-text-muted flex flex-wrap gap-x-4 gap-y-1">
                    {p.reasons.map((r, i) => (
                      <span key={i} className="inline-flex items-center gap-1">
                        • {r.text}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Decision Command Copy Buttons */}
                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border">
                  <CopyButton
                    command={getApproveCommand([p.index])}
                    label={`approve ${p.index}`}
                    variant="primary"
                    size="sm"
                  />
                  <CopyButton
                    command={getSkipCommand([p.index])}
                    label={`skip ${p.index}`}
                    variant="secondary"
                    size="sm"
                  />
                  <CopyButton
                    command={getSnoozeCommand(p.index, '2d')}
                    label={`snooze ${p.index} 2d`}
                    variant="subtle"
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Pipeline Flow */}
      <div className="p-6 rounded-2xl border border-border bg-surface-1 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
          How Today Was Assembled (Standup Zero Architecture)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-surface-2/60 border border-border space-y-1">
            <div className="font-semibold text-text-primary flex items-center justify-between">
              <span>1. Collect Snapshot</span>
              <span className="font-mono text-[10px] text-accent-amber">04:00</span>
            </div>
            <p className="text-text-muted">
              Snapshot fetched from {data.analysis.meta.source}. Read-only GitHub queries.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-surface-2/60 border border-border space-y-1">
            <div className="font-semibold text-text-primary flex items-center justify-between">
              <span>2. Scribe Standup Brief</span>
              <span className="font-mono text-[10px] text-accent-amber">Scribe</span>
            </div>
            <p className="text-text-muted">
              Evidence-linked brief drafted for {data.brief.people.length} team members.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-surface-2/60 border border-border space-y-1">
            <div className="font-semibold text-text-primary flex items-center justify-between">
              <span>3. Sentinel Heuristics</span>
              <span className="font-mono text-[10px] text-accent-amber">Sentinel</span>
            </div>
            <p className="text-text-muted">
              {proposals.length} proposal candidates generated. Capped by daily nudge limits.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-surface-2/60 border border-border space-y-1">
            <div className="font-semibold text-text-primary flex items-center justify-between">
              <span>4. Clerk Gatekeeper</span>
              <span className="font-mono text-[10px] text-accent-amber">Clerk</span>
            </div>
            <p className="text-text-muted">
              Awaiting human authorization in Switch room. Atomic ledger prevents duplicate writes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
