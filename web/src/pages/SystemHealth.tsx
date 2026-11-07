import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { useDaybreakData } from '../data/source';
import { SpotlightCard } from '../components/reactbits/SpotlightCard';

export const SystemHealth: React.FC = () => {
  const { data, refetch } = useDaybreakData();
  const { doctor } = data;
  const checks = doctor.checks || [];

  const passedCount = checks.filter((c) => c.status === 'PASS').length;
  const failedCount = checks.filter((c) => c.status === 'FAIL').length;

  const getRemediation = (message: string): string | null => {
    if (message.includes('gh installed and authenticated')) {
      return 'Run "gh auth login" in your terminal to authenticate GitHub CLI with repo access.';
    }
    if (message.includes('DAYBREAK_REPO readable')) {
      return 'Set "export DAYBREAK_REPO=owner/repo" in your shell or define it in ~/.daybreak/config.json.';
    }
    if (message.includes('ALLOW_WRITE flag state')) {
      return 'Export "DAYBREAK_ALLOW_WRITE=0" for read-only safety, or "=1" when running live write execution tests.';
    }
    if (message.includes('MATTERMOST_WEBHOOK_URL')) {
      return 'Configure MATTERMOST_WEBHOOK_URL=https://... if testing Mattermost standup triggers.';
    }
    if (message.includes('Python version')) {
      return 'Python 3.11+ is required. Ensure your virtualenv uses a modern Python.';
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-accent-amber mb-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>STANDUP ZERO · DIAGNOSTICS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            System Health & Diagnostics
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Live output of <code className="font-mono text-text-primary">daybreak doctor</code> validating Python, CLI tools, repository access, and permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface-2 text-text-primary hover:bg-surface-3 border border-border text-xs font-medium transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Re-run Doctor Check</span>
        </button>
      </div>

      {/* Overall Status Banner */}
      <div
        className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${
          doctor.passed
            ? 'bg-status-success/10 border-status-success/30 text-status-success'
            : 'bg-status-danger/10 border-status-danger/30 text-status-danger'
        }`}
      >
        <div className="flex items-center gap-3">
          {doctor.passed ? (
            <CheckCircle2 className="h-6 w-6 shrink-0" />
          ) : (
            <AlertTriangle className="h-6 w-6 shrink-0" />
          )}
          <div>
            <h2 className="text-base font-bold text-text-primary">
              {doctor.passed
                ? 'All Diagnostics Passing (Exit Code 0)'
                : `${failedCount} Diagnostic Check${failedCount > 1 ? 's' : ''} Require Attention (Exit Code 3)`}
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              {passedCount} passed · {failedCount} failed
            </p>
          </div>
        </div>

        <div className="font-mono text-xs px-3 py-1 rounded-md bg-surface-1/80 border border-border text-text-secondary">
          daybreak doctor --json
        </div>
      </div>

      {/* Checks List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
          Diagnostic Verification Items
        </h2>

        <div className="space-y-3">
          {checks.map((check, idx) => {
            const isPass = check.status === 'PASS';
            const remediation = !isPass ? getRemediation(check.message) : null;

            return (
              <SpotlightCard
                key={idx}
                className="p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        isPass
                          ? 'bg-status-success/15 text-status-success border-status-success/30'
                          : 'bg-status-danger/15 text-status-danger border-status-danger/30'
                      }`}
                    >
                      {check.status}
                    </span>
                    <span className="text-xs font-mono text-text-primary font-medium">
                      {check.message}
                    </span>
                  </div>

                  {remediation && (
                    <div className="text-xs text-text-muted pt-1 flex items-start gap-1.5">
                      <Terminal className="h-3.5 w-3.5 text-accent-amber shrink-0 mt-0.5" />
                      <span>{remediation}</span>
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  {isPass ? (
                    <CheckCircle2 className="h-4 w-4 text-status-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-status-danger" />
                  )}
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};

