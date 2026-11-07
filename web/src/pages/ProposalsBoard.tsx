import React, { useState } from 'react';
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Filter,
  Clock,
  AlertTriangle,
  Flame,
  ShieldAlert,
  MessageSquare,
  UserCheck,
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-accent-amber mb-1">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>STANDUP ZERO · SENTINEL PROPOSALS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Proposals Board
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Review nudge and early warning proposals. Decisions are executed strictly through room chat commands.
          </p>
        </div>

        {/* Global Action */}
        {proposals.some((p) => p.status === 'proposed') && (
          <CopyButton
            command={getApproveCommand(
              proposals.filter((p) => p.status === 'proposed').map((p) => p.index)
            )}
            label="Copy: approve all proposed"
            variant="primary"
          />
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-surface-1 border border-border text-xs">
        <div className="flex items-center gap-1.5 text-text-muted font-medium pr-2 border-r border-border">
          <Filter className="h-3.5 w-3.5" />
          <span>Filters:</span>
        </div>

        {/* Category Filter */}
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-surface-2 text-text-primary px-2.5 py-1.5 rounded-lg border border-border focus:outline-none focus:border-accent-amber"
        >
          <option value="all">All Categories ({proposals.length})</option>
          <option value="stuck">Stuck Items only ({proposals.filter((p) => p.severity === 'stuck').length})</option>
          <option value="warning">Early Warning only ({proposals.filter((p) => p.severity === 'warning').length})</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-surface-2 text-text-primary px-2.5 py-1.5 rounded-lg border border-border focus:outline-none focus:border-accent-amber"
        >
          <option value="all">All Statuses</option>
          <option value="proposed">Proposed (Pending)</option>
          <option value="approved">Approved</option>
          <option value="executed">Executed</option>
          <option value="skipped">Skipped</option>
          <option value="snoozed">Snoozed</option>
        </select>

        {/* Person Filter */}
        <select
          value={personFilter}
          onChange={(e) => setPersonFilter(e.target.value)}
          className="bg-surface-2 text-text-primary px-2.5 py-1.5 rounded-lg border border-border focus:outline-none focus:border-accent-amber"
        >
          <option value="all">All Recipients</option>
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
            className="text-accent-coral hover:underline ml-auto"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Lanes or Filtered List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Lane: Stuck Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-status-warning" />
              <h2 className="text-base font-bold text-text-primary">Stuck Items</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-surface-3 text-text-muted">
                {stuckList.length}
              </span>
            </div>
            <span className="text-[11px] text-text-muted">Over SLA thresholds</span>
          </div>

          {stuckList.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-border bg-surface-1/40 text-xs text-text-muted">
              No stuck items matching the active filters.
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

        {/* Right Lane: Early Warning */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-accent-coral" />
              <h2 className="text-base font-bold text-text-primary">Early Warning Signals</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-surface-3 text-text-muted">
                {warningList.length}
              </span>
            </div>
            <span className="text-[11px] text-text-muted">Proactive pre-SLA risk flags</span>
          </div>

          {warningList.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-border bg-surface-1/40 text-xs text-text-muted">
              No early warning items matching the active filters.
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

      {/* Suppressed Proposals Section */}
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
                Suppressed Candidate Items ({suppressed.length}) — withheld by rate limits & rules
              </span>
            </div>
            {showSuppressed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showSuppressed && (
            <div className="mt-3 p-4 rounded-xl bg-surface-1/50 border border-border space-y-2">
              {suppressed.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-border/40 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-accent-amber">
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
        return 'bg-surface-3 text-text-muted';
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
    <SpotlightCard className="p-4 rounded-xl flex flex-col justify-between gap-3">
      {/* Top row */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-surface-3 text-text-primary border border-border">
              #{p.index}
            </span>
            {p.tier && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getTierBadge(
                  p.tier
                )}`}
              >
                {p.tier} ({p.points} pts)
              </span>
            )}
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadge(
                p.status
              )}`}
            >
              {p.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {p.over_hours && (
              <span className="text-[11px] font-mono text-accent-coral">
                +{p.over_hours}h over SLA
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
              className="hover:underline flex items-center gap-1 font-semibold"
            >
              <span>
                {p.target.kind.toUpperCase()} #{p.target.number}
              </span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <span className="text-text-muted">· {p.type.replace('_', ' ')}</span>
          </div>
          <p className="text-sm font-medium text-text-primary leading-snug">{p.summary}</p>
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
                className="hover:underline text-text-muted hover:text-text-primary transition-colors"
              >
                {r.text}
              </a>
            </div>
          ))}
        </div>

        {/* Actions list */}
        <div className="pt-2 border-t border-border/60">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
            Proposed Actions ({p.actions.length})
          </div>
          <div className="space-y-1">
            {p.actions.map((act, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-surface-2/60 border border-border/60"
              >
                <div className="flex items-center gap-2">
                  {act.kind === 'comment' ? (
                    <MessageSquare className="h-3.5 w-3.5 text-accent-amber" />
                  ) : (
                    <UserCheck className="h-3.5 w-3.5 text-accent-coral" />
                  )}
                  <span className="font-mono text-text-primary capitalize">
                    {act.kind.replace('_', ' ')}
                  </span>
                  <span className="text-text-muted">→</span>
                  <span className="font-mono text-text-secondary">@{act.person}</span>
                  <span className="text-text-muted">on #{act.number}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drafted Body Collapsible */}
        {p.actions.some((a) => a.body) && (
          <div className="pt-1">
            <button
              type="button"
              onClick={onToggleDraft}
              className="text-xs text-text-muted hover:text-text-primary flex items-center gap-1 font-mono transition-colors"
            >
              <span>{isExpanded ? 'Hide drafted message' : 'Preview drafted message'}</span>
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {isExpanded && (
              <div className="mt-2 p-3 rounded-lg bg-surface-0 border border-border text-xs font-mono text-text-secondary whitespace-pre-wrap leading-relaxed shadow-inner">
                {p.actions.find((a) => a.body)?.body}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Decision Buttons (Copy to clipboard for room) */}
      <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
        <span className="text-[11px] text-text-muted font-sans">
          Decide in Switch:
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
