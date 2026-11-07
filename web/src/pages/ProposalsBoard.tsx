import React, { useState } from 'react';
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertTriangle,
  Flame,
  ShieldAlert,
  MessageSquare,
  UserCheck,
  GitPullRequest,
} from 'lucide-react';
import { useDaybreakData, getApproveCommand, getSkipCommand, getSnoozeCommand } from '../data/source';
import { Proposal, ProposalStatus } from '../types/daybreak';
import { CopyButton } from '../components/CopyButton';
import { SpotlightCard } from '../components/reactbits/SpotlightCard';

export const ProposalsBoard: React.FC = () => {
  const { data } = useDaybreakData();
  const proposals = data.analysis.proposals || [];
  const suppressed = data.analysis.suppressed || [];

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [personFilter, setPersonFilter] = useState<string>('all');
  const [expandedDrafts, setExpandedDrafts] = useState<Record<string, boolean>>({});
  const [showSuppressed, setShowSuppressed] = useState<boolean>(false);

  // Extract unique people
  const people = Array.from(new Set(proposals.map((p) => p.person).filter(Boolean)));

  const toggleDraft = (id: string) => {
    setExpandedDrafts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = proposals.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (severityFilter !== 'all' && p.severity !== severityFilter) return false;
    if (personFilter !== 'all' && p.person !== personFilter) return false;
    return true;
  });

  const stuckList = filtered.filter((p) => p.severity === 'stuck');
  const warningList = filtered.filter((p) => p.severity === 'warning');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ============================================================ */}
      {/* HEADER                                                       */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-accent-amber mb-1">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>STANDUP ZERO · SENTINEL PROPOSALS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            Sentinel Proposals Queue
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Heuristic stuck items and proactive early warnings awaiting human review.
          </p>
        </div>

        {/* Global Action */}
        {proposals.some((p) => p.status === 'proposed') && (
          <CopyButton
            command={getApproveCommand(
              proposals.filter((p) => p.status === 'proposed').map((p) => p.index)
            )}
            label="Approve All Proposed"
            variant="primary"
          />
        )}
      </div>

      {/* ============================================================ */}
      {/* MODERN TABBED FILTER BAR (Switch Console Style)             */}
      {/* ============================================================ */}
      <div className="p-2.5 rounded-xl bg-surface-1 border border-border flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        {/* Category Tabs */}
        <div className="flex items-center rounded-lg bg-surface-2 p-1 border border-border/80">
          <button
            type="button"
            onClick={() => setSeverityFilter('all')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              severityFilter === 'all'
                ? 'bg-surface-3 text-text-primary font-bold shadow-xs border border-border'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            All Categories ({proposals.length})
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('stuck')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              severityFilter === 'stuck'
                ? 'bg-surface-3 text-accent-coral font-bold shadow-xs border border-border'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Stuck ({proposals.filter((p) => p.severity === 'stuck').length})
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('warning')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              severityFilter === 'warning'
                ? 'bg-surface-3 text-accent-amber font-bold shadow-xs border border-border'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Early Warning ({proposals.filter((p) => p.severity === 'warning').length})
          </button>
        </div>

        {/* Status & Recipient Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface-2 text-text-primary px-3 py-1.5 rounded-lg border border-border text-xs focus:outline-none focus:border-accent-amber"
          >
            <option value="all">Status: All</option>
            <option value="proposed">Proposed (Pending)</option>
            <option value="approved">Approved</option>
            <option value="executed">Executed</option>
            <option value="skipped">Skipped</option>
            <option value="snoozed">Snoozed</option>
          </select>

          <select
            value={personFilter}
            onChange={(e) => setPersonFilter(e.target.value)}
            className="bg-surface-2 text-text-primary px-3 py-1.5 rounded-lg border border-border text-xs focus:outline-none focus:border-accent-amber"
          >
            <option value="all">Author / Recipient: All</option>
            {people.map((p) => (
              <option key={p} value={p}>
                @{p}
              </option>
            ))}
          </select>

          {(statusFilter !== 'all' || severityFilter !== 'all' || personFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setSeverityFilter('all');
                setPersonFilter('all');
              }}
              className="text-xs text-accent-coral hover:underline font-medium px-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2-LANE PROPOSAL STACK                                        */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lane 1: Stuck Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-status-warning" />
              <h2 className="text-base font-bold text-text-primary">Stuck SLA Violations</h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-surface-3 text-text-primary border border-border">
                {stuckList.length}
              </span>
            </div>
            <span className="text-[11px] text-text-muted">Exceeded configured SLA</span>
          </div>

          {stuckList.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-border bg-surface-1/40 text-xs text-text-muted">
              Zero stuck items matching the current filter.
            </div>
          ) : (
            <div className="space-y-4">
              {stuckList.map((p) => (
                <ProposalCard
                  key={p.id}
                  proposal={p}
                  isExpanded={!!expandedDrafts[p.id]}
                  onToggleDraft={() => toggleDraft(p.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Lane 2: Early Warning Signals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-accent-coral" />
              <h2 className="text-base font-bold text-text-primary">Early Warning Signals</h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-surface-3 text-text-primary border border-border">
                {warningList.length}
              </span>
            </div>
            <span className="text-[11px] text-text-muted">Pre-SLA stall risks</span>
          </div>

          {warningList.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-border bg-surface-1/40 text-xs text-text-muted">
              Zero early warning items matching the current filter.
            </div>
          ) : (
            <div className="space-y-4">
              {warningList.map((p) => (
                <ProposalCard
                  key={p.id}
                  proposal={p}
                  isExpanded={!!expandedDrafts[p.id]}
                  onToggleDraft={() => toggleDraft(p.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* SUPPRESSED PROPOSALS ACCORDION                               */}
      {/* ============================================================ */}
      {suppressed.length > 0 && (
        <div className="pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => setShowSuppressed(!showSuppressed)}
            className="flex items-center justify-between w-full p-4 rounded-xl bg-surface-1 border border-border hover:bg-surface-2 transition-colors text-xs font-medium text-text-secondary"
          >
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-text-muted" />
              <span>
                Rate-Limited & Suppressed Candidates ({suppressed.length})
              </span>
            </div>
            {showSuppressed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showSuppressed && (
            <div className="mt-2 p-4 rounded-xl bg-surface-1/50 border border-border space-y-2">
              {suppressed.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-border/40 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-accent-amber">
                      #{item.target.number}
                    </span>
                    <span className="text-text-primary">{item.reason}</span>
                  </div>
                  {item.rule_limit && (
                    <span className="text-text-muted font-mono text-[11px]">
                      Limit: {item.rule_limit}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface ProposalCardProps {
  proposal: Proposal;
  isExpanded: boolean;
  onToggleDraft: () => void;
}

const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal: p,
  isExpanded,
  onToggleDraft,
}) => {
  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case 'proposed':
        return 'bg-accent-amber/15 text-accent-amber border-accent-amber/30';
      case 'approved':
        return 'bg-status-success/15 text-status-success border-status-success/30';
      case 'executed':
        return 'bg-status-info/15 text-status-info border-status-info/30';
      case 'skipped':
        return 'bg-text-muted/15 text-text-muted border-border';
      case 'snoozed':
        return 'bg-accent-violet/15 text-accent-violet border-accent-violet/30';
      case 'failed':
        return 'bg-status-danger/15 text-status-danger border-status-danger/30';
      default:
        return 'bg-surface-3 text-text-muted border-border';
    }
  };

  const getTierBadge = (tier?: string | null) => {
    if (!tier) return null;
    switch (tier) {
      case 'High':
        return 'bg-accent-coral/20 text-accent-coral border-accent-coral/30';
      case 'At risk':
        return 'bg-accent-amber/20 text-accent-amber border-accent-amber/30';
      case 'Watch':
        return 'bg-surface-3 text-text-secondary border-border';
      default:
        return 'bg-surface-3 text-text-muted border-border';
    }
  };

  return (
    <SpotlightCard className="p-4 rounded-xl border border-border/80 hover:border-border-strong flex flex-col justify-between gap-3 shadow-xs">
      {/* Top row */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded font-mono text-xs font-black bg-surface-3 text-text-primary border border-border">
              #{p.index}
            </span>
            {p.tier && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getTierBadge(
                  p.tier
                )}`}
              >
                {p.tier} ({p.points} PTS)
              </span>
            )}
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadge(
                p.status
              )}`}
            >
              {p.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {p.over_hours && (
              <span className="text-[11px] font-mono text-accent-coral font-bold">
                +{p.over_hours}h SLA
              </span>
            )}
            <span className="text-xs font-mono text-text-muted">@{p.person}</span>
          </div>
        </div>

        {/* Target link & Summary */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-accent-amber mb-1">
            <a
              href={p.target.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-center gap-1 font-bold text-accent-amber"
            >
              <GitPullRequest className="h-3 w-3" />
              <span>
                {p.target.kind.toUpperCase()} #{p.target.number}
              </span>
              <ExternalLink className="h-2.5 w-2.5 opacity-70" />
            </a>
            <span className="text-text-muted">· {p.type.replace('_', ' ')}</span>
          </div>
          <p className="text-sm font-semibold text-text-primary leading-snug">{p.summary}</p>
        </div>

        {/* Reasons */}
        <div className="text-xs text-text-secondary space-y-1 pt-1">
          {p.reasons.map((r, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="text-accent-amber font-mono">•</span>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-text-secondary hover:text-text-primary transition-colors"
              >
                {r.text}
              </a>
            </div>
          ))}
        </div>

        {/* Actions list */}
        <div className="pt-2 border-t border-border/60">
          <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
            Proposed Outbound Actions ({p.actions.length})
          </div>
          <div className="space-y-1">
            {p.actions.map((act, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-surface-2/60 border border-border/60 font-mono text-[11px]"
              >
                <div className="flex items-center gap-2 truncate">
                  {act.kind === 'comment' ? (
                    <MessageSquare className="h-3.5 w-3.5 text-accent-amber shrink-0" />
                  ) : (
                    <UserCheck className="h-3.5 w-3.5 text-accent-coral shrink-0" />
                  )}
                  <span className="text-text-primary capitalize">
                    {act.kind.replace('_', ' ')}
                  </span>
                  <span className="text-text-muted">→</span>
                  <span className="text-accent-amber">@{act.person}</span>
                  <span className="text-text-muted">on #{act.number}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drafted Body Collapsible (styled like GitHub issue comment box) */}
        {p.actions.some((a) => a.body) && (
          <div className="pt-1">
            <button
              type="button"
              onClick={onToggleDraft}
              className="text-xs text-text-muted hover:text-text-primary flex items-center gap-1 font-mono transition-colors"
            >
              <span>{isExpanded ? 'Hide drafted comment' : 'Inspect drafted comment'}</span>
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {isExpanded && (
              <div className="mt-2 rounded-lg border border-border overflow-hidden text-xs">
                <div className="px-3 py-1.5 bg-surface-2/80 border-b border-border flex items-center justify-between text-[11px] text-text-muted font-mono">
                  <span>Daybreak Comment Preview</span>
                  <span>&lt;!-- daybreak:{p.id} --&gt;</span>
                </div>
                <div className="p-3 bg-surface-0 font-mono text-text-secondary whitespace-pre-wrap leading-relaxed">
                  {p.actions.find((a) => a.body)?.body}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Decision Command Action Bar */}
      <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono text-text-muted">
          Decide:
        </span>
        <div className="flex items-center gap-1.5">
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
    </SpotlightCard>
  );
};
