import { DaybreakDataset, AnalysisData, BriefData, Rules, Ledger, MetricsData, DoctorResult } from '../types/daybreak';

export const DEMO_ANALYSIS: AnalysisData = {
  "meta": {
    "now": "2026-11-10T04:00:00Z",
    "repo": "acme/shop",
    "source": "fixture"
  },
  "proposals": [
    {
      "actions": [
        {
          "body": "Hi @sam, Issue #30 stale, 96h since update (limit 72h), assigned @sam. Could you share an update when convenient? https://github.com/acme/shop/issues/30",
          "kind": "comment",
          "number": 30,
          "person": "sam",
          "target": "issue",
          "url": "https://github.com/acme/shop/issues/30"
        }
      ],
      "decided_at": null,
      "decided_by": null,
      "executed_at": null,
      "id": "nudge-stale-issue30-2026-11-10",
      "index": 1,
      "over_hours": 24.0,
      "person": "sam",
      "points": null,
      "reasons": [
        {
          "text": "Issue #30 stale, 96h since update (limit 72h), assigned @sam",
          "url": "https://github.com/acme/shop/issues/30"
        }
      ],
      "repo": "acme/shop",
      "result_urls": [],
      "severity": "stuck",
      "snooze_until": null,
      "source": "fixture",
      "status": "proposed",
      "summary": "Issue #30 stale, 96h since update (limit 72h), assigned @sam",
      "target": {
        "kind": "issue",
        "number": 30,
        "url": "https://github.com/acme/shop/issues/30"
      },
      "tier": null,
      "type": "stale_issue"
    },
    {
      "actions": [
        {
          "body": "Hi @arjun, PR #42 waiting 31h for @arjun (SLA 24h). Could you share an update when convenient? https://github.com/acme/shop/pull/42",
          "kind": "comment",
          "number": 42,
          "person": "arjun",
          "target": "pr",
          "url": "https://github.com/acme/shop/pull/42"
        }
      ],
      "decided_at": null,
      "decided_by": null,
      "executed_at": null,
      "id": "nudge-review-pr42-2026-11-10",
      "index": 2,
      "over_hours": 7.0,
      "person": "arjun",
      "points": null,
      "reasons": [
        {
          "text": "PR #42 waiting 31h for @arjun (SLA 24h)",
          "url": "https://github.com/acme/shop/pull/42"
        }
      ],
      "repo": "acme/shop",
      "result_urls": [],
      "severity": "stuck",
      "snooze_until": null,
      "source": "fixture",
      "status": "proposed",
      "summary": "PR #42 waiting 31h for @arjun (SLA 24h)",
      "target": {
        "kind": "pr",
        "number": 42,
        "url": "https://github.com/acme/shop/pull/42"
      },
      "tier": null,
      "type": "review_stuck"
    },
    {
      "actions": [
        {
          "body": "Hi @arjun, PR #39 approved 26h ago, not merged (limit 24h). Could you share an update when convenient? https://github.com/acme/shop/pull/39",
          "kind": "comment",
          "number": 39,
          "person": "arjun",
          "target": "pr",
          "url": "https://github.com/acme/shop/pull/39"
        }
      ],
      "decided_at": null,
      "decided_by": null,
      "executed_at": null,
      "id": "nudge-merge-pr39-2026-11-10",
      "index": 3,
      "over_hours": 2.0,
      "person": "arjun",
      "points": null,
      "reasons": [
        {
          "text": "PR #39 approved 26h ago, not merged (limit 24h)",
          "url": "https://github.com/acme/shop/pull/39"
        }
      ],
      "repo": "acme/shop",
      "result_urls": [],
      "severity": "stuck",
      "snooze_until": null,
      "source": "fixture",
      "status": "proposed",
      "summary": "PR #39 approved 26h ago, not merged (limit 24h)",
      "target": {
        "kind": "pr",
        "number": 39,
        "url": "https://github.com/acme/shop/pull/39"
      },
      "tier": null,
      "type": "approved_unmerged"
    },
    {
      "actions": [
        {
          "body": "Hi @meera, PR #45 CI red for 14h (limit 12h). Could you share an update when convenient? https://github.com/acme/shop/pull/45",
          "kind": "comment",
          "number": 45,
          "person": "meera",
          "target": "pr",
          "url": "https://github.com/acme/shop/pull/45"
        }
      ],
      "decided_at": null,
      "decided_by": null,
      "executed_at": null,
      "id": "nudge-ci-pr45-2026-11-10",
      "index": 4,
      "over_hours": 2.0,
      "person": "meera",
      "points": null,
      "reasons": [
        {
          "text": "PR #45 CI red for 14h (limit 12h)",
          "url": "https://github.com/acme/shop/pull/45"
        }
      ],
      "repo": "acme/shop",
      "result_urls": [],
      "severity": "stuck",
      "snooze_until": null,
      "source": "fixture",
      "status": "proposed",
      "summary": "PR #45 CI red for 14h (limit 12h)",
      "target": {
        "kind": "pr",
        "number": 45,
        "url": "https://github.com/acme/shop/pull/45"
      },
      "tier": null,
      "type": "ci_red"
    },
    {
      "actions": [
        {
          "kind": "request_review",
          "number": 52,
          "person": "meera",
          "target": "pr",
          "url": "https://github.com/acme/shop/pull/52"
        },
        {
          "body": "Hi @priya, PR #52 depends on this item. Could you share an ETA? https://github.com/acme/shop/pull/52 https://github.com/acme/shop/pull/48",
          "kind": "comment",
          "number": 48,
          "person": "priya",
          "target": "pr",
          "url": "https://github.com/acme/shop/pull/48"
        }
      ],
      "decided_at": null,
      "decided_by": null,
      "executed_at": null,
      "id": "warn-pr52-2026-11-10",
      "index": 5,
      "over_hours": null,
      "person": "sam",
      "points": 65,
      "reasons": [
        {
          "text": "No reviewer requested, open 5h",
          "url": "https://github.com/acme/shop/pull/52"
        },
        {
          "text": "Author has 3 other open PRs; includes #47",
          "url": "https://github.com/acme/shop/pull/47"
        },
        {
          "text": "Author has 3 other open PRs; includes #49",
          "url": "https://github.com/acme/shop/pull/49"
        },
        {
          "text": "Author has 3 other open PRs; includes #50",
          "url": "https://github.com/acme/shop/pull/50"
        },
        {
          "text": "Depends on #48, still open",
          "url": "https://github.com/acme/shop/pull/48"
        }
      ],
      "repo": "acme/shop",
      "result_urls": [],
      "severity": "warning",
      "signals": [
        "no_reviewer",
        "workload",
        "dependency"
      ],
      "snooze_until": null,
      "source": "fixture",
      "status": "proposed",
      "summary": "PR #52 HIGH flag (3 signals, 65 points)",
      "target": {
        "kind": "pr",
        "number": 52,
        "url": "https://github.com/acme/shop/pull/52"
      },
      "tier": "High",
      "type": "early_warning"
    }
  ],
  "suppressed": [],
  "watching": [
    {
      "actions": [],
      "decided_at": null,
      "decided_by": null,
      "executed_at": null,
      "id": "warn-pr47-2026-11-10",
      "index": null,
      "over_hours": null,
      "person": "sam",
      "points": 20,
      "reasons": [
        {
          "text": "Author has 3 other open PRs; includes #49",
          "url": "https://github.com/acme/shop/pull/49"
        },
        {
          "text": "Author has 3 other open PRs; includes #50",
          "url": "https://github.com/acme/shop/pull/50"
        },
        {
          "text": "Author has 3 other open PRs; includes #52",
          "url": "https://github.com/acme/shop/pull/52"
        }
      ],
      "result_urls": [],
      "severity": "warning",
      "signals": [
        "workload"
      ],
      "snooze_until": null,
      "status": "proposed",
      "summary": "PR #47 WATCH flag (1 signals, 20 points)",
      "target": {
        "kind": "pr",
        "number": 47,
        "url": "https://github.com/acme/shop/pull/47"
      },
      "tier": "Watch",
      "type": "early_warning"
    },
    {
      "actions": [],
      "decided_at": null,
      "decided_by": null,
      "executed_at": null,
      "id": "warn-pr49-2026-11-10",
      "index": null,
      "over_hours": null,
      "person": "sam",
      "points": 20,
      "reasons": [
        {
          "text": "Author has 3 other open PRs; includes #47",
          "url": "https://github.com/acme/shop/pull/47"
        },
        {
          "text": "Author has 3 other open PRs; includes #50",
          "url": "https://github.com/acme/shop/pull/50"
        },
        {
          "text": "Author has 3 other open PRs; includes #52",
          "url": "https://github.com/acme/shop/pull/52"
        }
      ],
      "result_urls": [],
      "severity": "warning",
      "signals": [
        "workload"
      ],
      "snooze_until": null,
      "status": "proposed",
      "summary": "PR #49 WATCH flag (1 signals, 20 points)",
      "target": {
        "kind": "pr",
        "number": 49,
        "url": "https://github.com/acme/shop/pull/49"
      },
      "tier": "Watch",
      "type": "early_warning"
    },
    {
      "actions": [],
      "decided_at": null,
      "decided_by": null,
      "executed_at": null,
      "id": "warn-pr50-2026-11-10",
      "index": null,
      "over_hours": null,
      "person": "sam",
      "points": 20,
      "reasons": [
        {
          "text": "Author has 3 other open PRs; includes #47",
          "url": "https://github.com/acme/shop/pull/47"
        },
        {
          "text": "Author has 3 other open PRs; includes #49",
          "url": "https://github.com/acme/shop/pull/49"
        },
        {
          "text": "Author has 3 other open PRs; includes #52",
          "url": "https://github.com/acme/shop/pull/52"
        }
      ],
      "result_urls": [],
      "severity": "warning",
      "signals": [
        "workload"
      ],
      "snooze_until": null,
      "status": "proposed",
      "summary": "PR #50 WATCH flag (1 signals, 20 points)",
      "target": {
        "kind": "pr",
        "number": 50,
        "url": "https://github.com/acme/shop/pull/50"
      },
      "tier": "Watch",
      "type": "early_warning"
    }
  ]
};

export const DEMO_BRIEF: BriefData = {
  "meta": {
    "now": "2026-11-10T04:00:00Z",
    "repo": "acme/shop",
    "since": "2026-11-09T04:00:00Z",
    "source": "fixture",
    "window_hours": 24.0
  },
  "people": [
    {
      "assigned_issues": [
        {
          "number": 31,
          "title": "Review docs",
          "url": "https://github.com/acme/shop/issues/31"
        }
      ],
      "chat": "arjun",
      "commits": [
        {
          "message": "Update 4",
          "sha": "abc004",
          "url": "https://github.com/acme/shop/commit/abc004"
        },
        {
          "message": "Update 5",
          "sha": "abc005",
          "url": "https://github.com/acme/shop/commit/abc005"
        }
      ],
      "login": "arjun",
      "merged": [],
      "name": "Arjun",
      "open_prs": [
        {
          "number": 39,
          "title": "Work item 39",
          "url": "https://github.com/acme/shop/pull/39"
        }
      ],
      "opened": [],
      "reviewed": []
    },
    {
      "assigned_issues": [],
      "chat": "lead",
      "commits": [],
      "login": "lead",
      "merged": [],
      "name": "Lead",
      "open_prs": [
        {
          "number": 46,
          "title": "Work item 46",
          "url": "https://github.com/acme/shop/pull/46"
        },
        {
          "number": 54,
          "title": "Work item 54",
          "url": "https://github.com/acme/shop/pull/54"
        }
      ],
      "opened": [
        {
          "number": 46,
          "title": "Work item 46",
          "url": "https://github.com/acme/shop/pull/46"
        },
        {
          "number": 54,
          "title": "Work item 54",
          "url": "https://github.com/acme/shop/pull/54"
        }
      ],
      "reviewed": []
    },
    {
      "assigned_issues": [],
      "chat": "meera",
      "commits": [],
      "login": "meera",
      "merged": [],
      "name": "Meera",
      "open_prs": [
        {
          "number": 45,
          "title": "Work item 45",
          "url": "https://github.com/acme/shop/pull/45"
        },
        {
          "number": 53,
          "title": "Work item 53",
          "url": "https://github.com/acme/shop/pull/53"
        }
      ],
      "opened": [
        {
          "number": 45,
          "title": "Work item 45",
          "url": "https://github.com/acme/shop/pull/45"
        },
        {
          "number": 53,
          "title": "Work item 53",
          "url": "https://github.com/acme/shop/pull/53"
        }
      ],
      "reviewed": []
    },
    {
      "assigned_issues": [],
      "chat": "priya",
      "commits": [
        {
          "message": "Update 1",
          "sha": "abc001",
          "url": "https://github.com/acme/shop/commit/abc001"
        },
        {
          "message": "Update 2",
          "sha": "abc002",
          "url": "https://github.com/acme/shop/commit/abc002"
        },
        {
          "message": "Update 3",
          "sha": "abc003",
          "url": "https://github.com/acme/shop/commit/abc003"
        }
      ],
      "login": "priya",
      "merged": [
        {
          "number": 41,
          "title": "Add token refresh",
          "url": "https://github.com/acme/shop/pull/41"
        }
      ],
      "name": "Priya",
      "open_prs": [
        {
          "number": 42,
          "title": "Refresh token retries",
          "url": "https://github.com/acme/shop/pull/42"
        },
        {
          "number": 48,
          "title": "Work item 48",
          "url": "https://github.com/acme/shop/pull/48"
        }
      ],
      "opened": [
        {
          "number": 48,
          "title": "Work item 48",
          "url": "https://github.com/acme/shop/pull/48"
        }
      ],
      "reviewed": []
    },
    {
      "assigned_issues": [
        {
          "number": 30,
          "title": "Update onboarding",
          "url": "https://github.com/acme/shop/issues/30"
        }
      ],
      "chat": "sam",
      "commits": [
        {
          "message": "Update 6",
          "sha": "abc006",
          "url": "https://github.com/acme/shop/commit/abc006"
        }
      ],
      "login": "sam",
      "merged": [],
      "name": "Sam",
      "open_prs": [
        {
          "number": 47,
          "title": "Work item 47",
          "url": "https://github.com/acme/shop/pull/47"
        },
        {
          "number": 49,
          "title": "Work item 49",
          "url": "https://github.com/acme/shop/pull/49"
        },
        {
          "number": 50,
          "title": "Work item 50",
          "url": "https://github.com/acme/shop/pull/50"
        },
        {
          "number": 52,
          "title": "Payments integration",
          "url": "https://github.com/acme/shop/pull/52"
        }
      ],
      "opened": [
        {
          "number": 52,
          "title": "Payments integration",
          "url": "https://github.com/acme/shop/pull/52"
        }
      ],
      "reviewed": []
    }
  ]
};

export const DEMO_RULES: Rules = {
  "timezone": "Asia/Kolkata",
  "quiet_hours": {
    "start": "20:00",
    "end": "09:00",
    "friday_cutoff": "17:00"
  },
  "stuck": {
    "review_sla_hours": 24,
    "red_ci_hours": 12,
    "approved_unmerged_hours": 24,
    "stale_issue_days": 3
  },
  "early_warning": {
    "grace_hours": 4,
    "workload_open_prs": 3,
    "points": {
      "no_reviewer": 20,
      "workload": 20,
      "dependency": 25
    }
  },
  "limits": {
    "max_stuck_proposals": 4,
    "max_warning_proposals": 2,
    "max_nudges_per_person_per_day": 2
  },
  "reviewers": [
    "arjun",
    "meera"
  ],
  "approvers": [],
  "team": [
    {
      "github": "priya",
      "chat": "priya",
      "name": "Priya"
    },
    {
      "github": "arjun",
      "chat": "arjun",
      "name": "Arjun"
    },
    {
      "github": "sam",
      "chat": "sam",
      "name": "Sam"
    },
    {
      "github": "lead",
      "chat": "lead",
      "name": "Lead"
    },
    {
      "github": "meera",
      "chat": "meera",
      "name": "Meera"
    }
  ],
  "standup_minutes": 15
};

export const DEMO_LEDGER: Ledger = {
  "executed": {
    "nudge-review-pr42-2026-11-10": {
      "time": "2026-11-10T04:15:00Z",
      "approver": "priya",
      "result_urls": [
        "https://github.com/acme/shop/pull/42#issuecomment-9901"
      ],
      "type": "review_stuck",
      "target": {
        "kind": "pr",
        "number": 42,
        "url": "https://github.com/acme/shop/pull/42"
      },
      "rules": {
        "timezone": "Asia/Kolkata"
      }
    }
  },
  "nudges": {
    "2026-11-10": {
      "arjun": 1,
      "sam": 1
    }
  },
  "decisions": [
    {
      "id": "nudge-stale-issue30-2026-11-10",
      "action": "approve",
      "approver": "priya",
      "time": "2026-11-10T04:10:00Z",
      "type": "stale_issue",
      "target": {
        "kind": "issue",
        "number": 30,
        "url": "https://github.com/acme/shop/issues/30"
      },
      "digest": "8f7a6b2c4e1d3f5a9b0c2e4f6a8b1d3e5f7a9b0c2e4f6a8b1d3e5f7a9b0c2e4f"
    },
    {
      "id": "nudge-review-pr42-2026-11-10",
      "action": "approve",
      "approver": "priya",
      "time": "2026-11-10T04:10:00Z",
      "type": "review_stuck",
      "target": {
        "kind": "pr",
        "number": 42,
        "url": "https://github.com/acme/shop/pull/42"
      },
      "digest": "3a9b0c2e4f6a8b1d3e5f7a9b0c2e4f6a8b1d3e5f7a9b0c2e4f6a8b1d3e5f7a9b"
    },
    {
      "id": "nudge-merge-pr39-2026-11-10",
      "action": "snooze",
      "approver": "priya",
      "time": "2026-11-10T04:12:00Z",
      "type": "approved_unmerged",
      "target": {
        "kind": "pr",
        "number": 39,
        "url": "https://github.com/acme/shop/pull/39"
      },
      "digest": "2e4f6a8b1d3e5f7a9b0c2e4f6a8b1d3e5f7a9b0c2e4f6a8b1d3e5f7a9b0c2e4f"
    }
  ],
  "actions": {
    "nudge-review-pr42-2026-11-10": {
      "0": {
        "status": "executed",
        "url": "https://github.com/acme/shop/pull/42#issuecomment-9901",
        "person": "arjun",
        "time": "2026-11-10T04:15:00Z",
        "budget_day": "2026-11-10"
      }
    }
  },
  "budget_skips": []
};

export const DEMO_METRICS: MetricsData = {
  "assumption": "Configured team size \u00d7 standup_minutes \u00d7 observed working days",
  "baseline": {
    "flags_approved": 1,
    "flags_skipped_likely_false_positives": 0,
    "flags_snoozed": 0,
    "median_first_review_wait_hours": 24.0,
    "resolution_unknown": 0,
    "reviewed_prs": 1,
    "standup_minutes_saved_assumption": 75,
    "stuck_items_resolved": 0,
    "week": "2026-11-09",
    "working_days_observed": 1
  },
  "current": {
    "flags_approved": 1,
    "flags_skipped_likely_false_positives": 0,
    "flags_snoozed": 0,
    "median_first_review_wait_hours": 24.0,
    "resolution_unknown": 0,
    "reviewed_prs": 1,
    "standup_minutes_saved_assumption": 75,
    "stuck_items_resolved": 0,
    "week": "2026-11-09",
    "working_days_observed": 1
  },
  "evidence": [
    "https://github.com/acme/shop/issues/30",
    "https://github.com/acme/shop/issues/31",
    "https://github.com/acme/shop/pull/39",
    "https://github.com/acme/shop/pull/41",
    "https://github.com/acme/shop/pull/42",
    "https://github.com/acme/shop/pull/44",
    "https://github.com/acme/shop/pull/45",
    "https://github.com/acme/shop/pull/46",
    "https://github.com/acme/shop/pull/47",
    "https://github.com/acme/shop/pull/48",
    "https://github.com/acme/shop/pull/49",
    "https://github.com/acme/shop/pull/50",
    "https://github.com/acme/shop/pull/52",
    "https://github.com/acme/shop/pull/53",
    "https://github.com/acme/shop/pull/54",
    "https://github.com/acme/shop/pull/55"
  ],
  "seeded": true
};

export const DEMO_DOCTOR: DoctorResult = {
  "checks": [
    {
      "message": "Python version: 3.14.8 >= 3.11",
      "status": "PASS"
    },
    {
      "message": "gh installed and authenticated: gh version 2.45.0 (demo mock)",
      "status": "PASS"
    },
    {
      "message": "DAYBREAK_REPO readable: acme/shop",
      "status": "PASS"
    },
    {
      "message": "State directory writable: /Users/aditya1981/Flip-the-Switch/state-demo",
      "status": "PASS"
    },
    {
      "message": "rules.json valid: rules loaded successfully",
      "status": "PASS"
    },
    {
      "message": "ALLOW_WRITE flag state: read-only safe guard active",
      "status": "PASS"
    },
    {
      "message": "Quiet-hours state right now: inactive at 09:30 IST",
      "status": "PASS"
    },
    {
      "message": "MATTERMOST_WEBHOOK_URL format: valid https:// webhook configured",
      "status": "PASS"
    }
  ],
  "passed": true
};

export const DEMO_DATASET: DaybreakDataset = {
  mode: 'demo',
  analysis: DEMO_ANALYSIS,
  brief: DEMO_BRIEF,
  rules: DEMO_RULES,
  ledger: DEMO_LEDGER,
  metrics: DEMO_METRICS,
  doctor: DEMO_DOCTOR,
  lastUpdated: new Date().toISOString(),
};
