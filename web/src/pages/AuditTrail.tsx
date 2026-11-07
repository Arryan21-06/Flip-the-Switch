import React, { useState } from 'react';
import {
  History,
  ShieldCheck,
  Download,
  ExternalLink,
  Copy,
  Check,
  Clock,
  Filter,
  FileCode,
  Lock,
  GitPullRequest,
  User,
} from 'lucide-react';
import { useDaybreakData } from '../data/source';
import { SpotlightCard } from '../components/reactbits/SpotlightCard';

export const AuditTrail: React.FC = () => {
  const { data } = useDaybreakData();
  const { ledger } = data;

  const [copiedDigest, setCopiedDigest] = useState<string | null>(null);
  const [filterAction, setFilterAction] = useState<string>('all');

  const decisions = ledger.decisions || [];
  const executed = ledger.executed || {};

  const handleCopyDigest = (digest: string) => {
    navigator.clipboard.writeText(digest);
    setCopiedDigest(digest);
    setTimeout(() => setCopiedDigest(null), 2000);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(ledger, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daybreak-ledger-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredDecisions = decisions.filter((d) => {
    if (filterAction !== 'all' && d.action !== filterAction) return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-accent-amber mb-1">
            <History className="h-3.5 w-3.5" />
            <span>STANDUP ZERO · AUDIT LEDGER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            Append-Only Audit Trail
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Recorded human decisions, SHA-256 action digest checks, and write execution log.
          </p>
        </div>

        <button
          type="button"
          onClick={exportJSON}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface-2 text-text-primary hover:bg-surface-3 border border-border text-xs font-semibold transition-colors shadow-xs"
        >
          <Download className="h-3.5 w-3.5 text-accent-amber" />
          <span>Export Ledger (JSON)</span>
        </button>
      </div>

      {/* Security Architecture Explainer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <SpotlightCard className="p-4 border border-border/80 space-y-1.5 shadow-xs">
          <div className="font-bold text-text-primary flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-status-success" />
            <span>SHA-256 Action Digest</span>
          </div>
          <p className="text-text-muted text-[11px] leading-relaxed">
            Every human approval locks a hash of the proposal's ID, target, repo, and action bodies. Modified actions fail execution.
          </p>
        </SpotlightCard>

        <SpotlightCard className="p-4 border border-border/80 space-y-1.5 shadow-xs">
          <div className="font-bold text-text-primary flex items-center gap-2">
            <FileCode className="h-4 w-4 text-accent-amber" />
            <span>Idempotency Markers</span>
          </div>
          <p className="text-text-muted text-[11px] leading-relaxed">
            GitHub comments carry an invisible <code className="font-mono text-accent-amber">&lt;!-- daybreak:id --&gt;</code> HTML comment to ensure zero duplicate pings upon re-runs.
          </p>
        </SpotlightCard>

        <SpotlightCard className="p-4 border border-border/80 space-y-1.5 shadow-xs">
          <div className="font-bold text-text-primary flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent-coral" />
            <span>Write-Ahead Lock</span>
          </div>
          <p className="text-text-muted text-[11px] leading-relaxed">
            Intent is written to disk before network calls. Network crashes leave a pending marker requiring inspection rather than blind retries.
          </p>
        </SpotlightCard>
      </div>

      {/* Decisions Timeline */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-text-primary">Recorded Human Decisions</h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-surface-3 text-text-primary border border-border">
              {filteredDecisions.length} records
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="h-3.5 w-3.5 text-text-muted" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="bg-surface-2 text-text-primary px-3 py-1.5 rounded-lg border border-border text-xs focus:outline-none"
            >
              <option value="all">Filter: All Decisions</option>
              <option value="approve">Approved</option>
              <option value="skip">Skipped</option>
              <option value="snooze">Snoozed</option>
            </select>
          </div>
        </div>

        {filteredDecisions.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-border bg-surface-1/40 text-xs text-text-muted">
            No decisions matching criteria recorded in ledger.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
            {filteredDecisions.map((dec, idx) => {
              const isExec = executed[dec.id];
              return (
                <div key={idx} className="relative group">
                  {/* Timeline dot */}
                  <span
                    className={`absolute -left-6 top-2 h-5 w-5 rounded-full border-2 border-surface-0 flex items-center justify-center ${
                      dec.action === 'approve'
                        ? 'bg-status-success text-black'
                        : dec.action === 'snooze'
                        ? 'bg-accent-violet text-white'
                        : 'bg-text-muted text-white'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-surface-0" />
                  </span>

                  <SpotlightCard className="p-4 rounded-xl border border-border/80 space-y-3 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            dec.action === 'approve'
                              ? 'bg-status-success/15 text-status-success border-status-success/30'
                              : dec.action === 'snooze'
                              ? 'bg-accent-violet/15 text-accent-violet border-accent-violet/30'
                              : 'bg-surface-3 text-text-muted border-border'
                          }`}
                        >
                          {dec.action}
                        </span>
                        <a
                          href={dec.target.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs font-bold text-accent-amber hover:underline flex items-center gap-1"
                        >
                          <GitPullRequest className="h-3 w-3" />
                          <span>
                            {dec.target.kind.toUpperCase()} #{dec.target.number}
                          </span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                        <span className="text-xs text-text-muted font-mono flex items-center gap-1">
                          <User className="h-3 w-3" /> by @{dec.approver}
                        </span>
                      </div>

                      <span className="text-xs font-mono text-text-muted">
                        {new Date(dec.time).toLocaleString()}
                      </span>
                    </div>

                    {/* SHA-256 Digest Box */}
                    <div className="text-xs font-mono text-text-secondary bg-surface-2/80 p-2.5 rounded-lg border border-border flex items-center justify-between gap-3 overflow-hidden shadow-inner">
                      <div className="truncate flex items-center gap-2">
                        <Lock className="h-3.5 w-3.5 text-accent-amber shrink-0" />
                        <span className="text-text-muted font-bold text-[10px]">SHA-256:</span>
                        <span className="text-text-primary select-all text-[11px] truncate">{dec.digest}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyDigest(dec.digest)}
                        title="Copy SHA-256 Digest"
                        className="text-text-muted hover:text-text-primary p-1.5 rounded hover:bg-surface-3 shrink-0 transition-colors"
                      >
                        {copiedDigest === dec.digest ? (
                          <Check className="h-3.5 w-3.5 text-status-success" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Execution status */}
                    {isExec ? (
                      <div className="flex items-center justify-between text-xs pt-1 text-status-success font-medium">
                        <span className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5" />
                          <span>Executed to GitHub at {new Date(isExec.time).toLocaleTimeString()}</span>
                        </span>
                        {isExec.result_urls?.length > 0 && (
                          <a
                            href={isExec.result_urls[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[11px] underline flex items-center gap-1 hover:text-white"
                          >
                            <span>Inspect comment</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-text-muted flex items-center gap-1 pt-1">
                        <span>Status: {dec.action === 'approve' ? 'Approved, queued for execution' : 'Recorded'}</span>
                      </div>
                    )}
                  </SpotlightCard>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
