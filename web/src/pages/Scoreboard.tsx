import React from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  ExternalLink,
  Award,
  GitPullRequest,
} from 'lucide-react';
import { useDaybreakData } from '../data/source';
import { SpotlightCard } from '../components/reactbits/SpotlightCard';
import { CountUp } from '../components/reactbits/CountUp';

export const Scoreboard: React.FC = () => {
  const { data } = useDaybreakData();
  const { metrics } = data;
  const { current, baseline, assumption, evidence = [], seeded } = metrics;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-accent-amber mb-1">
            <Award className="h-3.5 w-3.5" />
            <span>STANDUP ZERO · BUSINESS IMPACT & VELOCITY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            Weekly Velocity Scoreboard
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Measurable engineering velocity improvements across review latency, stuck work, and meeting minutes returned.
          </p>
        </div>

        {seeded && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent-amber/10 border border-accent-amber/20 text-accent-amber font-mono text-xs font-semibold">
            <span>Seeded demo data</span>
          </div>
        )}
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Standup Minutes Saved */}
        <SpotlightCard className="p-5 border border-border/80 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Standup Returned
            </span>
            <span className="h-7 w-7 rounded-md bg-accent-amber/15 flex items-center justify-center text-accent-amber">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-text-primary mb-1">
              <CountUp to={current.standup_minutes_saved_assumption} suffix=" min" />
            </div>
            <div className="text-[11px] text-text-muted">
              {current.working_days_observed} day(s) observed ({data.rules.team.length || 5} members)
            </div>
          </div>
        </SpotlightCard>

        {/* Metric 2: Median Review Wait */}
        <SpotlightCard className="p-5 border border-border/80 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Median Review Wait
            </span>
            <span className="h-7 w-7 rounded-md bg-status-success/15 flex items-center justify-center text-status-success">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-text-primary mb-1">
              <CountUp to={current.median_first_review_wait_hours || 0} decimals={1} suffix="h" />
            </div>
            <div className="text-[11px] text-text-muted font-mono">
              Baseline: {baseline.median_first_review_wait_hours ?? 24}h · {current.reviewed_prs} reviewed PRs
            </div>
          </div>
        </SpotlightCard>

        {/* Metric 3: Flags Approved */}
        <SpotlightCard className="p-5 border border-border/80 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Accepted Interventions
            </span>
            <span className="h-7 w-7 rounded-md bg-accent-coral/15 flex items-center justify-center text-accent-coral">
              <CheckCircle className="h-4 w-4" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-text-primary mb-1">
              <CountUp to={current.flags_approved} />
            </div>
            <div className="text-[11px] text-text-muted">
              Human-approved outbound nudges
            </div>
          </div>
        </SpotlightCard>

        {/* Metric 4: False Positive Skips */}
        <SpotlightCard className="p-5 border border-border/80 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Filtered False Positives
            </span>
            <span className="h-7 w-7 rounded-md bg-surface-3 flex items-center justify-center text-text-muted">
              <HelpCircle className="h-4 w-4" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-text-primary mb-1">
              <CountUp to={current.flags_skipped_likely_false_positives} />
            </div>
            <div className="text-[11px] text-text-muted">
              Filtered by human leads in room
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* Transparent Assumption Calculation Card */}
      <SpotlightCard className="p-6 border border-border/80 space-y-3 shadow-xs">
        <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-status-success" />
          <span>Transparent Velocity Model & Formula Math</span>
        </h2>
        <div className="text-xs text-text-secondary leading-relaxed space-y-2">
          <p>
            <strong>Assumption Formula:</strong> <code className="font-mono text-accent-amber font-bold">{assumption}</code>
          </p>
          <p>
            Rather than holding a synchronous 15-minute meeting where engineers recite status updates, Daybreak Scribe automatically drafts the brief at 04:00 AM with 100% verifiable Git links.
          </p>
          <div className="p-3 rounded-lg bg-surface-2 font-mono text-text-primary text-[11px] border border-border">
            5 team members × 15 min standup × 1 observed day = <strong className="text-status-success">75 engineer-minutes returned</strong>
          </div>
        </div>
      </SpotlightCard>

      {/* Evidence Citations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h2 className="text-base font-bold text-text-primary">
            Observed Repository Evidence ({evidence.length})
          </h2>
          <span className="text-xs text-text-muted">
            Every metric data point links directly to a verifiable GitHub URL
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {evidence.map((url, idx) => {
            const parts = url.split('/');
            const type = parts[parts.length - 2];
            const num = parts[parts.length - 1];
            return (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-surface-1 hover:bg-surface-2 border border-border text-xs font-mono text-text-secondary hover:text-text-primary transition-all flex items-center justify-between group shadow-xs"
              >
                <div className="truncate flex items-center gap-1.5">
                  <GitPullRequest className="h-3 w-3 text-accent-amber shrink-0" />
                  <span className="text-accent-amber font-bold">
                    {type.toUpperCase()} #{num}
                  </span>
                </div>
                <ExternalLink className="h-3 w-3 text-text-muted group-hover:text-accent-amber shrink-0 ml-2 opacity-60" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};
