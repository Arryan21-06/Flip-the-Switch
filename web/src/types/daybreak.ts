export type DataSourceMode = 'demo' | 'live';

export interface Meta {
  repo: string;
  now: string;
  since?: string;
  window_hours?: number;
  source: 'fixture' | 'github';
}

export interface Target {
  kind: 'pr' | 'issue';
  number: number;
  url: string;
}

export type ActionKind = 'comment' | 'request_review';

export interface ProposalAction {
  kind: ActionKind;
  number: number;
  person: string;
  target: 'pr' | 'issue';
  url: string;
  body?: string;
}

export interface Reason {
  text: string;
  url: string;
}

export type ProposalSeverity = 'stuck' | 'warning';
export type ProposalTier = 'Watch' | 'At risk' | 'High' | null;
export type ProposalStatus = 'proposed' | 'approved' | 'skipped' | 'snoozed' | 'executed' | 'failed';

export interface Proposal {
  id: string;
  index: number | null;
  type: string;
  severity: ProposalSeverity;
  tier?: ProposalTier;
  points?: number | null;
  person: string;
  repo?: string;
  source?: 'fixture' | 'github';
  status: ProposalStatus;
  summary: string;
  target: Target;
  reasons: Reason[];
  actions: ProposalAction[];
  signals?: string[];
  over_hours?: number | null;
  decided_by?: string | null;
  decided_at?: string | null;
  snooze_until?: string | null;
  executed_at?: string | null;
  result_urls?: string[];
  action_results?: Array<{
    status: 'executed' | 'budget_skipped' | 'pending' | 'failed' | 'dry_run';
    url?: string;
    person?: string;
    time?: string;
    budget_day?: string;
    error?: string;
  }>;
  active?: boolean;
}

export interface BriefItem {
  number: number;
  title: string;
  url: string;
}

export interface BriefMember {
  github?: string;
  name: string;
  chat: string;
  login?: string;
  yesterday?: BriefItem[];
  today?: BriefItem[];
  reviewed?: BriefItem[];
  opened?: BriefItem[];
  merged?: BriefItem[];
  open_prs?: BriefItem[];
  assigned_issues?: BriefItem[];
  commits?: Array<{
    sha?: string;
    message?: string;
    url?: string;
  }>;
}

export interface BriefData {
  meta: Meta;
  people: BriefMember[];
}

export interface TeamMember {
  chat: string;
  github: string;
  name: string;
}

export interface Rules {
  approvers: string[];
  reviewers: string[];
  standup_minutes: number;
  timezone: string;
  team: TeamMember[];
  limits: {
    max_nudges_per_person_per_day: number;
    max_stuck_proposals: number;
    max_warning_proposals: number;
  };
  quiet_hours: {
    start: string;
    end: string;
    friday_cutoff: string;
  };
  stuck: {
    approved_unmerged_hours: number;
    red_ci_hours: number;
    review_sla_hours: number;
    stale_issue_days: number;
  };
  early_warning: {
    grace_hours: number;
    workload_open_prs: number;
    points: {
      dependency: number;
      no_reviewer: number;
      workload: number;
    };
  };
}

export interface MetricRecord {
  flags_approved: number;
  flags_skipped_likely_false_positives: number;
  flags_snoozed: number;
  median_first_review_wait_hours: number | null;
  resolution_unknown: number;
  reviewed_prs: number;
  standup_minutes_saved_assumption: number;
  stuck_items_resolved: number;
  week: string;
  working_days_observed: number;
}

export interface MetricsData {
  assumption: string;
  baseline: MetricRecord;
  current: MetricRecord;
  evidence: string[];
  seeded?: boolean;
}

export interface LedgerDecision {
  id: string;
  action: 'approve' | 'skip' | 'snooze';
  approver: string;
  time: string;
  type: string;
  target: Target;
  digest: string;
}

export interface LedgerExecutedRecord {
  time: string;
  approver: string;
  result_urls: string[];
  type: string;
  target: Target;
  rules: Partial<Rules>;
}

export interface Ledger {
  executed: Record<string, LedgerExecutedRecord>;
  nudges: Record<string, Record<string, number>>;
  decisions: LedgerDecision[];
  actions: Record<string, Record<string, {
    status: 'executed' | 'budget_skipped' | 'pending' | 'failed' | 'dry_run';
    url?: string;
    person?: string;
    time?: string;
    budget_day?: string;
    error?: string;
  }>>;
  budget_skips: Array<{
    id: string;
    action: number;
    person: string;
    time: string;
  }>;
}

export interface DoctorCheck {
  message: string;
  status: 'PASS' | 'FAIL';
}

export interface DoctorResult {
  checks: DoctorCheck[];
  passed: boolean;
}

export interface SuppressedItem {
  reason: string;
  target: Target;
  points?: number;
  rule_limit?: number;
}

export interface WatchingItem extends Proposal {}

export interface AnalysisData {
  meta: Meta;
  proposals: Proposal[];
  suppressed?: SuppressedItem[];
  watching?: WatchingItem[];
}

export interface DaybreakDataset {
  mode: DataSourceMode;
  analysis: AnalysisData;
  brief: BriefData;
  rules: Rules;
  ledger: Ledger;
  metrics: MetricsData;
  doctor: DoctorResult;
  lastUpdated: string;
}
