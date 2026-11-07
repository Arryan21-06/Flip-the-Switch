import React from 'react';
import {
  Sliders,
  Clock,
  Shield,
  Layers,
  Users,
  Info,
} from 'lucide-react';
import { useDaybreakData, getRuleSetCommand } from '../data/source';
import { SpotlightCard } from '../components/reactbits/SpotlightCard';
import { CopyButton } from '../components/CopyButton';

export const RulesView: React.FC = () => {
  const { data } = useDaybreakData();
  const { rules } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-accent-amber mb-1">
            <Sliders className="h-3.5 w-3.5" />
            <span>STANDUP ZERO · CONFIGURATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Active Rulebook & Thresholds
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Live governing rules for SLA checks, quiet hours, nudge limits, and early warning scoring.
          </p>
        </div>
      </div>

      {/* Read-Only Notice */}
      <div className="p-4 rounded-xl border border-border bg-surface-1 flex items-start gap-3">
        <Info className="h-5 w-5 text-accent-amber shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-text-primary">
            Read-Only Rule Inspector
          </p>
          <p className="text-text-secondary leading-relaxed">
            Rules are stored in <code className="font-mono text-accent-amber">state/rules.json</code> and edited via chat commands in the Switch room using <code className="font-mono">rules set &lt;key&gt; &lt;val&gt;</code>. Use the copy buttons below to copy commands.
          </p>
        </div>
      </div>

      {/* 24-Hour Visual Timeline */}
      <SpotlightCard className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent-amber" />
              <span>24-Hour Schedule & Quiet Hours Window</span>
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Timezone: <span className="font-mono text-text-primary">{rules.timezone}</span>
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-status-success/30 border border-status-success" />
              <span>Active (09:00–20:00)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-accent-coral/30 border border-accent-coral" />
              <span>Quiet ({rules.quiet_hours.start}–{rules.quiet_hours.end})</span>
            </div>
          </div>
        </div>

        {/* 24h Bar representation */}
        <div className="space-y-1 pt-2">
          <div className="h-7 w-full rounded-lg bg-surface-2 border border-border flex overflow-hidden text-[10px] font-mono select-none">
            {/* 00:00 - 09:00: Quiet */}
            <div
              style={{ width: `${(9 / 24) * 100}%` }}
              className="bg-accent-coral/20 border-r border-accent-coral/40 flex items-center justify-center text-accent-coral font-semibold"
            >
              Quiet (00–09)
            </div>
            {/* 09:00 - 20:00: Active */}
            <div
              style={{ width: `${(11 / 24) * 100}%` }}
              className="bg-status-success/15 border-r border-status-success/40 flex items-center justify-center text-status-success font-semibold"
            >
              Active Daybreak Window (09:00–20:00)
            </div>
            {/* 20:00 - 24:00: Quiet */}
            <div
              style={{ width: `${(4 / 24) * 100}%` }}
              className="bg-accent-coral/20 flex items-center justify-center text-accent-coral font-semibold"
            >
              Quiet (20–24)
            </div>
          </div>

          <div className="flex justify-between text-[10px] font-mono text-text-muted px-1">
            <span>00:00</span>
            <span>06:00</span>
            <span>09:00 (Wake)</span>
            <span>12:00</span>
            <span>17:00 (Fri Cutoff)</span>
            <span>20:00 (Quiet)</span>
            <span>24:00</span>
          </div>
        </div>

        <div className="text-xs text-text-muted pt-2 border-t border-border flex flex-wrap gap-4">
          <span>Friday Cutoff: <strong className="text-text-primary font-mono">{rules.quiet_hours.friday_cutoff}</strong> (no new pings before weekend)</span>
          <span>Night Lockout: <strong className="text-text-primary font-mono">20:00 to 09:00</strong></span>
        </div>
      </SpotlightCard>

      {/* Threshold Grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stuck Thresholds */}
        <SpotlightCard className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h2 className="text-sm font-bold text-text-primary">Stuck SLA Limits</h2>
            <Clock className="h-4 w-4 text-status-warning" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Review SLA</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-text-primary">
                  {rules.stuck.review_sla_hours} hours
                </span>
                <CopyButton
                  command={getRuleSetCommand('stuck.review_sla_hours', rules.stuck.review_sla_hours)}
                  size="sm"
                  variant="subtle"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-muted">Red CI Tolerance</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-text-primary">
                  {rules.stuck.red_ci_hours} hours
                </span>
                <CopyButton
                  command={getRuleSetCommand('stuck.red_ci_hours', rules.stuck.red_ci_hours)}
                  size="sm"
                  variant="subtle"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-muted">Approved Unmerged</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-text-primary">
                  {rules.stuck.approved_unmerged_hours} hours
                </span>
                <CopyButton
                  command={getRuleSetCommand('stuck.approved_unmerged_hours', rules.stuck.approved_unmerged_hours)}
                  size="sm"
                  variant="subtle"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-muted">Stale Issue Days</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-text-primary">
                  {rules.stuck.stale_issue_days} days
                </span>
                <CopyButton
                  command={getRuleSetCommand('stuck.stale_issue_days', rules.stuck.stale_issue_days)}
                  size="sm"
                  variant="subtle"
                />
              </div>
            </div>
          </div>
        </SpotlightCard>

        {/* Early Warning Rules */}
        <SpotlightCard className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h2 className="text-sm font-bold text-text-primary">Early Warning Signals</h2>
            <Layers className="h-4 w-4 text-accent-coral" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Grace Hours (No Reviewer)</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-text-primary">
                  {rules.early_warning.grace_hours} hours
                </span>
                <CopyButton
                  command={getRuleSetCommand('early_warning.grace_hours', 0)}
                  label="set to 0"
                  size="sm"
                  variant="subtle"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-muted">Workload PR Count</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-text-primary">
                  ≥ {rules.early_warning.workload_open_prs} PRs
                </span>
                <CopyButton
                  command={getRuleSetCommand('early_warning.workload_open_prs', rules.early_warning.workload_open_prs)}
                  size="sm"
                  variant="subtle"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-muted">Dependency Weight</span>
              <span className="font-mono font-bold text-text-primary">
                +{rules.early_warning.points.dependency} pts
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-muted">No Reviewer Weight</span>
              <span className="font-mono font-bold text-text-primary">
                +{rules.early_warning.points.no_reviewer} pts
              </span>
            </div>
          </div>
        </SpotlightCard>

        {/* Limits & Guards */}
        <SpotlightCard className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h2 className="text-sm font-bold text-text-primary">Daily Rate Limits</h2>
            <Shield className="h-4 w-4 text-status-success" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Max Nudges / Person / Day</span>
              <span className="font-mono font-bold text-text-primary">
                {rules.limits.max_nudges_per_person_per_day}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-muted">Max Stuck Proposals</span>
              <span className="font-mono font-bold text-text-primary">
                {rules.limits.max_stuck_proposals}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-muted">Max Warning Proposals</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-text-primary">
                  {rules.limits.max_warning_proposals}
                </span>
                <CopyButton
                  command={getRuleSetCommand('limits.max_warning_proposals', 1)}
                  label="set to 1"
                  size="sm"
                  variant="subtle"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-muted">Standup Duration Budget</span>
              <span className="font-mono font-bold text-text-primary">
                {rules.standup_minutes} minutes
              </span>
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* Team Roster & Reviewers */}
      <SpotlightCard className="p-6 space-y-4">
        <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <Users className="h-4 w-4 text-accent-amber" />
          <span>Eligible Reviewers & Team Members</span>
        </h2>

        <div className="flex flex-wrap gap-2 pt-2">
          {rules.reviewers.map((rev) => (
            <div
              key={rev}
              className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs font-mono flex items-center gap-2"
            >
              <span className="h-2 w-2 rounded-full bg-accent-amber" />
              <span>@{rev}</span>
              <span className="text-[10px] text-text-muted font-sans font-medium uppercase">
                Reviewer
              </span>
            </div>
          ))}
          {rules.team.map((member) => (
            <div
              key={member.github}
              className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs font-mono flex items-center gap-2"
            >
              <span className="h-2 w-2 rounded-full bg-surface-3" />
              <span>@{member.github}</span>
              <span className="text-[10px] text-text-muted font-sans font-medium">
                ({member.name})
              </span>
            </div>
          ))}
        </div>
      </SpotlightCard>
    </div>
  );
};
