# Add the F2N contract-metadata extractor and truthful obligation-calendar read models

## Purpose / Big Picture

This plan implements the next narrow **F2N Finance Twin** breadth slice for Pocket CFO.

The user-visible goal is to add one deterministic `contract_metadata_csv` extractor family on top of the shipped F2A through F2M baseline, persist truthful contract-metadata state from immutable stored raw bytes, and expose backend-first contract inventory plus obligation-calendar reads for one company. Operators should be able to see which contracts exist in the latest successful contract-metadata slice, which explicit fields those sources actually reported, which renewal, expiration, notice, and explicitly scheduled obligation dates are present, what those dates do and do not mean, and how every contract and obligation row traces back to raw-source provenance.

This slice stays intentionally narrow and additive. It does not add clause parsing, PDF or prose legal extraction, contract writes, legal interpretation, covenant logic, payment forecasting, cross-currency company-wide obligation totals, card or expense exports, discovery-answer UX, wiki or report generation, monitoring, controls, connector APIs, or any F3 through F6 implementation. GitHub connector work is explicitly out of scope, and the engineering-twin path remains intact.

## Progress

- [x] 2026-04-12T20:59:16Z Complete preflight against fetched `origin/main`, confirm `HEAD` matches fetched `origin/main`, confirm the exact branch name, verify a clean worktree, verify `gh` auth, and verify local Postgres plus object storage availability.
- [x] 2026-04-12T20:59:16Z Read the active repo guidance, roadmap, shipped F2A through F2M Finance Plans, scoped AGENTS files, required ops docs, and inspect the current finance-twin plus source-registry seams before planning.
- [x] 2026-04-12T20:59:16Z Create the active F2N Finance Plan in `plans/FP-0022-contract-metadata-and-obligation-calendar.md` before code changes.
- [x] 2026-04-12T22:10:55Z Implement additive contract-metadata contracts, schema, extractor dispatch, persistence, read models, targeted tests, packaged smoke coverage, and root-doc truthfulness fixes.
- [x] 2026-04-12T22:10:55Z Run the required validation ladder in the requested order, fix only in-scope failures, and confirm every required command is green before commit, push, or PR work.
- [ ] 2026-04-12T20:59:16Z Create the one requested local commit, push `codex/f2n-contract-metadata-and-obligation-calendar-local-v1`, verify the remote head, and create or report the PR into `main`.

## Surprises & Discoveries

The current repo already has the breadth-slice seams F2N should reuse. `FinanceTwinService` reads stored raw bytes through `SourceFileStorage.read()`, extractor dispatch is family-specific, sync runs persist slice-scoped stats, and bank, receivables, and payables routes already carry route-visible lineage refs and explicit limitations.

The shared finance summary contract still intentionally centers on the earlier finance-twin core, while later breadth slices land as dedicated backend-first reads. F2N should follow that pattern and refresh limitation wording rather than widening the shared summary into a broad contract-analytics surface.

The root active docs are stale after the merged F2M work. `README.md`, `START_HERE.md`, and `docs/ops/local-dev.md` still lag the actual shipped F2A through F2M baseline and the active next slice.

The current per-file source model already makes mixed-source and mixed-date conditions common across breadth reads. F2N should keep shared-source notes diagnostic-only and must not turn them back into blockers in existing or new finance routes.

The finance-twin lineage target-count contract is now broad enough that a couple of older posture specs needed additive zero-value updates for `contractCount` and `contractObligationCount` before workspace-wide typecheck could pass. That was an in-scope ripple from the new persisted contract path rather than a separate cleanup slice.

## Decision Log

Decision: implement exactly one new extractor family named `contract_metadata_csv`.
Rationale: the user explicitly allows one new deterministic finance source family only, and contract metadata is the next truthful breadth slice after bank, receivables, and payables working-capital reads.

Decision: keep F1 raw ingest authoritative and immutable by building F2N only from stored raw bytes, source metadata, persisted sync outputs, and persisted Finance Twin state.
Rationale: the user explicitly forbids using ingest receipt previews, `sampleRows`, or shallow parser summaries for contract or obligation state.

Decision: persist contracts separately from explicit date-bearing obligations.
Rationale: contract identity, weak classifications, counterparties, and contract-level dates are reusable slice facts, while notice, renewal, expiration, and explicitly scheduled obligation dates need their own persisted rows and lineage.

Decision: preserve weak semantics instead of silently upgrading generic labels into stronger legal meaning.
Rationale: the user explicitly forbids inventing clause semantics, inferring terms from filenames or vague text, or upgrading weak source labels into stronger legal conclusions.

Decision: keep obligation-calendar totals currency-bucketed and date-explicit, with no company-wide cross-currency total and no fake as-of unification.
Rationale: the user explicitly forbids cross-currency summing, silent date flattening, fake renewal or due-date inference, payment forecasts, covenant logic, and legal interpretation in this slice.

Decision: treat conflicting duplicate rows inside one contract-metadata slice as extraction failures unless the duplicates are identical after normalization.
Rationale: the user explicitly prefers truthful failure over picking a winner when one source slice contains conflicting claims about the same contract fact or explicit obligation.

Decision: add the new contract inventory and obligation-calendar reads onto `FinanceTwinServicePort` as optional capabilities instead of widening unrelated test doubles outside finance-twin scope.
Rationale: this keeps the diff additive and reviewable inside the finance-twin slice while still wiring the new backend-first routes through the existing app seams.

Decision: GitHub connector work remains out of scope.
Rationale: this slice is finance-twin extraction, provenance, and backend-read work only.

## Context and Orientation

Pocket CFO has already shipped F1 raw source registration and immutable file ingest plus F2A through F2M additive finance-twin slices: trial-balance sync, chart-of-accounts sync, general-ledger sync, snapshot and lineage, reconciliation readiness, reporting-window truth, account-bridge readiness, balance-bridge prerequisites, source-backed balance proof, balance-proof lineage drill, bank-account inventory, cash posture, receivables-aging, collections posture, payables-aging, and payables posture.

The repo already provides the seams F2N should reuse:

- `packages/domain/src/finance-twin.ts` for pure finance-twin contracts and route schemas
- `packages/db/src/schema/finance-twin.ts` plus `packages/db/drizzle/**` for additive persisted finance state
- `apps/control-plane/src/modules/finance-twin/` for extractor dispatch, persistence orchestration, latest-successful slice reads, lineage, diagnostics, and route transport
- `apps/control-plane/src/modules/sources/**` for immutable raw-source registration, storage, and metadata lookup
- `apps/control-plane/src/bootstrap.ts`, `apps/control-plane/src/lib/types.ts`, `apps/control-plane/src/lib/http-errors.ts`, `apps/control-plane/src/app.ts`, and `apps/control-plane/src/test/database.ts` for wiring and regression coverage
- `tools/` and root `package.json` for packaged local smoke proofs

GitHub connector work is out of scope. The engineering twin remains in place and must keep its reproducibility tests green unchanged. Replay behavior is unchanged in this slice, but provenance, freshness, diagnostics, route-visible limitations, and evidence-bundle wording are first-class because F2N adds operator-visible contract and obligation evidence surfaces.

## Plan of Work

Implement this slice in six bounded passes.

First, extend the finance-twin domain contracts with one new extractor key plus additive contract and obligation record schemas, a latest-successful contract-metadata slice summary, one contract inventory view, and one obligation-calendar view. Keep the contracts explicit about weak versus strong semantics, known-versus-unknown dates, currencies, lineage refs, freshness, diagnostics, and limitations.

Second, add the smallest additive DB schema needed for persisted contracts and explicit obligation rows. Keep the schema additive-first, preserve explicit lineage through `finance_twin_lineage`, and avoid clause tables, legal text extraction, or broader contract-lifecycle redesign.

Third, add one deterministic `contract_metadata_csv` extractor and wire it into finance-twin extractor dispatch. The extractor should only accept explicit recognized headers, preserve weak labels, fail truthfully on conflicting duplicate contract or obligation facts inside one slice, and avoid inferring missing terms.

Fourth, extend the finance-twin repository and service seams so contract-metadata sync persists contracts and obligations transactionally, stores slice stats on sync runs, and assembles latest-successful contract inventory plus obligation-calendar reads from persisted state only.

Fifth, expose the new backend-first routes with thin transport code and focused assemblers. The contract route should surface contract rows, explicit reported fields, and lineage refs. The obligation-calendar route should surface truthful upcoming obligations, currency buckets, coverage summaries, diagnostics, freshness, and limitations without cross-currency totals, fake due dates, fake renewal inference, legal interpretation, covenant logic, or payment forecasting.

Sixth, update focused tests, add one packaged local contract-metadata smoke, and repair the stale root docs plus in-scope limitations copy so merged F2M baseline and active F2N guidance are truthful again.

## Concrete Steps

1. Keep `plans/FP-0022-contract-metadata-and-obligation-calendar.md` current throughout the slice, updating `Progress`, `Decision Log`, `Surprises & Discoveries`, and `Outcomes & Retrospective` after meaningful milestones.

2. Extend `packages/domain/src/finance-twin.ts` and `packages/domain/src/index.ts` to cover:
   - `contract_metadata_csv` in the extractor-key enum
   - additive `FinanceContractRecord`
   - additive `FinanceContractObligationRecord`
   - additive lineage target kinds for `contract` and `contract_obligation`
   - additive contract and obligation route contracts that preserve weak source semantics
   - one latest-successful contract-metadata slice shape
   - one contract inventory view
   - one obligation-calendar view with currency buckets, coverage summary, diagnostics, and limitations

3. Add additive DB schema under `packages/db/src/schema/finance-twin.ts` and export it from `packages/db/src/schema/index.ts`.
   The narrow expected persisted shape is:
   - `finance_contracts`
   - `finance_contract_obligations`
   - additive columns or JSON fields needed for explicit dates, weak classifications, currencies, and source-backed row identity

4. Generate or author the forward-only migration under `packages/db/drizzle/` and update `packages/db/drizzle/meta/` as needed.
   Keep the change additive-first and do not mutate or delete existing finance or engineering tables.

5. Extend `apps/control-plane/src/modules/finance-twin/` with bounded modules that keep routes thin, likely including:
   - `contract-metadata-csv.ts`
   - `contract-metadata-csv.spec.ts`
   - `contracts.ts`
   - `obligation-calendar.ts`
   - repository and mapper additions for contract plus obligation persistence and reads
   - route and schema additions for the new GET endpoints

6. Preserve raw-source authority by building contract-metadata sync only from stored raw bytes, source metadata, sync runs, and persisted lineage.
   Do not derive contract state from ingest receipts, source previews, sample rows, filename semantics alone, or other finance slices.

7. Implement minimum extractor behavior that accepts likely headers for:
   - contract identity: `contract_id`, `contract`, `contract_name`, `agreement`, `agreement_name`
   - counterparty identity: `counterparty`, `customer`, `vendor`, `supplier`, `partner`
   - weak classifications: `contract_type`, `agreement_type`, `status`
   - dates: `start_date`, `effective_date`, `end_date`, `expiration_date`, `renewal_date`, `notice_deadline`, `next_payment_date`, `as_of`, `report_date`, `snapshot_date`
   - amount and currency: `amount`, `payment_amount`, `currency`, `currency_code`
   - helpers: `auto_renew`, `renews_automatically`

8. Keep extractor truthfulness strict:
   - no inference from filenames or vague text
   - no PDF or prose clause parsing
   - no fake renewal, notice, expiration, or payment obligations when explicit fields are absent
   - generic labels remain generic
   - conflicting duplicate rows for the same contract fact or obligation fact in one slice fail
   - identical duplicates may be deduped deterministically
   - missing dates remain explicit rather than synthesized

9. Add route behavior for:
   - `GET /finance-twin/companies/:companyKey/contracts`
   - `GET /finance-twin/companies/:companyKey/obligation-calendar`

10. Route-visible contract rows should include at minimum:
    - contract identity
    - counterparty
    - weak classification or status fields when reported
    - explicit contract-level dates
    - explicit amount and currency when reported
    - auto-renew helper fields when explicit
    - lineage ref or direct proof of source-row provenance

11. Route-visible obligation-calendar output should include at minimum:
    - company
    - latest successful contract-metadata slice
    - freshness
    - upcoming obligations
    - currency buckets
    - coverage summary
    - diagnostics
    - limitations

12. Keep obligation-calendar truth conservative:
    - no cross-currency company total
    - no fake as-of unification when dates differ
    - no inferred payment cadence
    - no legal interpretation or covenant logic
    - no obligation rows emitted unless a date-bearing obligation field is explicit
    - mixed dated and undated contracts remain explicit

13. Add or update focused tests covering:
    - `contract_metadata_csv` extraction from raw bytes
    - ambiguous field handling without silent strengthening
    - explicit obligation-calendar behavior
    - no-fake-obligation inference behavior
    - no-cross-currency-summing behavior
    - conflicting duplicate-row failure
    - lineage refs or route-visible source-row provenance
    - route-level contracts and obligation-calendar behavior in `src/app.spec.ts`

14. Add `tools/finance-twin-contract-metadata-smoke.mjs` and a root script in `package.json`.
    The packaged proof should show that:
    - a stored raw contract-metadata CSV syncs through the finance twin
    - contract inventory is read from persisted state
    - obligation calendar stays explicit about currencies, dates, and limitations
    - missing dates do not produce invented obligations
    - lineage is drillable back to source, snapshot, and source-file boundaries

15. Update the stale active docs in:
    - `README.md`
    - `START_HERE.md`
    - `docs/ops/local-dev.md`
    - `plans/FP-0021-payables-aging-and-payables-posture.md` only if a tiny merged-status note is strictly necessary
    - `apps/control-plane/src/modules/finance-twin/summary.ts` for truthful route-visible limitations copy if needed

16. Run validation in this exact order:

```bash
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/finance-twin/contract-metadata-csv.spec.ts src/modules/finance-twin/extractor-dispatch.spec.ts src/modules/finance-twin/drizzle-repository.spec.ts src/modules/finance-twin/service.spec.ts src/app.spec.ts
pnpm --filter @pocket-cto/domain exec vitest run src/finance-twin.spec.ts
pnpm --filter @pocket-cto/db exec vitest run src/schema.spec.ts
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
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

17. If and only if every required validation command is green, create exactly one local commit:

```bash
git commit -m "feat: add finance twin contract metadata"
```

18. If fully green and edits were made, confirm the branch remains `codex/f2n-contract-metadata-and-obligation-calendar-local-v1`, show `git branch --show-current`, `git log --oneline -3`, and `git status --short --untracked-files=all`, push that exact branch, verify the remote head, and create or report the PR into `main` with the requested title and body.

## Validation and Acceptance

Required validation order:

```bash
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/finance-twin/contract-metadata-csv.spec.ts src/modules/finance-twin/extractor-dispatch.spec.ts src/modules/finance-twin/drizzle-repository.spec.ts src/modules/finance-twin/service.spec.ts src/app.spec.ts
pnpm --filter @pocket-cto/domain exec vitest run src/finance-twin.spec.ts
pnpm --filter @pocket-cto/db exec vitest run src/schema.spec.ts
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
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Acceptance evidence for this slice is:

- a deterministic `contract_metadata_csv` extractor exists and syncs from stored raw source bytes rather than shallow ingest summaries
- persisted Finance Twin state includes real contract and obligation rows
- `GET /finance-twin/companies/:companyKey/contracts` returns route-backed persisted state for one company
- `GET /finance-twin/companies/:companyKey/obligation-calendar` returns route-backed persisted state for one company
- route-visible lineage remains explicit through source, snapshot, and source-file boundaries for the new contract path
- obligation-calendar dates, totals, currencies, coverage summaries, and limitations stay truthful
- existing F1 ingest behavior, F2A through F2M behavior, and engineering-twin reproducibility remain green
- root active docs are truthful now that F2M is merged and F2N is the active next slice

## Idempotence and Recovery

The new extractor and read models are idempotent at the source-file sync boundary. Re-syncing the same stored source file should produce the same persisted contract and obligation facts, the same lineage structure, and the same latest-successful contract-metadata slice state.

If schema changes are required, apply the additive migration first to both the local development database and the derived test database before DB-backed tests. If migration or sync fails, fix the in-scope issue and rerun the same command; do not delete existing finance or engineering data as a shortcut.

If duplicate-row conflicts appear during extraction, the truthful recovery path is to fail the slice and preserve the prior latest-successful contract-metadata state until the source is corrected or the extractor logic is safely updated. Do not pick a winner or silently coerce conflicting facts.

## Artifacts and Notes

Expected code and proof artifacts for this slice:

- additive domain contracts and route schemas in `packages/domain/src/finance-twin.ts`
- additive DB tables and migration files under `packages/db/src/schema/finance-twin.ts` and `packages/db/drizzle/**`
- bounded extractor, repository, service, formatter, and route changes under `apps/control-plane/src/modules/finance-twin/`
- one new local smoke at `tools/finance-twin-contract-metadata-smoke.mjs`
- truthful active-doc updates in `README.md`, `START_HERE.md`, `docs/ops/local-dev.md`, and in-scope limitations wording

No new environment variables are expected for F2N. No `WORKFLOW.md`, stack-pack, or skill changes are expected beyond using the required repo skills during implementation.

## Interfaces and Dependencies

Primary interfaces affected by this slice:

- `FinanceTwinExtractorKeySchema` and related domain contracts in `@pocket-cto/domain`
- additive DB schema exports in `@pocket-cto/db`
- finance-twin extractor dispatch, repository persistence, service reads, and Fastify routes in `@pocket-cto/control-plane`
- packaged local smoke scripts wired through root `package.json`

Key dependencies and seams:

- raw source bytes come from the existing source-registry storage layer
- source, snapshot, and source-file metadata come from the existing source repository and service
- finance-twin lineage continues to use persisted `finance_twin_lineage` rows rather than route-local reconstruction
- evidence-bundle implications are wording- and truthfulness-focused in this slice because the new routes expose provenance, freshness posture, diagnostics, and limitations that downstream evidence surfaces may reuse later

## Outcomes & Retrospective

Implemented F2N as one additive finance source family: deterministic `contract_metadata_csv` extraction from stored raw bytes, persisted `finance_contracts` and `finance_contract_obligations` state, route-backed contract inventory, route-backed obligation calendar, and explicit lineage refs through source, snapshot, and source-file boundaries.

The extractor stays conservative by design. It accepts a narrow alias set for contract identity, counterparties, classifications, dates, amounts, currencies, and auto-renew helpers; fails on conflicting duplicate facts; dedupes identical duplicates; never upgrades weak labels into stronger legal semantics; never infers obligations from missing dates or payment cadence; and keeps generic `end_date` and generic contract `amount` fields weakly labeled rather than silently strengthening them.

The backend-first read layer now answers the narrow truthful questions this slice set out to unlock:

- which contracts exist in the latest successful contract-metadata slice
- which explicit contract facts the source actually reported
- which renewal, notice, end-date, and explicitly scheduled payment dates are present
- which obligation amounts are explicit and which remain null
- how much of the posture is mixed across currencies or missing observation dates
- how each route row drills back to persisted provenance

Root active docs are now truthful again for the merged F2M state and the active F2N guidance. The new packaged local proof `pnpm smoke:finance-twin-contract-metadata:local` demonstrates stored-raw-byte sync, persisted contract reads, truthful obligation-calendar behavior, and drillable lineage.

Validation completed successfully with the full requested ladder, including:

- targeted control-plane finance-twin specs
- domain and DB specs
- existing finance smokes for source ingest plus F2A through F2M breadth reads
- the new contract-metadata smoke
- unchanged engineering-twin sync specs
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

Remaining work at this stopping point is operational only: create the single requested commit, push the exact branch, verify the remote head, and create or report the PR into `main`.
