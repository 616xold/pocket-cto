# Active docs boundary

This repository is mid-pivot.
Use this file to know which docs are active, which are archived reference-only history, and where historical Pocket CTO materials now live.

## Read these first

Treat these as the active product and implementation guidance, in this order:

1. `START_HERE.md`
2. `README.md`
3. `AGENTS.md`
4. `PLANS.md`
5. `WORKFLOW.md`
6. `plans/ROADMAP.md`
7. the unfinished `plans/FP-*.md` file if one exists; today that is `plans/FP-0038-board-packet-specialization-and-draft-review-foundation.md`, while `plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md` remains the shipped F5B record, `plans/FP-0036-reporting-mission-foundation-and-first-finance-memo.md` remains the shipped F5A record, and `plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md` remains the shipped final F4 record
8. `docs/ops/source-ingest-and-cfo-wiki.md`
9. `docs/ops/local-dev.md`
10. `docs/ops/codex-app-server.md`
11. `docs/ops/github-app-setup.md` only if GitHub connector work is actually in scope
12. `docs/benchmarks/seeded-missions.md`
13. `evals/README.md`

## Archived Pocket CTO reference material

These may contain reusable implementation ideas, but they are **not** the active product truth:

- `docs/architecture/**`
- `docs/archive/pocket-cto/plans/EP-*.md`
- `docs/archive/pocket-cto/ops/m2-exit-report.md`
- `docs/archive/pocket-cto/ops/m3-exit-report.md`
- GitHub-first or engineering-first milestone notes anywhere else in the repo

You may reuse them for control-plane, replay, evidence, or twin patterns.
Do not reuse their product wording or product assumptions as active scope.
The Pocket CTO archive root is `docs/archive/pocket-cto/`.

## Conflict rule

If active docs disagree with historical Pocket CTO docs:

- active docs win for **product direction**
- current code wins for **implemented behavior**
- the active Finance Plan decides how to close the gap

Do not claim a finance capability exists until code and acceptance prove it.

## Update rule

When you change product direction, operating procedure, or milestone sequencing, update the active doc in the same slice or archive the stale doc.
Do not leave ambiguous, competing guidance in place.
