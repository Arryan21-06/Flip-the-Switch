# Implementation decisions

1. Project_Info.md is copied verbatim to docs/PRD.md with the owner's approval. The pasted build order M0–M7 determines commit order.
2. Drafts are excluded from briefs per the later build request; they still count toward author workload. This resolves contradictory draft examples in PRD sections 12 and 16.
3. "No activity found" means no in-window merged PRs, commits, or reviews. Opening a PR is displayed in its own opened category; current open work is displayed separately. Meera has open PRs, so these cannot honestly be hidden to match the example.
4. Runtime dependencies are standard-library only. pytest is the sole development dependency; setuptools is packaging infrastructure.
