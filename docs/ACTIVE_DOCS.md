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
7. the unfinished `plans/FP-*.md` file if one exists; otherwise use the latest shipped record. Right now `plans/FP-0054-policy-covenant-threshold-monitor-foundation.md` is the active F6E implementation-ready contract for exactly one deterministic `policy_covenant_threshold` monitor over stored CFO Wiki policy-document posture, deterministic policy extracts, policy pages, policy-corpus posture, and explicit comparable Finance Twin posture only. `plans/FP-0053-payables-pressure-monitor-foundation.md` remains the shipped F6D implementation record for exactly one deterministic `payables_pressure` monitor over stored payables-aging or payables-posture Finance Twin state. `plans/FP-0052-collections-pressure-monitor-foundation.md` remains the shipped F6C implementation record for exactly one deterministic `collections_pressure` monitor over stored receivables-aging or collections-posture Finance Twin state. `plans/FP-0051-alert-to-investigation-mission-foundation.md` remains the shipped first F6B implementation record for a manual operator handoff from one persisted alerting `cash_posture` monitor result into one deterministic source-backed investigation mission. `plans/FP-0050-monitoring-foundation-and-first-cash-posture-alert.md` remains the shipped first F6A record, and `plans/FP-0049-board-packet-circulation-note-reset-and-effective-record-hardening.md` remains the latest shipped F5C4I record; treat `plans/FP-0048-board-packet-circulation-actor-correction-and-chronology-hardening.md` as the shipped F5C4H record, `plans/FP-0047-board-packet-circulation-record-correction-and-chronology-foundation.md` as the shipped F5C4G implementation record, `plans/FP-0046-circulation-log-and-first-board-packet-circulation-record-foundation.md` as the shipped F5C4F implementation record, `plans/FP-0045-board-packet-review-or-circulation-readiness-foundation.md` as the shipped F5C4E record, `plans/FP-0044-release-log-and-first-diligence-packet-release-record-foundation.md` as the shipped F5C4D record, `plans/FP-0043-diligence-packet-approval-review-and-release-readiness.md` as the shipped F5C4C record, `plans/FP-0042-release-log-and-first-lender-update-release-record-foundation.md` as the shipped F5C4B record, `plans/FP-0041-approval-review-and-first-lender-update-release-readiness.md` as the shipped F5C4A record, `plans/FP-0040-diligence-packet-specialization-and-draft-review-foundation.md` as the shipped F5C3 record, `plans/FP-0039-lender-update-specialization-and-draft-review-foundation.md` as the shipped F5C2 record, `plans/FP-0038-board-packet-specialization-and-draft-review-foundation.md` as the shipped F5C1 record, `plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md` as the shipped F5B record, `plans/FP-0036-reporting-mission-foundation-and-first-finance-memo.md` as the shipped F5A record, and `plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md` as the shipped final F4 record. F6E implementation has not started and must not add investigations, delivery, runtime-codex, approvals, reports, legal or policy advice, payment behavior, new discovery families, or broad monitoring-platform behavior.
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
