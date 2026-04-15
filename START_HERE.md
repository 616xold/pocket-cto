# Start here

This repository is already structured so you can open it in the Codex app and keep the Pocket CFO pivot moving without losing the existing control-plane spine.

Before doing anything else, read `docs/ACTIVE_DOCS.md`.

## First run in Codex

Open the repository root in the Codex app.

Then start a fresh thread and give Codex this prompt:

```text
Read docs/ACTIVE_DOCS.md, README.md, AGENTS.md, PLANS.md, plans/ROADMAP.md, and docs/ops/source-ingest-and-cfo-wiki.md.
Determine whether an unfinished plans/FP-*.md file exists.
If one exists, summarize the active phase, the archive boundary, and the next unchecked slice of that plan, then implement only that slice.
If none exists, summarize the latest shipped phase, identify the next roadmap phase, create the next Finance Plan before code changes, and then implement only that plan.
Keep internal package scope unchanged, preserve repo hygiene, update the Finance Plan Progress and Decision Log as you work, and run the narrowest meaningful validation after each step.
```

## Recommended operating pattern

Use **one Codex thread per slice**.

Suggested thread naming:

- `F0-pivot-foundation`
- `F1-source-registry-bridge`
- `F2A-finance-twin-trial-balance`
- `F2B-chart-of-accounts`
- `F2C-general-ledger-and-hardening`
- `F2D-cross-slice-finance-snapshot-and-lineage`
- `F2E-reconciliation-readiness-and-snapshot-hardening`
- `F2F-reporting-window-truth-and-period-scoped-reconciliation`
- `F2G-account-bridge-readiness-and-f2f-polish`
- `F2H-balance-bridge-prerequisites-and-diagnostic-hardening`
- `F2I-source-backed-balance-proof-and-snapshot-polish`
- `F2J-balance-proof-lineage-and-f2i-polish`
- `F2K-bank-account-summary-and-cash-posture`
- `F2L-receivables-aging-and-collections-posture`
- `F2M-payables-aging-and-payables-posture`
- `F2N-contract-metadata-and-obligation-calendar`
- `F2O-card-expense-and-spend-posture`
- `F2P-final-f2-exit-audit-and-polish`
- `F2Q-final-f2-handoff-and-plan-chain-polish`
- `F3-cfo-wiki-master-plan-and-doc-refresh`
- `F3A-cfo-wiki-foundation-and-page-registry`
- `F3B-cfo-wiki-document-page-compiler-and-backlinks`
- `F3C-cfo-wiki-lint-export-and-durable-filing`
- `F3D-cfo-wiki-concept-metric-and-policy-pages`
- `F4-finance-discovery-master-plan-and-doc-refresh`
- `F4A-finance-discovery-foundation-and-first-answer`
- `F4B-finance-discovery-supported-posture-and-obligation-families`
- `F4C1-finance-policy-lookup`
- `F4C2-discovery-quality-hardening-and-evals`
- `F5-memo-and-packet-compiler`
- `F6-monitoring-and-controls`

Broad F2 Finance Twin work now runs through F2O.
`F2P-final-f2-exit-audit-and-polish` and `F2Q-final-f2-handoff-and-plan-chain-polish` are the historical closeout and handoff threads for that completed breadth.
The first F3 thread is the master-plan and active-doc refresh slice.
`F3A-cfo-wiki-foundation-and-page-registry` is now the shipped CFO Wiki foundation slice.
`F3B-cfo-wiki-document-page-compiler-and-backlinks` is now the shipped first document-aware wiki slice.
`F3C-cfo-wiki-lint-export-and-durable-filing` is now the shipped wiki quality, export, and filed-artifact slice.
`F3D-cfo-wiki-concept-metric-and-policy-pages` is now the shipped deterministic knowledge-page slice.
`F4-finance-discovery-master-plan-and-doc-refresh` is the planning and active-doc slice that creates the first implementation-ready F4 contract.
`plans/FP-0030-finance-discovery-foundation-and-first-answer.md`, `plans/FP-0031-finance-discovery-supported-posture-and-obligation-families.md`, `plans/FP-0032-finance-discovery-polish-and-compatibility.md`, `plans/FP-0033-finance-discovery-baseline-closeout-polish.md`, and `plans/FP-0034-finance-discovery-final-artifact-and-doc-polish.md` are now shipped.
`plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md` is now the active F4C execution contract.
`F4C1-finance-policy-lookup` is now the shipped explicit-source policy lookup slice.
Continue `FP-0035` in the next `F4C2-discovery-quality-hardening-and-evals` thread rather than creating a different F4 plan or widening into F5/F6 work.

## Review ritual

After each slice:

1. review the diff
2. confirm the touched files still respect package and module boundaries
3. confirm the active Finance Plan was updated
4. confirm stale or historical docs were not accidentally revived as active truth
5. run the listed validation commands
6. only then move to the next slice

## Use the repo skills

Explicitly invoke these when useful:

- `$execplan-orchestrator`
- `$modular-architecture-guard`
- `$source-provenance-guard`
- `$cfo-wiki-maintainer`
- `$evidence-bundle-auditor`

Use `$github-app-integration-guard` only when touching the optional GitHub connector path.

Example:

```text
$source-provenance-guard Add the source registry snapshot repository and checksum handling. Keep raw sources immutable and make lineage explicit in both schema and service code.
```

## What not to do first

Do not start with:

- a giant repo-wide rename of `@pocket-cto/*`
- deleting all GitHub modules in one shot
- finance connector sprawl
- autonomous accounting or banking actions
- vague “AI CFO” chat features
- deck polish before discovery, provenance, and freshness are real
- replacing deterministic twin logic with freeform LLM answers

## The correct first success

The first success in a new thread is not guessing from stale plans or restarting F0 work.

The first success is:

> Codex identifies whether an unfinished Finance Plan exists, respects the active-vs-archive boundary, and either continues that narrow unfinished slice or creates the next-phase plan before coding.

Once that is solid, the next active finance slice can proceed safely.
