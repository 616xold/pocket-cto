# Local development

This repo is now past the Pocket CFO pivot-foundation reset, through the F1 source-ingest milestone, through the shipped F2A through F2O finance-twin breadth, through the shipped F3A through F3D CFO Wiki slices, through the shipped F4A through F4C2 finance-discovery baseline, and through the shipped F5A through the shipped F5C4I reporting slice. `plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md` is the shipped final F4 record, `plans/FP-0036-reporting-mission-foundation-and-first-finance-memo.md` is the shipped F5A record, `plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md` is the shipped F5B record, `plans/FP-0038-board-packet-specialization-and-draft-review-foundation.md` is the shipped F5C1 record, `plans/FP-0039-lender-update-specialization-and-draft-review-foundation.md` is the shipped F5C2 record, `plans/FP-0040-diligence-packet-specialization-and-draft-review-foundation.md` is the shipped F5C3 record, `plans/FP-0041-approval-review-and-first-lender-update-release-readiness.md` is the shipped F5C4A record, `plans/FP-0042-release-log-and-first-lender-update-release-record-foundation.md` is the shipped F5C4B record, `plans/FP-0043-diligence-packet-approval-review-and-release-readiness.md` is the shipped F5C4C record, `plans/FP-0044-release-log-and-first-diligence-packet-release-record-foundation.md` is the shipped F5C4D record, `plans/FP-0045-board-packet-review-or-circulation-readiness-foundation.md` is the shipped F5C4E record, `plans/FP-0046-circulation-log-and-first-board-packet-circulation-record-foundation.md` is the shipped F5C4F implementation record, `plans/FP-0047-board-packet-circulation-record-correction-and-chronology-foundation.md` is the shipped F5C4G implementation record, `plans/FP-0048-board-packet-circulation-actor-correction-and-chronology-hardening.md` is the shipped F5C4H record, and `plans/FP-0049-board-packet-circulation-note-reset-and-effective-record-hardening.md` is the shipped F5C4I record.
`plans/FP-0050-monitoring-foundation-and-first-cash-posture-alert.md` now records the shipped first F6A implementation slice.
`plans/FP-0051-alert-to-investigation-mission-foundation.md` now records the shipped first F6B implementation slice.
`plans/FP-0052-collections-pressure-monitor-foundation.md` now records the shipped F6C implementation slice for exactly one deterministic `collections_pressure` monitor over stored receivables-aging or collections-posture Finance Twin state.
`plans/FP-0053-payables-pressure-monitor-foundation.md` now records the shipped F6D implementation slice for exactly one deterministic `payables_pressure` monitor over stored payables-aging or payables-posture Finance Twin state.
`plans/FP-0054-policy-covenant-threshold-monitor-foundation.md` now records the shipped F6E implementation slice for exactly one deterministic `policy_covenant_threshold` monitor over stored CFO Wiki policy-document posture, deterministic policy extracts, policy pages, policy-corpus posture, and explicit comparable Finance Twin posture only.
`plans/FP-0055-monitor-demo-replay-and-stack-pack-foundation.md` is now the shipped F6F implementation record for one deterministic monitor demo replay and one stack-pack foundation.
`plans/FP-0056-non-cash-alert-investigation-generalization-foundation.md` is the shipped F6G record for a manual `collections_pressure` alert-to-investigation handoff only. Do not start broader later-F5 work, multi-monitor F6 work, F6H or later implementation, runtime-codex monitoring, delivery behavior, notifications, payables investigations, policy/covenant investigations, approvals, report conversion, payment behavior, payment instructions, vendor-payment recommendations, legal or policy advice, collection instructions, customer-contact instructions, autonomous finance action, or automatic mission creation from this doc.

That means two things are true at once:

- the active docs now define a finance evidence product
- parts of the working codebase still reflect the older Pocket CTO implementation

The goal of local development in the current repo state is to keep the repo green while preserving the finished F1 raw-source path, preserving the shipped finance-twin slices, and starting later-phase work only through an explicit active Finance Plan.

## Baseline bootstrap

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
```

Useful validation commands:

```bash
pnpm repo:hygiene
pnpm lint
pnpm typecheck
pnpm test
pnpm check
pnpm smoke:source-registry:local
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
pnpm smoke:finance-discovery-quality:local
pnpm smoke:finance-memo:local
pnpm smoke:board-packet:local
pnpm smoke:board-packet-circulation-approval:local
pnpm smoke:board-packet-circulation-log:local
pnpm smoke:board-packet-circulation-log-correction:local
pnpm smoke:board-packet-circulation-actor-correction:local
pnpm smoke:board-packet-circulation-note-reset:local
pnpm smoke:lender-update:local
pnpm smoke:diligence-packet:local
pnpm smoke:finance-report-filed-artifact:local
pnpm smoke:lender-update-release-approval:local
pnpm smoke:lender-update-release-log:local
pnpm smoke:diligence-packet-release-approval:local
pnpm smoke:diligence-packet-release-log:local
pnpm smoke:finance-policy-lookup:local
pnpm smoke:cash-posture-monitor:local
pnpm smoke:cash-posture-alert-investigation:local
pnpm smoke:collections-pressure-monitor:local
pnpm smoke:payables-pressure-monitor:local
pnpm smoke:policy-covenant-threshold-monitor:local
pnpm smoke:monitor-demo-replay:local
pnpm eval:finance-discovery-quality
```

## Pivot-foundation baseline

On the current Pocket CFO branch, the F0 guidance reset and Pocket CTO archive placement are already in place.
Do not rerun the prep-pack apply sequence here as if it were still the active next step.

If you need to port the same reset onto an older branch, follow the documented sequence in `plans/FP-0001-pocket-cfo-pivot-foundation.md` and keep that work scoped to guidance and archive placement only.

## Source-registry-to-finance-twin mindset

For Pocket CFO, local development should move toward a source-registry-to-finance-twin loop:

1. register or upload a source bundle
2. preserve raw files immutably
3. parse deterministically where possible
4. populate the Finance Twin
5. refresh the CFO Wiki
6. run discovery, reporting, and monitoring work only through a named active Finance Plan when one exists; FP-0052 records the shipped F6C collections-pressure monitor slice, FP-0053 records the shipped F6D payables-pressure monitor slice, FP-0054 records the shipped F6E policy/covenant threshold monitor slice, FP-0055 records the shipped F6F monitor demo replay and stack-pack foundation, and FP-0056 records the shipped F6G manual collections-pressure alert investigation handoff only

Today, steps 1 through 5 exist in a narrow form:

- F1 source registration and raw-file ingest are implemented
- F2A trial-balance CSV sync is implemented
- F2B chart-of-accounts CSV sync and account-catalog reads are implemented
- F2C general-ledger CSV sync and persisted journal-entry or journal-line reads are implemented
- F2D additive company snapshot and lineage reads now tie the latest successful implemented finance slices together truthfully
- F2E adds a company-level reconciliation-readiness read that stays explicit about coverage, comparability, and limitations rather than faking a balance reconciliation
- F2F hardens reporting-window truth so reconciliation can distinguish source-declared general-ledger period context from activity-window-only fallback
- F2G adds matched-period account-bridge readiness plus chart-of-accounts-backed unmatched diagnostics without inventing a numeric bridge
- F2H adds balance-bridge-prerequisites reads that stop at explicit missing-proof diagnostics instead of inventing fake bridge numbers or variance
- F2I adds truthful source-backed general-ledger balance proof from explicit opening-balance or ending-balance fields while keeping snapshot alignment notes diagnostic-only
- F2J adds direct balance-proof lineage drill behavior on top of persisted proof rows and proof lineage
- F2K shipped deterministic bank-account-summary ingest plus backend-first bank-account inventory and cash-posture reads without fake FX conversion, transaction detail, or bank reconciliation
- F2L shipped deterministic receivables-aging ingest plus backend-first receivables-aging and collections-posture reads without fake invoice detail, expected cash timing, reserve logic, or DSO
- F2M shipped deterministic payables-aging ingest plus backend-first payables-aging and payables-posture reads without fake bill detail, expected payment timing, reserve logic, or DPO
- F2N shipped deterministic contract-metadata ingest plus backend-first contract inventory and obligation-calendar reads without clause parsing, legal interpretation, payment forecasting, or covenant logic
- F2O shipped deterministic card-expense ingest plus backend-first spend-item inventory and spend-posture reads without fake policy scores, reimbursement inference, accrual logic, or payment forecasting
- broad F2 Finance Twin breadth is now shipped through F2O, the final F2 closeout and handoff are recorded in `plans/FP-0024-final-f2-exit-audit-and-polish.md` and `plans/FP-0025-final-f2-handoff-and-plan-chain-polish.md`
- the packaged `pnpm smoke:finance-twin:local` path proves the trial-balance sync from stored raw bytes
- the packaged `pnpm smoke:finance-twin-account-catalog:local` path proves persisted account-catalog state
- the packaged `pnpm smoke:finance-twin-general-ledger:local` path proves persisted general-ledger journal state from stored raw bytes
- the packaged `pnpm smoke:finance-twin-snapshot:local` path proves mixed-slice snapshot and lineage drill behavior from persisted state
- the packaged `pnpm smoke:finance-twin-reconciliation:local` path proves reconciliation-readiness, explicit basis semantics, and general-ledger activity lineage drill behavior from persisted state
- the packaged `pnpm smoke:finance-twin-period-context:local` path proves explicit source-declared general-ledger period-context capture and period-scoped reconciliation truth from persisted state
- the packaged `pnpm smoke:finance-twin-account-bridge:local` path proves matched-period account-bridge readiness, explicit unmatched diagnostics, and activity-lineage drill-through from persisted state
- the packaged `pnpm smoke:finance-twin-balance-bridge-prerequisites:local` path proves blocked balance-bridge prerequisites, explicit missing-proof diagnostics, and no-fake-variance behavior from persisted state
- the packaged `pnpm smoke:finance-twin-source-backed-balance-proof:local` path proves explicit opening-balance or ending-balance fields can light up truthful per-account balance proof from persisted state
- the packaged `pnpm smoke:finance-twin-balance-proof-lineage:local` path proves proof-bearing account rows can drill directly to the persisted balance-proof row and lineage from persisted state
- the packaged `pnpm smoke:finance-twin-bank-account-summary:local` path proves stored raw bank-summary CSV bytes sync into persisted bank-account inventory and truthful cash-posture state
- the packaged `pnpm smoke:finance-twin-receivables-aging:local` path proves stored raw receivables-aging CSV bytes sync into persisted receivables-aging inventory and truthful collections-posture state
- the packaged `pnpm smoke:finance-twin-payables-aging:local` path proves stored raw payables-aging CSV bytes sync into persisted payables-aging inventory and truthful payables-posture state
- the packaged `pnpm smoke:finance-twin-contract-metadata:local` path proves stored raw contract-metadata CSV bytes sync into persisted contract inventory and truthful obligation-calendar state
- the packaged `pnpm smoke:finance-twin-card-expense:local` path proves stored raw card-expense CSV bytes sync into persisted spend-item inventory and truthful spend-posture state
- F3A shipped the backend-first CFO Wiki foundation for one company: deterministic compile runs, compiler-owned pages, page links, page refs, and route-backed reads for `index.md`, `log.md`, `company/overview.md`, `periods/<periodKey>/index.md`, and `sources/coverage.md`
- the packaged `pnpm smoke:cfo-wiki-foundation:local` path proves a trial-balance-backed Finance Twin sync can compile and read back the deterministic F3A wiki surface without runtime-codex, document-body parsing, or vector search
- F3B shipped explicit company-scoped document bindings plus deterministic markdown or plain-text source digest pages, persisted document extracts, and route-backed backlinks while unsupported PDFs or fileless snapshots remain visible as gaps
- the packaged `pnpm smoke:cfo-wiki-document-pages:local` path proves one company can bind document sources, compile current plus superseded source digest pages, and read back extracted versus unsupported coverage without runtime-codex, OCR, or vector search
- F3C adds persisted wiki lint runs and findings, deterministic markdown-first export runs, and an ownership-safe filed artifact seam that preserves filed pages across later compiler-owned refreshes
- the packaged `pnpm smoke:cfo-wiki-lint-export:local` path proves one company can preserve a filed artifact page across recompile, persist deterministic lint findings from stored wiki state, and read back a deterministic markdown export bundle without runtime-codex, vector search, or OCR
- F3D adds deterministic concept pages, metric-definition pages, and policy pages from fixed registries plus explicit `policy_document` bindings while unsupported policy extracts remain visible as gaps
- the packaged `pnpm smoke:cfo-wiki-concept-metric-policy:local` path proves one company can sync supported cash coverage, compile deterministic concept and metric-definition pages, and read back supported plus unsupported policy pages without runtime-codex, OCR, or vector search
- F4A adds one deterministic mission-based finance discovery answer path for `cash_posture`, backed only by stored Finance Twin and stored CFO Wiki state, with a durable answer artifact and a finance-ready proof bundle
- the packaged `pnpm smoke:finance-discovery-answer:local` path proves one company can sync bank-account-summary coverage, compile related wiki pages, run `POST /missions/analysis`, and read back the persisted finance answer plus finance-ready proof bundle without runtime-codex, vector search, OCR, or deep-read dependencies
- F4B widens that deterministic finance-discovery path to the truthful stored-state families `collections_pressure`, `payables_pressure`, `spend_posture`, and `obligation_calendar_review` while keeping policy lookup, aging-review families, runtime-codex, OCR, vector search, and deep-read dependencies out of scope
- the packaged `pnpm smoke:finance-discovery-supported-families:local` path proves one company can sync the existing cash, receivables-aging, payables-aging, card-expense, and contract-metadata source families, compile the related wiki pages, run `POST /missions/analysis` for each shipped supported family, and read back deterministic finance answers plus finance-ready proof bundles without runtime-codex, vector search, OCR, or deep-read dependencies
- the packaged `pnpm smoke:finance-memo:local` path proves one completed discovery mission can seed `POST /missions/reporting`, persist one draft `finance_memo` plus one linked `evidence_appendix`, refresh the reporting proof bundle truthfully, and carry forward stored freshness plus limitations without runtime-codex, release workflow, packet specialization, PDF export, or slide export
- the packaged `pnpm smoke:board-packet:local` path proves one completed reporting mission with stored `finance_memo` plus stored `evidence_appendix` can seed `POST /missions/reporting/board-packets`, persist one draft `board_packet`, keep proof readiness tied to that one stored artifact, and stay deterministic, runtime-free, release-free, approval-free, lender-free, diligence-free, PDF-free, and slide-free
- the packaged `pnpm smoke:lender-update:local` path proves one completed reporting mission with stored `finance_memo` plus stored `evidence_appendix` can seed `POST /missions/reporting/lender-updates`, persist exactly one draft `lender_update`, keep proof readiness tied to that one stored artifact, reuse source memo plus appendix linkage, and stay deterministic, runtime-free, release-free, approval-free, diligence-free, PDF-free, and slide-free
- the packaged `pnpm smoke:diligence-packet:local` path proves one completed finance-memo reporting mission with stored `finance_memo` plus stored `evidence_appendix` can seed `POST /missions/reporting/diligence-packets`, persist exactly one draft `diligence_packet`, keep proof readiness tied to that one stored artifact, reuse source memo plus appendix linkage, and stay deterministic, runtime-free, release-free, approval-free, filing-free, export-free, PDF-free, and slide-free
- the packaged `pnpm smoke:finance-report-filed-artifact:local` path proves the first real F5B stored -> filed -> exported reporting path: read-only memo and appendix bodies in mission detail, explicit mission-centric filing into deterministic CFO Wiki filed-page keys, markdown export reuse through the existing company export seam, and truthful stored-vs-filed-vs-exported posture across mission detail, mission list, and proof-bundle surfaces without runtime-codex, release workflow, packet specialization, PDF export, or slide export
- the packaged `pnpm smoke:lender-update-release-approval:local` path proves one completed `lender_update` reporting mission can request and resolve one persisted `report_release` approval through the existing approvals bounded context even when live control is unavailable, derive `not_requested` -> `pending_review` -> `approved_for_release` posture across mission detail, mission list, proof bundle, and approval cards, and still avoid actual release, runtime-codex, PDF, and slide behavior
- the packaged `pnpm smoke:lender-update-release-log:local` path proves that same approved lender-update path can record one operator-entered external release log on the existing `report_release` approval seam, surface `releaseRecord` posture across mission detail, mission list, proof bundle, and approval cards, and still avoid system delivery, runtime-codex, PDF, and slide behavior
- F4C1 adds one deterministic source-scoped `policy_lookup` family that requires explicit `policySourceId`, answers only from the scoped policy page plus related bound-source extract posture, and persists truthful limited answers when the latest bound policy extract is missing, unsupported, or failed
- the packaged `pnpm smoke:finance-policy-lookup:local` path proves one company can bind policy-document sources, compile scoped policy pages, run `POST /missions/analysis` for both extracted and unsupported `policy_lookup` missions, and read back deterministic source-scoped answers plus finance-ready proof bundles without runtime-codex, generic retrieval, OCR, or deep-read dependencies
- the packaged `pnpm smoke:finance-discovery-quality:local` path proves the shipped six-family discovery baseline still renders human-readable freshness, visible limitations, route/wiki evidence, and additive policy source scope across stored answer, mission, list, and proof-bundle surfaces without widening into generic retrieval or runtime-codex
- the finance-native `pnpm eval:finance-discovery-quality` path reuses that deterministic smoke to write a durable eval-style report under `evals/results/finance-discovery-quality/` with git provenance, covered families, per-case quality assertions, and no fake model/provider metadata
- the packaged `pnpm smoke:cash-posture-monitor:local` path proves the first F6A `cash_posture` monitor can persist one source-backed alert result plus alert-card posture for missing-source or coverage-gap state, persist one `no_alert` result for clean bank-account-summary state, preserve the shipped discovery family list, and avoid missions, report artifacts, runtime-codex, outbox delivery, investigation missions, and autonomous finance actions
- the packaged `pnpm smoke:cash-posture-alert-investigation:local` path proves a persisted alerting `cash_posture` monitor result can manually create or open one taskless deterministic investigation mission, repeated create/open returns the same mission, `no_alert` results are rejected, and the handoff stays source-backed, runtime-free, delivery-free, report-free, approval-free, outbox-free, and non-autonomous
- the packaged `pnpm smoke:collections-pressure-monitor:local` path proves the first F6C `collections_pressure` monitor can persist one deterministic monitor result from stored receivables-aging / collections-posture state only, produce alert cards for missing-source, stale/data-quality, coverage-gap, and source-backed overdue-concentration posture, produce `no_alert` for clean supported posture, preserve idempotent run-key behavior, carry source lineage/freshness/limitations/proof/human-review posture, and avoid automatically created missions, report artifacts, approvals, outbox delivery, runtime-codex threads, notifications, investigations, and autonomous finance actions
- the packaged `pnpm smoke:payables-pressure-monitor:local` path proves the F6D `payables_pressure` monitor can persist one deterministic monitor result from stored payables-aging / payables-posture state only, produce alert cards for missing-source, stale/data-quality, coverage-gap, source-backed overdue-concentration, and conflicting/partial-basis posture, produce `no_alert` for clean supported posture, preserve idempotent run-key behavior, carry source lineage/freshness/limitations/proof/human-review posture, and avoid missions, report artifacts, approvals, outbox delivery, runtime-codex threads, notifications, investigations, payment instructions, vendor-payment recommendations, delivery, and autonomous finance actions
- the packaged `pnpm smoke:policy-covenant-threshold-monitor:local` path proves the F6E `policy_covenant_threshold` monitor can persist one deterministic monitor result from stored CFO Wiki policy-document posture plus explicit comparable Finance Twin posture only, fail closed for missing policy sources, no exact grammar, unsupported metrics, and unsupported units, produce source-backed threshold breach posture only when explicit and comparable, produce `no_alert` for clean supported posture, preserve idempotent run-key behavior, carry source lineage/freshness/limitations/proof/human-review posture, and avoid missions, report artifacts, approvals, outbox delivery, runtime-codex threads, notifications, investigations, legal or policy advice, payment instructions, vendor-payment recommendations, delivery, and autonomous finance actions
- the packaged `pnpm smoke:monitor-demo-replay:local` path proves the demo stack can bootstrap `demo-monitor-stack` from checked-in bank/cash, receivables-aging, payables-aging, and policy threshold sources, run the four shipped monitor families, compare normalized outputs to the expected manifest, prove the shipped cash and collections monitor-investigation handoff boundary, and keep payables and policy/covenant investigations absent while avoiding report artifacts, approvals, delivery/outbox events, runtime-Codex threads, payment instructions, new monitor families, and new discovery families
- the packaged `pnpm smoke:collections-pressure-alert-investigation:local` path proves a persisted alerting `collections_pressure` monitor result can manually create or open one taskless deterministic investigation mission, repeated create/open returns the same mission, `no_alert` collections results are rejected, payables and policy/covenant alerts remain rejected, cash alert handoff remains green, and the path stays source-backed, runtime-free, delivery-free, report-free, approval-free, payment-free, legal/policy-advice-free, customer-contact-free, collection-instruction-free, and non-autonomous
- `POST /missions/discovery` may still exist as a deprecated finance-shaped alias for compatibility, but it is not a live repo-scoped engineering discovery create contract and legacy repo payloads should be treated as unsupported

Step 6 now starts from the shipped FP-0050 monitoring record, the shipped FP-0051 alert-to-investigation record, the shipped FP-0052 collections-pressure monitor implementation record, the shipped FP-0053 payables-pressure monitor implementation record, the shipped FP-0054 policy/covenant threshold monitor implementation record, the shipped FP-0055 demo replay record, and the shipped FP-0056 F6G record.
If an unfinished `plans/FP-*.md` file exists, continue that plan.
`plans/FP-0049-board-packet-circulation-note-reset-and-effective-record-hardening.md` is the latest shipped later-F5 reporting record, `plans/FP-0048-board-packet-circulation-actor-correction-and-chronology-hardening.md` is the shipped F5C4H predecessor, `plans/FP-0047-board-packet-circulation-record-correction-and-chronology-foundation.md` is the shipped F5C4G predecessor, and `plans/FP-0046-circulation-log-and-first-board-packet-circulation-record-foundation.md` remains the shipped predecessor for the first board circulation-log path.
`plans/FP-0050-monitoring-foundation-and-first-cash-posture-alert.md` is the shipped first F6A implementation record. `plans/FP-0051-alert-to-investigation-mission-foundation.md` is the shipped first F6B implementation record. `plans/FP-0052-collections-pressure-monitor-foundation.md` is the shipped F6C implementation record. `plans/FP-0053-payables-pressure-monitor-foundation.md` is the shipped F6D implementation record. `plans/FP-0054-policy-covenant-threshold-monitor-foundation.md` is the shipped F6E implementation record. `plans/FP-0055-monitor-demo-replay-and-stack-pack-foundation.md` is the shipped F6F implementation record. `plans/FP-0056-non-cash-alert-investigation-generalization-foundation.md` is the shipped F6G implementation record; do not reopen F4C2, repeat F5A through F5C4I, start F6H or later, or widen beyond manual source-backed collections-pressure alert handoff without a later named Finance Plan.

The active finance-twin read surface is currently backend-first:

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

## GitHub setup is optional

Do not block local development on GitHub App setup unless your active Finance Plan explicitly includes connector work.
For most source-ingest and reconciliation work, GitHub should stay out of the critical path.

## Working with Codex

Open the repo in the Codex app and start from `START_HERE.md`.

Keep one thread per slice, update the active Finance Plan as you work, and prefer narrow validations after each meaningful change.
