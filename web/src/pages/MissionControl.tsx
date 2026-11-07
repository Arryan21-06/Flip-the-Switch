import React from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  GitPullRequest,
  AlertCircle,
  User,
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
      {/* ============================================================ */}
      {/* CONSOLE HERO HEADER                                          */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-border bg-surface-1 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-status-success animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-accent-amber uppercase">
              STANDUP ZERO · MISSION CONTROL
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-3 text-text-muted border border-border">
              {data.analysis.meta.repo}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            Engineering Velocity Dashboard
          </h1>

          <p className="text-xs text-text-secondary">
            Standup window for{' '}
            <strong className="text-text-primary font-mono">
              {new Date(data.analysis.meta.now).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </strong>{' '}
            · Scribe, Sentinel & Clerk active in Switch room.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/simulator"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border text-xs font-semibold text-text-primary transition-all shadow-xs"
          >
            <MessageSquare className="h-3.5 w-3.5 text-accent-amber" />
            <span>Open Switch Room</span>
          </Link>

          {pending.length > 0 && (
            <CopyButton
              command={getApproveCommand(allPendingIndices)}
              label={`Approve All Pending (${allPendingIndices.length})`}
              variant="primary"
            />
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4 HIGH-DENSITY KPI CARDS                                     */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Needs a human */}
        <SpotlightCard className="p-4 rounded-xl border border-border/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Awaiting Approval
            </span>
            <span className="h-6 w-6 rounded-md bg-accent-coral/15 flex items-center justify-center text-accent-coral">
              <Inbox className="h-3.5 w-3.5" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-text-primary mb-1">
              <CountUp to={pending.length} />
            </div>
            <div className="flex items-center gap-1 text-[11px] text-text-muted">
              {pending.length > 0 ? (
                <span className="text-accent-coral font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Needs room command
                </span>
              ) : (
                <span className="text-status-success font-medium flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Queue empty
                </span>
              )}
            </div>
          </div>
        </SpotlightCard>

        {/* Card 2: Early Warning Radar */}
        <SpotlightCard className="p-4 rounded-xl border border-border/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Early Warning
            </span>
            <span className="h-6 w-6 rounded-md bg-accent-amber/15 flex items-center justify-center text-accent-amber">
              <AlertTriangle className="h-3.5 w-3.5" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-text-primary mb-1">
              <CountUp to={warningItems.length + watching.length} />
            </div>
            <div className="text-[11px] text-text-muted">
              <span className="text-accent-amber font-semibold font-mono">{warningItems.length}</span> high risk ·{' '}
              <span className="text-text-primary font-semibold font-mono">{watching.length}</span> watching
            </div>
          </div>
        </SpotlightCard>

        {/* Card 3: Stuck Items */}
        <SpotlightCard className="p-4 rounded-xl border border-border/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Stuck SLA Items
            </span>
            <span className="h-6 w-6 rounded-md bg-status-warning/15 flex items-center justify-center text-status-warning">
              <Clock className="h-3.5 w-3.5" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-text-primary mb-1">
              <CountUp to={stuckItems.length} />
            </div>
            <div className="text-[11px] text-text-muted">
              Reviews, CI, stale issues over limit
            </div>
          </div>
        </SpotlightCard>

        {/* Card 4: Executed Actions */}
        <SpotlightCard className="p-4 rounded-xl border border-border/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Audited Actions
            </span>
            <span className="h-6 w-6 rounded-md bg-status-success/15 flex items-center justify-center text-status-success">
              <CheckCircle className="h-3.5 w-3.5" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-text-primary mb-1">
              <CountUp to={executedCount} />
            </div>
            <div className="text-[11px] text-status-success font-medium">
              Sealed in immutable ledger
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* ============================================================ */}
      {/* "NEEDS A HUMAN DECISION" PROPOSALS QUEUE                     */}
      {/* ============================================================ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-text-primary tracking-tight">
              Needs a human decision
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-accent-coral/20 text-accent-coral font-bold border border-accent-coral/30">
              {pending.length} pending
            </span>
          </div>

          <Link
            to="/proposals"
            className="text-xs text-accent-amber hover:underline flex items-center gap-1 font-semibold"
          >
            <span>View full proposals board</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {pending.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-surface-1/40">
            <CheckCircle className="h-10 w-10 text-status-success mx-auto mb-2 opacity-80" />
            <h3 className="text-sm font-bold text-text-primary">
              Nothing waiting. Quiet is good.
            </h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto mt-1">
              All detected stuck items and early warnings have been decided or no items exceeded SLA thresholds today.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {pending.map((p) => {
              const isWarning = p.severity === 'warning';
              return (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-border hover:border-border-strong bg-surface-1 transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs"
                >
                  {/* Left: Metadata & Summary */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono text-xs font-black bg-surface-3 text-text-primary border border-border">
                        #{p.index}
                      </span>

                      {isWarning ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent-coral/20 text-accent-coral border border-accent-coral/30">
                          {p.tier || 'HIGH'} ({p.points} PTS)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent-coral/15 text-accent-coral border border-accent-coral/30">
                          STUCK SLA
                        </span>
                      )}

                      <a
                        href={p.target.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono font-bold text-accent-amber hover:underline inline-flex items-center gap-1"
                      >
                        <GitPullRequest className="h-3 w-3" />
                        <span>
                          {p.target.kind.toUpperCase()} #{p.target.number}
                        </span>
                        <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                      </a>

                      {p.over_hours && (
                        <span className="text-[11px] font-mono text-accent-coral font-semibold">
                          +{p.over_hours}h over SLA
                        </span>
                      )}

                      <span className="text-xs font-mono text-text-muted flex items-center gap-1">
                        <User className="h-3 w-3" /> @{p.person}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-text-primary leading-snug">
                      {p.summary}
                    </p>

                    <div className="text-xs text-text-secondary flex flex-wrap gap-x-4 gap-y-1">
                      {p.reasons.map((r, i) => (
                        <span key={i} className="inline-flex items-center gap-1">
                          <span className="text-accent-amber">•</span>
                          <span>{r.text}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: Decision Command Copy Buttons */}
                  <div className="flex items-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-border">
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
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* PIPELINE ARCHITECTURE PHASES                                 */}
      {/* ============================================================ */}
      <div className="p-5 rounded-2xl border border-border bg-surface-1 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Daily Standup Zero Pipeline
          </h3>
          <span className="text-[10px] font-mono text-text-muted">Deterministic Core + Switch Agents</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border space-y-1.5">
            <div className="font-bold text-text-primary flex items-center justify-between">
              <span>1. Ingestion</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-surface-3 text-status-success font-semibold">
                DONE
              </span>
            </div>
            <p className="text-text-muted text-[11px] leading-relaxed">
              Read-only GitHub event snapshot collected via <code className="font-mono">gh</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border space-y-1.5">
            <div className="font-bold text-text-primary flex items-center justify-between">
              <span>2. Scribe Brief</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-surface-3 text-status-success font-semibold">
                DRAFTED
              </span>
            </div>
            <p className="text-text-muted text-[11px] leading-relaxed">
              Standup report drafted with 100% evidence-linked Git items.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border space-y-1.5">
            <div className="font-bold text-text-primary flex items-center justify-between">
              <span>3. Sentinel Radar</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-accent-coral/15 text-accent-coral font-semibold">
                {pending.length} PROPOSED
              </span>
            </div>
            <p className="text-text-muted text-[11px] leading-relaxed">
              SLA timeouts and early warning points computed deterministically.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border space-y-1.5">
            <div className="font-bold text-text-primary flex items-center justify-between">
              <span>4. Clerk Gate</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-surface-3 text-accent-amber font-semibold">
                GATE LOCKED
              </span>
            </div>
            <p className="text-text-muted text-[11px] leading-relaxed">
              Awaiting human typed command. SHA-256 digest cryptographically verified.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
