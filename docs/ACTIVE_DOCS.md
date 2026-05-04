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
7. the unfinished `plans/FP-*.md` file if one exists; `plans/FP-0077-v1-public-launch-handoff.md` is the active F10/v1 public launch handoff planning contract. It is docs-and-validation-only and must not start F10 implementation, product runtime behavior, F6V provider integration, F6X actual certification, deeper PDF/OCR/vector search, delivery, approval workflow, report release, certification, legal/audit opinion, runtime-Codex, generated prose, source mutation, finance writes, or autonomous action. `plans/FP-0076-product-ui-launch-polish-foundation.md` is the shipped F9 product UI launch-polish foundation record; F9 shipped read-only app/web navigation, copy, warning, and status-surface truthfulness only, with no backend code, backend route, web API route, schema, migration, package script, smoke alias, eval dataset, fixture, product runtime behavior, provider integration, delivery, approval workflow, report release, report circulation, certification, legal/audit opinion, runtime-Codex, generated prose, source mutation, finance write, monitor family, discovery family, mission behavior, autonomous action, or FP-0077 during F9. `plans/FP-0075-v1-future-scope-triage-and-roadmap-hardening.md` is the shipped F8/v1 future-scope triage record. `plans/FP-0074-v1-launch-readiness-and-active-doc-hardening.md` is the shipped F7/v1 launch-readiness and active-doc hardening record. `plans/FP-0073-final-f6-v1-exit-audit-and-handoff.md` is the shipped F6Z final F6/v1 exit audit and handoff record. FP-0050 through FP-0073 remain shipped F6 records. F6V provider integration, F6X actual certification, deeper PDF/OCR/vector search, F10 implementation, provider integration, certification, delivery, approval, report release, runtime-Codex, source mutation, finance writes, generated prose, autonomous action, and later high-liability work remain future-only unless a later Finance Plan names exact scope. Treat older F5 and F4 records as shipped history unless a new plan names a concrete truthfulness gap.
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
