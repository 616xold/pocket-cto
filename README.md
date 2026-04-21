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
- F3B additive company-scoped CFO Wiki document bindings, deterministic markdown or plain-text document extracts from stored raw bytes, compiler-owned source digest pages, and route-backed backlinks while unsupported PDFs or fileless snapshots remain visible as gaps
- F3C additive persisted CFO Wiki lint runs and findings, deterministic markdown-first export runs, and ownership-safe filed artifact pages preserved across later compiler-owned compiles
- F3D additive deterministic concept pages, metric-definition pages, and policy pages compiled from fixed registries plus explicit `policy_document` bindings while unsupported policy extracts remain visible as gaps
- F4A additive deterministic finance-discovery missions for one typed `cash_posture` question family, backed only by stored Finance Twin plus stored CFO Wiki state, with durable answer artifacts and finance-ready proof bundles
- F4B additive deterministic finance-discovery missions for four more typed families already grounded in shipped Finance Twin plus CFO Wiki state: `collections_pressure`, `payables_pressure`, `spend_posture`, and `obligation_calendar_review`
- F4C1 additive deterministic finance-discovery missions for one explicit-source `policy_lookup` family, requiring `policySourceId` and answering only from scoped `policy_document` wiki state plus bound-source extract posture
- F4C2 additive discovery-quality hardening for the shipped six-family baseline: deterministic policy-document selection from the existing bound-source route, additive policy source-scope rendering across answer, mission, list, and proof-bundle surfaces, packaged `pnpm smoke:finance-discovery-quality:local`, and finance-native `pnpm eval:finance-discovery-quality` report capture

Broad F2 Finance Twin breadth is now shipped through F2O.
The final F2 closeout and handoff are recorded in `plans/FP-0024-final-f2-exit-audit-and-polish.md` and `plans/FP-0025-final-f2-handoff-and-plan-chain-polish.md`.
F3A through F3D are now shipped.
F4A through F4C2 are now the shipped finance-discovery baseline.
F4B widens the first answer path to the truthful stored-state posture, spend, and obligation families listed above.
F4C1 adds explicit-source `policy_lookup`, grounded only in `policy_document` bindings, stored deterministic extracts, compiler-owned policy pages, same-source digest history when useful, and `concepts/policy-corpus`.
F4C2 hardens that shipped six-family discovery baseline with operator-safe policy source selection from existing `policy_document` bindings, additive policy source-scope rendering across answer, mission, list, and proof-bundle surfaces, packaged deterministic `pnpm smoke:finance-discovery-quality:local`, and finance-native `pnpm eval:finance-discovery-quality` reporting that reuses the deterministic smoke without fake model metadata.
`plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md` now serves as the shipped final F4 record.
`plans/FP-0036-reporting-mission-foundation-and-first-finance-memo.md` now records the landed first F5A slice: a first-class reporting mission that compiles one draft `finance_memo` plus one `evidence_appendix` from a completed discovery mission and its stored evidence rather than from generic chat intake.
`plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md` now serves as the shipped F5B record: expose the stored report bodies directly, add mission-centric filing and markdown export actions that reuse the existing CFO Wiki seams, keep reporting deterministic and draft-only, and preserve proof readiness semantics while packaged `pnpm smoke:finance-report-filed-artifact:local` proves the stored -> filed -> exported path.
`plans/FP-0038-board-packet-specialization-and-draft-review-foundation.md` now serves as the shipped F5C1 record: one deterministic, runtime-free, draft-only `board_packet` specialization path from one completed reporting mission with stored `finance_memo` plus stored `evidence_appendix`.
`plans/FP-0039-lender-update-specialization-and-draft-review-foundation.md` now serves as the shipped F5C2 record: one deterministic, runtime-free, draft-only `lender_update` specialization path from one completed reporting mission with stored `finance_memo` plus stored `evidence_appendix`.
`plans/FP-0040-diligence-packet-specialization-and-draft-review-foundation.md` now serves as the shipped F5C3 record: one deterministic, runtime-free, draft-only `diligence_packet` specialization from one completed reporting mission with stored `finance_memo` plus stored `evidence_appendix`.
`plans/FP-0041-approval-review-and-first-lender-update-release-readiness.md` now serves as the shipped F5C4A record: the repo already supports one finance-facing `report_release` approval on one completed `lender_update` reporting mission, approval resolution without live runtime continuation, and explicit release-readiness posture while staying deterministic, runtime-free, and delivery-free.
`plans/FP-0042-release-log-and-first-lender-update-release-record-foundation.md` now serves as the shipped F5C4B record: the repo can record that one already-approved `lender_update` was released externally, persist one explicit release record on the existing `report_release` approval seam, and stay deterministic, runtime-free, and delivery-free in the system sense.
`plans/FP-0043-diligence-packet-approval-review-and-release-readiness.md` now serves as the shipped F5C4C record: the repo can request and resolve one finance-facing `report_release` approval for one completed `diligence_packet` reporting mission, derive explicit diligence release-readiness posture without live runtime continuation, and keep the slice deterministic, runtime-free, delivery-free, and release-log-free.
`plans/FP-0044-release-log-and-first-diligence-packet-release-record-foundation.md` now serves as the shipped F5C4D record: the repo can record one explicit external release record only for one completed approved-for-release `diligence_packet` reporting mission, surface that release-record posture across reporting, mission, proof-bundle, and approval-card views, reuse the existing `report_release` approval seam as the persistence anchor, and stay deterministic, runtime-free, delivery-free, and multi-artifact-free in the first slice.
`plans/FP-0045-board-packet-review-or-circulation-readiness-foundation.md` is now the active F5C4E implementation contract: the next code thread should add one internal `report_circulation` review path plus derived circulation-ready posture for one completed `board_packet` reporting mission with one stored `board_packet` artifact, while keeping the slice deterministic, runtime-free, delivery-free, and circulation-log-free.

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
│   ├── FP-0027-cfo-wiki-document-page-compiler-and-backlinks.md
│   ├── FP-0028-cfo-wiki-lint-export-and-durable-filing.md
│   ├── FP-0029-cfo-wiki-concept-metric-and-policy-pages.md
│   ├── FP-0030-finance-discovery-foundation-and-first-answer.md
│   ├── FP-0031-finance-discovery-supported-posture-and-obligation-families.md
│   ├── FP-0032-finance-discovery-polish-and-compatibility.md
│   ├── FP-0033-finance-discovery-baseline-closeout-polish.md
│   ├── FP-0034-finance-discovery-final-artifact-and-doc-polish.md
│   ├── FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md
│   ├── FP-0036-reporting-mission-foundation-and-first-finance-memo.md
│   ├── FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md
│   ├── FP-0038-board-packet-specialization-and-draft-review-foundation.md
│   ├── FP-0039-lender-update-specialization-and-draft-review-foundation.md
│   ├── FP-0040-diligence-packet-specialization-and-draft-review-foundation.md
│   ├── FP-0041-approval-review-and-first-lender-update-release-readiness.md
│   ├── FP-0042-release-log-and-first-lender-update-release-record-foundation.md
│   ├── FP-0043-diligence-packet-approval-review-and-release-readiness.md
│   ├── FP-0044-release-log-and-first-diligence-packet-release-record-foundation.md
│   ├── FP-0045-board-packet-review-or-circulation-readiness-foundation.md
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
pnpm smoke:cfo-wiki-document-pages:local
pnpm smoke:cfo-wiki-lint-export:local
pnpm smoke:cfo-wiki-concept-metric-policy:local
pnpm smoke:finance-discovery-answer:local
pnpm smoke:finance-discovery-supported-families:local
pnpm smoke:finance-policy-lookup:local
pnpm smoke:finance-discovery-quality:local
pnpm eval:finance-discovery-quality
pnpm smoke:finance-memo:local
pnpm smoke:finance-report-filed-artifact:local
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
- `POST /cfo-wiki/companies/:companyKey/lint`
- `GET /cfo-wiki/companies/:companyKey/lint`
- `POST /cfo-wiki/companies/:companyKey/export`
- `GET /cfo-wiki/companies/:companyKey/exports`
- `GET /cfo-wiki/companies/:companyKey/exports/:exportRunId`
- `GET /cfo-wiki/companies/:companyKey`
- `POST /cfo-wiki/companies/:companyKey/sources/:sourceId/bind`
- `GET /cfo-wiki/companies/:companyKey/sources`
- `POST /cfo-wiki/companies/:companyKey/filed-pages`
- `GET /cfo-wiki/companies/:companyKey/filed-pages`
- `GET /cfo-wiki/companies/:companyKey/index`
- `GET /cfo-wiki/companies/:companyKey/log`
- `GET /cfo-wiki/companies/:companyKey/pages/*`

The current success condition is no longer an F0 guidance reset.
It is preserving the authoritative raw-source ingest spine while extending the deterministic Finance Twin additively and truthfully.

## North star

The hero behavior is:

> a founder or finance operator drops raw exports and documents into Pocket CFO, asks a typed finance question, and receives a cited answer, freshness posture, limitations, and a memo or packet that can survive outside chat.

Everything in this repository should push toward that behavior.
