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
7. the unfinished `plans/FP-*.md` file if one exists; otherwise use the latest shipped record. Right now `plans/FP-0056-non-cash-alert-investigation-generalization-foundation.md` is the shipped F6G record. It shipped one manual, source-backed `collections_pressure` alert-to-investigation handoff from persisted alert monitor results only, preserves shipped `cash_posture` handoff behavior, and keeps payables investigations, policy/covenant investigations, automatic mission creation, scheduling, notifications, runtime-codex, reports, approvals, delivery, payment behavior, legal or policy advice, collection instructions, customer-contact instructions, and autonomous finance action out of scope. No F6H or later implementation has started; F6H planning requires a new Finance Plan. `plans/FP-0055-monitor-demo-replay-and-stack-pack-foundation.md` remains the shipped F6F implementation record, `plans/FP-0054-policy-covenant-threshold-monitor-foundation.md` remains the shipped F6E implementation record, `plans/FP-0053-payables-pressure-monitor-foundation.md` remains the shipped F6D record, `plans/FP-0052-collections-pressure-monitor-foundation.md` remains the shipped F6C record, `plans/FP-0051-alert-to-investigation-mission-foundation.md` remains the shipped first F6B record, `plans/FP-0050-monitoring-foundation-and-first-cash-posture-alert.md` remains the shipped first F6A record, and `plans/FP-0049-board-packet-circulation-note-reset-and-effective-record-hardening.md` remains the latest shipped F5C4I record. Treat older F5 and F4 records as shipped history unless a new plan names a concrete truthfulness gap.
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
