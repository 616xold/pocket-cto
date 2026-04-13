# Pocket CFO

Pocket CFO is an evidence-native finance discovery and decision system.

It is **not** a generic finance chatbot and it is **not** an autonomous accounting agent.
It turns messy finance questions and raw source bundles into typed finance missions, a persisted Finance Twin, a compiled CFO Wiki, and decision-ready evidence artifacts.

## Current repo state

This repository is past the pivot-foundation reset and the first narrow finance-twin slices.

The active guidance layer now describes **Pocket CFO**.
Some code, package names, database names, and legacy modules still say `pocket-cto`.
Treat those as implementation scaffolding, not as product direction.
The control-plane spine stays; the finance evidence substrate is what changes.

Read `docs/ACTIVE_DOCS.md` before trusting older plans or engineering-era docs.

Today the merged backbone is:

- F1 raw source registration and immutable file ingest
- F2A deterministic trial-balance CSV sync into the Finance Twin
- F2B deterministic chart-of-accounts CSV sync and account-catalog reads
- F2C deterministic general-ledger CSV sync and persisted journal-entry or journal-line state
- F2D additive company snapshot and lineage reads across the latest successful implemented finance slices
- F2E additive backend-first reconciliation-readiness reads, source-grounded slice-alignment truthfulness, and more specific general-ledger activity lineage drill behavior
- F2F additive reporting-window truth hardening, explicit general-ledger period-context reads, and period-scoped reconciliation semantics without fake variance
- F2G additive matched-period account-bridge-readiness reads plus chart-of-accounts-backed unmatched diagnostics without inventing a numeric bridge
- F2H additive balance-bridge-prerequisites reads for trial-balance-versus-general-ledger account scope, explicit account-level proof diagnostics, and diagnostic-versus-limitation hardening without fake bridge numbers or variance
- F2I additive source-backed general-ledger opening-balance and ending-balance proof support from explicit persisted fields only, plus snapshot diagnostic-versus-limitation polish
- F2J additive backend-first balance-proof lineage drill and read behavior on top of persisted proof rows and lineage
- F2K additive deterministic `bank_account_summary_csv` extraction plus backend-first bank-account inventory and cash-posture reads without fake FX conversion, transaction detail, or bank reconciliation
- F2L additive deterministic `receivables_aging_csv` extraction plus backend-first receivables-aging and collections-posture reads without fake invoice detail, expected cash timing, reserve logic, or DSO
- F2M additive deterministic `payables_aging_csv` extraction plus backend-first payables-aging and payables-posture reads without fake bill detail, expected payment timing, reserve logic, or DPO
- F2N additive deterministic `contract_metadata_csv` extraction plus backend-first contract inventory and obligation-calendar reads without clause parsing, legal interpretation, payment forecasting, or covenant logic
- F2O additive deterministic `card_expense_csv` extraction plus backend-first spend-item inventory and spend-posture reads without fake policy scores, reimbursement inference, accrual logic, or payment forecasting
- F3A additive deterministic CFO Wiki foundation with persisted compile runs, compiler-owned pages, page links, and page refs for one company, compiled only from stored source-inventory metadata plus Finance Twin state

Broad F2 Finance Twin breadth is now shipped through F2O.
The final F2 closeout and handoff are recorded in `plans/FP-0024-final-f2-exit-audit-and-polish.md` and `plans/FP-0025-final-f2-handoff-and-plan-chain-polish.md`.
F3A is now shipped, and the next new implementation phase is F3B CFO Wiki document-page compiler work rather than another broad F2 extractor slice.

## Product boundary for v1

Pocket CFO v1 is intentionally narrow:

- single company
- single operator
- single trust boundary
- manual-export and file-first ingest
- finance evidence first; GitHub is only an optional connector
- PWA-first operator surface
- Codex App Server as the coding/runtime seam
- no autonomous bank writes, accounting writes, tax filings, or legal advice
- no multi-tenant SaaS boundary in v1

## What is already decided

1. **Mission, replay, and proof stay.**
   The orchestration spine from Pocket CTO is still the most valuable part of the repo.

2. **Raw finance sources become the product boundary.**
   The primary source of truth is no longer a repository or PR flow.
   It is source files, documents, policies, definitions, exports, and derived structured state.

3. **The engineering twin becomes a Finance Twin.**
   Keep the twin engine pattern, but replace the ontology and query semantics.

4. **A compiled CFO Wiki sits beside the twin.**
   The twin is the machine-queryable layer.
   The CFO Wiki is the operator-readable markdown layer built from raw sources plus twin facts.

5. **GitHub is demoted to connector status.**
   Keep the integration patterns, but do not let GitHub define the product.

6. **Internal package scope stays stable for now.**
   Keep `@pocket-cto/*` until the finance vertical is implemented cleanly enough to justify a later rename.

## Working architecture planes

1. **Source Registry** for uploads, snapshots, checksums, provenance, and raw artifacts.
2. **Finance Twin** for deterministic structured entities, edges, freshness, and lineage.
3. **CFO Wiki** for compiled markdown pages, indexes, backlinks, and durable analysis notes.
4. **Mission Engine** for analysis, reporting, monitoring, diligence, and close/control work.
5. **Evidence & Output Layer** for answers, memos, packets, and appendices.
6. **Operator Surface** for ingest, review, approval, export, and tracked questions.

## Repository map

```text
.
├── AGENTS.md
├── PLANS.md
├── WORKFLOW.md
├── START_HERE.md
├── apps
│   ├── control-plane
│   └── web
├── docs
│   ├── ACTIVE_DOCS.md
│   ├── architecture
│   ├── archive
│   ├── benchmarks
│   └── ops
├── packages
│   ├── codex-runtime
│   ├── config
│   ├── db
│   ├── domain
│   ├── stack-packs
│   └── testkit
├── plans
│   ├── ROADMAP.md
│   ├── FP-0001-pocket-cfo-pivot-foundation.md
│   ├── FP-0009-finance-twin-foundation-and-first-extractor.md
│   ├── FP-0010-chart-of-accounts-and-f2a-polish.md
│   ├── FP-0011-general-ledger-and-finance-twin-hardening.md
│   ├── FP-0012-cross-slice-finance-snapshot-and-lineage.md
│   ├── FP-0013-reconciliation-readiness-and-snapshot-hardening.md
│   ├── FP-0014-reporting-window-truth-and-period-scoped-reconciliation.md
│   ├── FP-0015-account-bridge-readiness-and-f2f-polish.md
│   ├── FP-0016-balance-bridge-prerequisites-and-diagnostic-hardening.md
│   ├── FP-0017-source-backed-balance-proof-and-snapshot-polish.md
│   ├── FP-0018-balance-proof-lineage-and-f2i-polish.md
│   ├── FP-0019-bank-account-summary-and-cash-posture.md
│   ├── FP-0020-receivables-aging-and-collections-posture.md
│   ├── FP-0021-payables-aging-and-payables-posture.md
│   ├── FP-0022-contract-metadata-and-obligation-calendar.md
│   ├── FP-0023-card-expense-and-spend-posture.md
│   ├── FP-0024-final-f2-exit-audit-and-polish.md
│   ├── FP-0025-final-f2-handoff-and-plan-chain-polish.md
│   ├── FP-0026-cfo-wiki-foundation-and-page-registry.md
│   └── templates
└── .agents
    └── skills
```

## Immediate build order

1. Read `docs/ACTIVE_DOCS.md`.
2. Read `START_HERE.md`.
3. Read `AGENTS.md`.
4. Read `PLANS.md`.
5. Read `plans/ROADMAP.md`.
6. Check whether an unfinished `plans/FP-*.md` file exists instead of restarting from `FP-0001`.
7. If one exists, read it and continue only that slice.
8. If none exists, read the latest closeout or handoff record, then create the next-phase Finance Plan before code changes.
9. Keep progress updates inside the Finance Plan you are actively executing.
10. Do not delete legacy engineering modules until the finance replacement path exists and a smoke proves it.

## Local development

The repo still boots with the existing monorepo structure and internal package names.

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
```

Use `docs/ops/local-dev.md` for the pivot-aware operating pattern.
The current packaged local proofs for the finance path are:

```bash
pnpm smoke:source-ingest:local
pnpm smoke:finance-twin:local
pnpm smoke:finance-twin-account-catalog:local
pnpm smoke:finance-twin-general-ledger:local
pnpm smoke:finance-twin-snapshot:local
pnpm smoke:finance-twin-reconciliation:local
pnpm smoke:finance-twin-period-context:local
pnpm smoke:finance-twin-account-bridge:local
pnpm smoke:finance-twin-balance-bridge-prerequisites:local
pnpm smoke:finance-twin-source-backed-balance-proof:local
pnpm smoke:finance-twin-balance-proof-lineage:local
pnpm smoke:finance-twin-bank-account-summary:local
pnpm smoke:finance-twin-receivables-aging:local
pnpm smoke:finance-twin-payables-aging:local
pnpm smoke:finance-twin-contract-metadata:local
pnpm smoke:finance-twin-card-expense:local
pnpm smoke:cfo-wiki-foundation:local
```

The current backend-first finance-twin read surface is:

- company summary
- company snapshot
- account catalog
- general ledger
- lineage drill
- trial-balance-versus-general-ledger reconciliation readiness
- trial-balance-versus-general-ledger matched-period account-bridge readiness
- trial-balance-versus-general-ledger balance-bridge prerequisites
- truthful source-backed general-ledger balance proof inside balance-bridge prerequisites
- general-ledger balance-proof lineage drill
- bank-account inventory
- cash posture
- contract inventory
- obligation calendar
- spend-item inventory
- spend posture
- payables-aging
- payables posture
- receivables-aging
- collections posture
- general-ledger account activity lineage

The current backend-first CFO Wiki read surface is:

- `POST /cfo-wiki/companies/:companyKey/compile`
- `GET /cfo-wiki/companies/:companyKey`
- `GET /cfo-wiki/companies/:companyKey/index`
- `GET /cfo-wiki/companies/:companyKey/log`
- `GET /cfo-wiki/companies/:companyKey/pages/*`

The current success condition is no longer an F0 guidance reset.
It is preserving the authoritative raw-source ingest spine while extending the deterministic Finance Twin additively and truthfully.

## North star

The hero behavior is:

> a founder or finance operator drops raw exports and documents into Pocket CFO, asks a typed finance question, and receives a cited answer, freshness posture, limitations, and a memo or packet that can survive outside chat.

Everything in this repository should push toward that behavior.
