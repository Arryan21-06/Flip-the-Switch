# Implementation decisions

1. Project_Info.md is copied verbatim to docs/PRD.md with the owner's approval. The pasted build order M0–M7 determines commit order.
2. Drafts are excluded from briefs per the later build request; they still count toward author workload. This resolves contradictory draft examples in PRD sections 12 and 16.
3. "No activity found" means no in-window merged PRs, commits, or reviews. Opening a PR is displayed in its own opened category; current open work is displayed separately. Meera has open PRs, so these cannot honestly be hidden to match the example.
4. Runtime dependencies are standard-library only. pytest is the sole development dependency; setuptools is packaging infrastructure.
5. Multiple rules on one target: retain the highest-ranked candidate, log other candidates as duplicate_target. Stuck work takes precedence over a warning on the same target.
6. Proposal indices are allocated in ranked order on the first run. They remain bound to the same IDs within a day, including tombstones for suppressed entries; reruns can have gaps. This prevents delayed chat approvals from targeting different work. Approval freezes action contents.
7. Missing timestamps remain null and cannot trigger elapsed-time rules. Missing evidence URLs prevent actionable claims. No invented creation-time fallback is used for review requests or checks.
8. Execution uses per-action ledger entries plus a digest-bound approval, a process lock (macOS/Linux), and atomic JSON replacement. Multiple actions can succeed/fail independently. Uncertain write attempts are recovered from remote evidence; if evidence is absent, automatic retry is blocked to avoid duplicate writes. Exactly-once cannot be guaranteed across external actors or loss of both local and remote evidence.
9. Fixture proposals cannot perform live writes. Live execution uses the current clock and disallows --now; explicit --ignore-quiet-hours remains available per the PRD. --dry-run makes no network calls or local state writes.
10. Nudge budget is charged once per actual recipient per proposal: reviewer for review requests, dependency owner for dependency comments. Partial successes count. Budget is checked again during execution.
11. Chat identity is a trusted adapter input: --by is not authentication. Agent instructions must bind it to the actual message sender. CLI safety is not an OS sandbox.
